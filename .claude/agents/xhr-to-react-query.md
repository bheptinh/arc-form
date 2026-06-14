---
name: xhr-to-react-query
description: Use this agent when migrating R2D XHR calls to React Query — for data fetching (queries), mutations (delete/rename/copy), side-effect wiring (bridges), and cleaning up URL_* entries from index.html.
---

You are working inside the **2d-planner** codebase — a React shell around the R2D engine (roomtodo.com). All vendor files (`client/src/vendor/plannercore.js`, `user.js`) are owned and editable. The R2D engine makes XHR calls via `R2D.URL.*` constants defined in `client/index.html`. The migration goal is to replace those XHR calls with React Query fetch helpers and move side effects into the correct layer.

---

## 1. Data queries — replacing R2D XHR reads with React Query cache

R2D vendor files can import directly from the app. Where R2D made XHR calls to read data (languages, translations, user profile), replace them by reading from the React Query cache synchronously:

```js
// client/src/vendor/user.js
import { queryClient } from '../api/queryClient.js';

me.load = () => new Promise((resolve, reject) => {
    const data = queryClient.getQueryData(['translation']);
    if (!data) { reject({ message: 'Translation not in React Query cache' }); return; }
    resolve(data);
});
```

`main.tsx` calls `queryClient.ensureQueryData(...)` before `planner.init()`, so the cache is always populated when vendor `load()` functions run.

For R2D globals that were fetched via XHR, replace with a cache-backed getter:

```js
// client/src/vendor/plannercore.js
import { queryClient } from '../api/queryClient.js';

Object.defineProperty(R2D, 'languages', {
    get: () => queryClient.getQueryData(['languages']) ?? [],
    set: (_v) => {},
    configurable: true,
});
```

**Checklist when migrating a query:**
1. Add a `queryOptions` object in `client/src/api/` (e.g. `languagesQueryOptions`, `userQueryOptions`)
2. Call `queryClient.ensureQueryData(...)` in `main.tsx` before `planner.init()`
3. Replace the R2D `load()` / XHR call with `queryClient.getQueryData(...)`
4. Remove the corresponding `URL_*` entry from `client/index.html` (see §4)

---

## 2. Mutations — replacing R2D XHR writes with React Query

Add a fetch helper in `client/src/api/projects.ts` (or the relevant domain file):

