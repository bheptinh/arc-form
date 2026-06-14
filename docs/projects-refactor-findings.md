# Projects Refactor — Findings

## Folder conventions (already established)

| Folder | Purpose | Has Redux/R2D? |
|---|---|---|
| `client/src/shared-components/` | Pure UI components — no Redux, no R2D, props-only | No |
| `client/src/smart-components/` | Domain-aware components — may read Redux/R2D | Yes |
| `client/src/components/` | Legacy component tree (layout-bound, per-feature) | Mixed |

New shared project components go into **`client/src/shared-components/projects/`**.

---

## Activity 1 — Shared UI components

### What's duplicated

`ProjectsPage` and `ProjectsPopup` independently implement the same card grid and sort bar with near-identical styles and structure.

| Piece | Page | Popup |
|---|---|---|
| Sort dropdown + direction toggle | ✅ inline | ✅ inline |
| Card shell (white bg, green hover border) | ✅ inline | ✅ inline |
| Card image area + action overlay | ✅ inline (no `<img>`) | ✅ inline (with `<img>`) |
| Card info (name, modified, created) | ✅ inline | ✅ inline |
| `useInfiniteQuery` + flatten pages | ✅ | ✅ |

### Components to extract

**`ProjectSortBar`** (`shared-components/projects/ProjectSortBar.tsx`)
- Pure presentation, no business logic
- Props: `options: { value, label }[]`, `activeLabel`, `direction: 'asc' | 'desc'`, `onOptionSelect(opt)`, `onDirectionToggle()`
- Styles: from popup version (same visual output either way)

**`ProjectCard`** (`shared-components/projects/ProjectCard.tsx`)
- Pure presentation, no business logic
- Props:
  - `item: Project` — source data
  - `actions: { icon: ReactNode, label: string, onClick(e) }[]` — overlay buttons, passed by caller
  - `onClick?` — card click handler
  - `nameContent?: ReactNode` — replaces the name text slot (used by Page for inline rename input)
  - `className?` — so the popup can forward `motion.div` class
- Uses CSS `:hover` for overlay visibility (replaces popup's `onMouseEnter` class toggle)
- Mobile breakpoint: overlay always visible (`opacity:1, pointerEvents:all`) — no touch handling needed inside component
- **Does NOT wrap itself in `motion.div`** — the popup wraps the component in `motion.div` externally for animation

### Callers after extraction

**`ProjectsPopup`**: wraps `<ProjectCard>` in `<motion.div>` for enter/exit animation. Passes actions: Open, Copy, Rename, Share, Delete. Rename dispatches `changeProjectName` popup. Delete dispatches `confirm` popup.

**`ProjectsPage`**: renders `<ProjectCard>` in a plain div. Passes actions: Open, Rename, Delete. Rename uses `nameContent` prop to inject an inline `<input>`. Delete uses `useMutation` directly.

### Fix needed before extraction

`Project` type in `api/projects.ts` is missing `preview?: string`. The popup uses `item.preview` but it's not typed. Add it.

---

## Activity 2 — Project mutations → React Query

### Current state of each project operation

| Operation | Current implementation | Target |
|---|---|---|
| **List** | `useInfiniteQuery(projectsInfiniteQueryOptions)` ✅ | Already done |
| **Delete** (Page) | `useMutation(deleteProject)` ✅ | Already done |
| **Delete** (Popup) | Dispatches `confirm` popup — **broken**: `ConfirmPopup.tsx` is actually `CompleteMessage` toast, no delete call ever fires | `useMutation(deleteProject)` + inline confirm |
| **Rename** (Page) | `useMutation(renameProject)` ✅ | Already done |
| **Rename** (Popup) | Dispatches `changeProjectName` popup → `planner.scene.renameProject(id, oldName, name)` (R2D XHR) | `useMutation(renameProject)` in `ChangeProjectNamePopup` |
| **Copy** | R2D: `user.copyProject()` → `uProjects.copyProject()` XHR | New `copyProject(id, name)` function + `useMutation` |
| **Create/Save** | `planner.scene.saveProject(name)` → `R2D.controller.saveCurrentScene()` (serializes full scene) | Keep R2D-driven — too complex to replace |
| **Load single** | `planner.scene.loadProject(id)` | Keep R2D-driven — loads and hydrates the 3D scene |
| **Projects count** (PayProPopup) | `fetch('/server-api/projects')` raw fetch | `useQuery(projectsInfiniteQueryOptions)` or `useQuery(['user'])` — user profile has `projectCount` |

### Bug discovered

`ProjectsPopup.deleteProject()` dispatches `setActivePopup({ name: 'confirm', type: 'project_delete', data: item })`.  
`ConfirmPopup.tsx` is actually the `CompleteMessage` toast component — it never reads the `confirm` state and never calls delete.  
**Result: deleting a project from the popup silently does nothing.**

### What needs to change

1. **`api/projects.ts`** — add `copyProject(id: string, name: string)` fetch function
2. **`ChangeProjectNamePopup`** — replace `planner.scene.renameProject()` with `useMutation(renameProject)`, remove `dispatch(updatePreloaderStatus(...))` in favour of mutation `isPending`
3. **`ProjectsPopup`** — replace broken `confirm` dispatch with direct `useMutation(deleteProject)` (inline confirmation or remove the confirm step since the popup itself is the confirmation context)
4. **`SetProjectNamePopup`** — for copy path: replace `user.copyProject()` with `useMutation(copyProject)`. Save/create path stays R2D.
5. **`PayProPopup`** — replace raw `fetch('/server-api/projects')` with `useQuery(userQueryOptions)` — `user.projectCount` already has the count

### invalidation

All mutations that change the project list must call:
```ts
queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
```
This is already wired via `projectsBridge.ts` for R2D events. Mutations that bypass R2D must invalidate manually.

---

## Proposed plan order

1. **Activity 1 first** — extract `ProjectCard` + `ProjectSortBar`, update both consumers. Self-contained, no backend changes.
2. **Activity 2 second** — fix delete bug, migrate rename + copy to React Query. Touches more files but each change is isolated to one popup.
