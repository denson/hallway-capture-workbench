# Reusable asset catalog and editable dimensions

## Add an object you deleted

1. Open **Edit** and scroll to **Asset catalog**.
2. Search for a chair, table, wall or other object.
3. Choose its **3D object** entry and click **Add / apply asset**.
4. A new editable instance appears near the asset's saved position. Move it where you want it.

Built-in catalog entries survive deletion from the scene. Deleting an instance does not erase the model source. Added instances get unique IDs and can be undone, copied, saved and exported.

## Save a reusable variant

1. Select an object and adjust its name, finish and size.
2. Enter **Asset name**, then click **Save object**.
3. The named variant remains in the catalog after deleting its scene instances and after reloading the page.

Custom entries retain the source object, dimensions, rotation and chosen preset finish. Up to 200 custom entries are stored in this browser for this house. **Remove saved asset** removes the recipe, not existing scene instances. Built-in entries cannot be removed from the catalog.

## Materials and patterns

The library includes limestone, oak, wallpaper, plaster and fabric. Select a scene object, then click a preset to apply it. Use **Save finish** to keep the selected preset under your own name; choose that finish later and click **Add / apply asset** on another selected object.

This version stores reusable recipes based on the house's existing geometry and material presets. It does not upload arbitrary texture images or import external GLB models, and a saved finish does not capture an arbitrary object's entire mixed-material assembly. Original finishes restore each target's own original materials. Ask Codex to add new source geometry or custom texture assets to the project when needed.

## Resize a chair, table or wall

Select an object, enter a new **Width**, **Depth** or **Height** in metres, and press Enter. Each field controls one axis; proportions are not locked. Rotation does not change the reported dimensions. Height resizing preserves the bottom elevation.

Scaling includes all grouped parts and any openings. It is not a room-layout solver or a furniture manufacturing model. Use **Undo** to reverse a resize. The size is retained by duplication, layout JSON, named designs, catalog variants and GLB export, and walking collision bounds follow the changed size.

## Storage and portability

Catalog recipes stay in local browser storage under the project's namespace. They are not cloud-synced or shared automatically with website visitors. Clearing browser data removes custom recipes. Added scene instances can be backed up using **Layout** JSON, including their size and preset finish, or exported as GLB. The custom catalog list itself is not included in layout JSON. Layout recipes require the same house's source IDs; for a different house, ask Codex to transfer the source asset module too.

Use **Save project** to back up the catalog together with its source model and all designs. **Open project** restores them. See [Project files](PROJECT-FILES.md).
