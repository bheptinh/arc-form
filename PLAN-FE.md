# FE Plan: React Refactor

## Goal
Make the React codebase idiomatic — typed R2D integration, no imperative DOM
manipulation, no mutable variables leaking across renders, no JSX built in effects.
Do this incrementally: each step is independent and safe to merge alone.

---

## Where to start: R2D TypeScript declarations

Everything else depends on knowing what R2D exposes. Without types, every
refactor is blind. This is step 1 and unlocks all subsequent steps.

---

## Step 1 — Type the R2D namespace

Create `client/src/r2d/index.d.ts` declaring the global `R2D`, `WC` namespaces
based on what the codebase actually uses. Don't try to type all 917 classes —
type only what React code touches:

- `R2D.URL` (all keys from `index.html`)
- `R2D.OPTIONS`
- `R2D.PlannerCore` (methods called via `planner.*`)
- `R2D.UserCore` (methods called via `user.*`)
- `R2D.scene`, `R2D.controller`, `R2D.config`, `R2D.mouseInteractionHelper`
- `R2D.ProductType` enum constants
- `R2D.Viewers`
- `WC.core`

**Verify:** `tsc --noEmit` passes with no `any` on R2D call sites.

---

## Step 2 — `useR2DEvent` hook

Replace the `addEventListener` + `setTimeout(..., 100)` pattern that appears
~50 times in `App.tsx` and components. Currently:

```ts
planner.apiScene.addEventListener('someEvent', e => {
  setTimeout(() => {
    // read R2D state here
  }, 100);
});
```

Replace with:
```ts
// client/src/hooks/useR2DEvent.ts
useR2DEvent(planner.apiScene, 'someEvent', callback, { defer: 100 })
```

The hook handles: listener registration, optional defer, cleanup on unmount.
This eliminates the majority of `setTimeout` calls in `App.tsx`.

---

## Step 3 — Fix mutable `let` vars → `useRef`

Components declare mutable state as `let` inside the function body, which
resets on every render. Affects drag logic in `Products.tsx` and others.

Pattern to find and fix:
```ts
// before — resets every render
let mouseDownOnObj = false;
let selectedObjId = null;

// after — persists across renders
const mouseDownOnObj = useRef(false);
const selectedObjId = useRef<number | null>(null);
```

Files to fix first: `Products.tsx` (most severe, affects drag correctness).

---

## Step 4 — JSX out of `useEffect`

`Products.tsx` builds `modelsList` and `customModelsList` JSX arrays inside
a `useEffect` and stores them as state. This bypasses React reconciliation.

Refactor: delete the effect, move the mapping directly into JSX return,
derive from `lastHistoryElemData` inline. The `useMemo` on the data is fine
to keep for performance.

Also fix `Math.random()` keys → use `elem.id` (already available).

---

## Step 5 — React portals for DOM tooltips

`Products.tsx` creates tooltip `div`s via `document.createElement` and
`document.body.append`. Replace with a single `<Tooltip>` component that
renders via `ReactDOM.createPortal` and is driven by state:

```ts
const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
```

Eliminates the `setTimeout(..., 50)` positioning hacks (the DOM element
doesn't exist yet when positioned — a portal renders in the same React cycle).

---

## Step 6 — Popup animation pattern

Every popup has this pattern:
```ts
const timer = setTimeout(() => setAnimPopupClass(true), 0);
```

This is a `0ms` delay to flush the DOM before adding a CSS class for
enter animation. Replace with `useLayoutEffect`:

```ts
useLayoutEffect(() => setAnimPopupClass(true), []);
```

And popup close (`setTimeout(() => dispatch(closePopup(...)), 500)`) should
use CSS `onAnimationEnd` or `onTransitionEnd` instead of a hardcoded duration.

Apply to: `AlertPopup`, `StartPopup`, `ConfirmPopup`, `PayProPopup`,
`DeleteAccountPopup`, `AlignerWidthSetMetricsPopup`, `Revert3DRotation`,
`UploadChoiceModelPopup`.

---

## Step 7 — R2D abstraction layer (optional, long-term)

Once steps 1–6 are done, any class in `plannercore.js` that needs modification
can be extracted:

1. Delete the class definition from `plannercore.js`
2. Create `client/src/r2d/ClassName.ts` as a proper ES module
3. Import it explicitly

Do this only for classes you actually need to change — not as a bulk migration.
`plannercore.js` stays as a script tag until individual classes need editing.

---

## What not to do

- Don't convert `plannercore.js` to ES modules wholesale — 81k lines,
  internal cross-references everywhere, too much risk for zero benefit
  until you need to change specific behavior
- Don't replace react-jss with another styling system — it works, surgical
  changes only
- Don't rewrite components that aren't being touched — fix bugs as you go