```ts
export async function renameProject(id: string, name: string): Promise<void> {
  const res = await fetch(`/server-api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`renameProject ${res.status}`);
}
```

### Mutation definition — keep it pure

`useMutation` must contain **only** `mutationFn`. No `onSuccess`, no `onError`, no dispatches, no R2D calls:

```ts
const renameMutation = useMutation({
  mutationFn: ({ id, name }: { id: string; name: string }) => renameProject(id, name),
});
```

### Side effects — useEffect watches mutation.status

All side effects (cache invalidation, Redux dispatch, popup close, toast, postMessage to parent) go in a `useEffect`:

```ts
useEffect(() => {
  if (renameMutation.isSuccess) {
    const { name } = renameMutation.variables!;
    queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
    dispatch(setActivePopup({ name: 'completeMessage', positionX: 'left', data: 'NOTIFY_RENAME_PLAN_COMPLETE' }));
    dispatch(setActiveProjectName(name));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'myPopup' })), 500);
  }
  if (renameMutation.isError) {
    dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
  }
}, [renameMutation.status]);
```

Access the submitted args via `mutation.variables` — don't read them from R2D internal state (`R2D.scene.getProjectName()` etc.), which may be stale.

### Calling the mutation

In the submit handler, call `mutate()` and `return` early so the bottom dispatches (preloader off, close popup) don't run for this path:

```ts
if (popupType == 'rename') {
  renameMutation.mutate({ id: R2D.scene.getProjectId(), name: projectName });
  return;
}
```

**Do not** call `planner.scene.renameProject()` / `user.copyProject()` / `planner.scene.deleteProject()` from React code — those go through R2D XHR and bypass the cache.

---

## 3. Side effects — where they live

| Context | Pattern |
|---|---|
| Inside a React component | `useEffect([mutation.status])` or `useEffect([queryData])` |
| Outside React (cross-cutting) | Bridge in `client/src/api/bridges/` |
| R2D internal state sync | Call `planner.scene.setProjectName(name)` etc. only when R2D reads this state for future saves — and only from within a `useEffect`, never inside `mutationFn` or `onSuccess` |

### Bridge pattern — module-level cache subscriber

Use a bridge when a query update must fire side effects that live outside React components (catalog reload, R2D state reset). Bridges live in `client/src/api/bridges/` and are mounted once in `main.tsx`.

```ts
// client/src/api/bridges/languageBridge.ts
export function setupLanguageBridge() {
  let prev = queryClient.getQueryData(translationQueryOptions.queryKey);
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.action.type === 'success'
        && event.query.queryKey[0] === 'translation') {
      const next = queryClient.getQueryData(translationQueryOptions.queryKey);
      if (next === prev) return;
      prev = next;
      reloadCatalog(); // imperative R2D + Redux side effects
    }
  });
}
```

The `prev` guard skips the initial cache population on startup.

For R2D engine events triggering cache invalidation (not query updates triggering side effects), subscribe to the engine's EventDispatcher instead:

```ts
// client/src/api/bridges/projectsBridge.ts
export function setupProjectsBridge() {
  planner.scene.addEventListener(planner.scene.PROJECTS_UPDATE, () => {
    queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
  });
}
```

R2D-driven saves fire `PROJECTS_UPDATE` → bridge invalidates `['projects']` → React Query re-fetches. React Query mutations that bypass R2D (delete, rename, copy) skip this event and call `invalidateQueries` directly from their `useEffect`.

---

## 4. Cleaning up URL_* from index.html

`client/index.html` contains `R2D.URL = { ... }` with all endpoint constants. Once a URL is fully migrated to React Query and no R2D code calls it anymore, remove it.

**Before removing, verify:**
1. `grep -r "URL_<NAME>" client/src/vendor/` — no hits in plannercore.js or user.js
2. `grep -r "URL_<NAME>" client/src/` — no hits outside index.html itself

**Migrated URLs that can be removed once their R2D callers are confirmed gone:**
- `URL_LOAD_ALL_PLANS` — projects list is fully owned by React Query (`projectsInfiniteQueryOptions`); R2D never calls this
- `URL_RENAME_PLAN` — rename now goes through `renameProject()` fetch helper
- `URL_COPY_PLAN` — copy now goes through `copyProject()` fetch helper
- `URL_DELETE_PLAN` — delete now goes through `deleteProject()` fetch helper

**Keep these — R2D still calls them:**
- `URL_SAVE_PLAN` / `URL_LOAD_PLAN` — R2D owns full scene save/load (fires `PROJECTS_UPDATE`)
- `URL_CONFIG` — R2D calls at startup via `R2D.JSONLoader`
- Any URL still referenced in `plannercore.js` or `user.js`

**Pattern for the removal:**
```html
<!-- before -->
URL_LOAD_ALL_PLANS: '/server-api/projects?',
URL_RENAME_PLAN: '/server-api/projects/',
URL_COPY_PLAN: '/server-api/projects/',
URL_DELETE_PLAN: '/server-api/projects/',

<!-- after: lines deleted -->
```

---

## 5. Existing fetch helpers (do not duplicate)

`client/src/api/projects.ts`:
- `deleteProject(id)` — `DELETE /server-api/projects/:id`
- `renameProject(id, name)` — `PATCH /server-api/projects/:id`
- `copyProject(id, name)` — `POST /server-api/projects/:id/copy`
- `projectsInfiniteQueryOptions` — infinite query for project list

`client/src/api/user.ts`:
- `userQueryOptions`, `patchUser()`

`client/src/api/i18n.ts`:
- `languagesQueryOptions`, `translationQueryOptions`

`client/src/api/favorites.ts`:
- `favoritesQueryOptions` (`staleTime: Infinity`)

Always reuse these — do not add a second fetch for the same endpoint.
