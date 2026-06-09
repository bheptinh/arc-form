# Tips System

There are three distinct tip/hint systems in the frontend.

---

## 1. Contextual Floating Tips

One-time tooltip bubbles that overlay the canvas with an arrow pointing to a relevant UI element. Each tip is shown once per session; dismissal marks `showed: true` in Redux. Only shown when `userProfileData.tips != 0` (user preference) and not on mobile.

**Files:**
- `client/src/components/tips/Tip.tsx` — renders a single tip bubble with SVG arrow
- `client/src/smart-components/tips/index.tsx` — wires R2D events → show state → renders tips
- `client/src/redux/features/tips/tipsSlice.ts` — Redux state: `{ status, showed }` per tip key

**Tip inventory:**

| Redux key | Translation key | Position | Trigger |
|---|---|---|---|
| `constructorButtons` (×2) | `TUT_FROM_SCRATCH` + `TUT_UPLOAD_FLOORPLAN` | Left panel at y=135 and y=438 | New plan opened or constructor entered |
| `panorams` | `TUT_CHANGE_PANORAMA` | Left panel at y=116 | `planner.scene.TIPS_PANORAMS` event |
| `selectGroup` | `TUT_CREATE_GROUP` | Canvas center | ≥3 groupable objects placed; MIH drops from catalog |
| `mergeGroupButton` | `TUT_MERGE_GROUP` | Left panel at y=147 | `planner.scene.TIPS_MERGE_GROUP_BUTTON` event |
| `changeWallHeight` | `TUT_CHANGE_WALLS_HEIGHT` | Left panel at y=68 | Constructor transitions to `stateEditing` after making walls/room |
| `saveProject` | `TUT_SAVE_PROJECT` | Top-right at x=47, y=40 | `planner.apiScene.TIPS_SAVE_PROJECT` event (rendered in `Buttons.tsx`) |
| `uploadCustomMat` | `TUT_UPLOAD_MATERIAL` | Left panel at y=135 | `planner.scene.TIPS_UPLOAD_CUSTOM_MAT` event |
| `tipUseTab` | `TUT_USE_TAB` | Cursor position | `planner.apiConstr.USE_TAB_TIP_START/MOVE` events |
| `tipUseEnter` | `TUT_USE_ENTER` | Cursor position | `planner.apiConstr.USE_ENTER_TIP_START/MOVE` events |
| `tipRenderMake` | `TUT_RENDER_MAKE` | Left panel at y=133 | `planner.scene.TIPS_RENDER_MAKE` event |
| `replaceModel` | — | — | Declared in slice but never rendered |

**Dismiss behavior:** Any `mouseup` or `Enter`/`Tab`/`Escape` keypress hides the tip. The "Show tips" checkbox in the tip body calls `user.setProfileData()` to toggle the preference globally.

**Note:** `App.tsx` also renders `selectGroup`, `changeWallHeight`, `uploadCustomMat`, `tipUseTab`, `tipUseEnter`, `mergeGroupButton`, `panorams`, and `tipRenderMake` directly (duplicating `smart-components/tips`). This appears to be a migration in progress — the logic was partially extracted to the smart component but the old inline render in `App.tsx` was not removed.

### Persistence
- `userProfileData.tips` (integer, 0 = disabled) is stored in `users.tips` (SQLite, JSON-encoded), loaded via `GET /server-api/user`.
- The `showed` flag lives only in Redux (in-memory). It resets on page reload — tips can re-appear each session until dismissed.

---

## 2. Bottom Bar Keyboard Hints

Always-visible (or event-triggered) keyboard/mouse shortcut hints at the bottom center of the canvas. Animate in/out with framer-motion. No user preference gating.

**File:** `client/src/components/bottom/Tips.tsx`

| Context | Hints shown |
|---|---|
| `view2d` + furniture/decor | Right-click → drag scene |
| `view2d` + selectedModel/selectedGroup | Arrow keys → move; Ctrl+drag → no snap |
| `view2d` + selectedCover/selectedOtherConstrParts | Arrow keys → move material |
| `view3d` + furniture/decor | Left-click → rotate camera; right-click → drag |
| `view3d` + selectedModel/selectedGroup | Arrow keys → move; Ctrl+drag → no snap |
| `view3d` + selectedWall/selectedCover/selectedOtherConstrParts | Arrow keys → move material |
| `constr` (keyboard helper active) | Arrows+Shift → 1mm (or 1/16"); Arrows+Shift+Ctrl → 10cm (or 1') |
| `constr` (default) | Right-click → drag; Tab → size input (when a wall segment is active) |
| `viewWalk` | WASD → walk; left-click → rotate camera |
| Ruler create / aligner move | Ctrl+drag → no snap |
| Ruler line select / aligner select | Arrow keys → move; Ctrl+drag → no snap |

Driven by: `selectActiveViewMode`, `selectActiveControlPanelMode`, and events `KEYBOARD_HELPER_HIDE`, `BOTTOM_HELPER_TAB_BTN`, `RULER_TIPS_CHANGE` from `planner.apiConstr` / `planner.scene`.

---

## 3. TipsPopup (Keyboard Shortcut Reference)

A modal popup listing all keyboard shortcuts. Accessible via the help button in the left panel (`ControlPanel.tsx` dispatches `setActivePopup({name: 'tipsPopup'})`).

**File:** `client/src/components/popups/TipsPopup.tsx`

Contains inline SVG icons for: Ctrl, Z, Shift, C, V, Delete, Backspace, arrow keys, WASD, Space. The popup content is static (not translation-driven for the key icons, but labels use `translation[]`).
