# Set-Tree Feature

**Status: NOT IMPLEMENTED** — route `GET /server-api/catalog/set-tree` does not exist yet.

## What it is

A *material set* is a vendor-curated collection of materials for a specific product slot. Instead of the user browsing the full materials bank, they see only the hand-picked options the designer intended for that slot (e.g. a sofa with 5 specific fabric options).

## When it triggers

`MaterialComponent` (`client/src/components/left_new/parts/dynamicPanel/components/MaterialComponent.tsx:250`) fires a request when a product's material slot has:

```ts
materialsSource.type === "set"   // slot source field
materialsSource.data = <set_id>  // slot set_id field
```

These values come from `getMaterials()` on the R2D scene object, which reads the product slot's `source` and `setId` fields.

### Current blocker

`product_material_slots` has no `set_id` column — so **no catalog product can currently trigger this**. Only user-uploaded models can (via `user_model_slots.set_id`), and only if the uploader sends `setId` in the geometries payload.

## API contract

```
GET /server-api/catalog/set-tree?set_id=<id>
```

### Response shape

```json
{
  "status": "success",
  "products": {
    "set": {
      "text": "Set display name",
      "nodes": [
        {
          "id": "node-1",
          "text": "Category name",
          "icon": "/path/to/preview.jpg",
          "type": "materials",
          "materials": [
            { "id": "mat-uuid", ... }
          ]
        },
        {
          "id": "node-2",
          "text": "Sub-folder",
          "icon": "/path/to/preview.jpg",
          "type": "folder",
          "children": [ /* same shape, recursive */ ]
        }
      ]
    },
    "materials": []
  }
}
```

### Two rendering modes

- **`products.materials` non-empty** → flat list, rendered directly as `catalogMaterialsSets`
- **`products.materials` empty** → `set.nodes` tree, rendered as `catalogSets` (user browses down)

### Node shape

| Field | Type | Notes |
|---|---|---|
| `id` | string | unique node identifier |
| `text` | string | display label |
| `icon` | string | URL path, rendered as `R2D.URL.DOMAIN + icon` |
| `type` | `"materials"` or other | `"materials"` → has `materials[]`; anything else → has `children[]` |
| `materials` | array | present when `type === "materials"`; items need at minimum `id` matching catalog material ids |
| `children` | array | present when type is folder; same node shape, recursive |

## What would be needed to implement

1. Add `set_id` column to `product_material_slots` in `server/schema.sql`
2. Create `material_sets` table (id, name) and `material_set_nodes` table (id, set_id, parent_id, text, icon, type, order)
3. Create a join table or inline `materials` array linking nodes to catalog material UUIDs
4. Add `GET /server-api/catalog/set-tree` route in `server/routes/catalog/index.ts`
5. Populate data — either manually curated or sourced from roomtodo.com under a license agreement

## Components that consume this

- `MaterialComponent.tsx:248` — triggers the fetch, branches on response
- `CatalogSet.tsx` — renders the `catalogSets` node tree
- `CatalogMaterialsSets.tsx` — renders the flat `catalogMaterialsSets` material list
- `SelectedModel.tsx`, `SelectedGroup.tsx` — decide which panel to show based on `lastHistoryElemType`
