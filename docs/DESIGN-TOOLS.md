# Design tools

Open **Edit** to use these controls. All changes affect your local arrangement; they do not automatically change the public default house.

## Names and search

Type part of a name into **Search objects**, select a result, then edit **Object name**. Press Enter or leave the field to apply. Names are limited to 80 characters; stable IDs remain unchanged, so renaming does not break saved layouts. Undo restores the old name.

## Materials

Select a group and choose **Material**: limestone, oak, wallpaper, plaster or fabric. **Original finishes** restores the model's original mix of materials. Presets are original procedural textures. The picker affects every opaque part in the group, including trim or props; transparent glass keeps its original material. For one wall face or a specific chair cushion, ask Codex to edit that surface separately.

Presets use existing mesh UVs: pattern scale can vary across differently modeled objects. For a measured tile size or a custom reference texture, use the [material tutorial](TUTORIAL.md). Material choices participate in undo/redo, duplication, saved layouts and model exports.

## Multiple designs

1. Arrange objects and choose finishes.
2. Enter a name such as **Option A** and click **Save named design**.
3. Change the arrangement and save **Option B**.
4. Choose a saved design and click **Load design** to compare.

Saving an existing name replaces that snapshot. Up to 20 designs are stored in this browser for this project. Loading a design can be undone; deleting a saved snapshot is not undoable. Download **Layout** after loading each option if you need a portable backup. Browser data removal can erase snapshots. There is no cloud sync.

## Export measured floor plan

Click **Export measured plan** to download an SVG. Open it in a browser or vector editor; you can print it to PDF using your browser's print controls.

The diagram shows numbered, rotated enclosing footprints of building/furniture assemblies with a dimension schedule. Roof, plants, pool and generic garden details are omitted. It reflects current placements, names and deletions. Width, depth and height are model bounds, including grouped trim or props. Footprints do not show exact openings, internal contours or clear room dimensions. It is a design-review aid, not a construction drawing. Use the [annotated plan workflow](ROOM-LAYOUT-TUTORIAL.md) for exact requested room changes.

## Improved rendering

The viewer uses a prefiltered environment for physically based material reflections and lighting, ACES tone mapping and a 4096-pixel directional shadow map. Adjust daylight and camera position, then use **Save render** for a clean PNG. Environment lighting can improve material appearance but does not replace detailed geometry, physically simulated global illumination or path tracing. The example's trees and some furniture remain illustrative.

For a single backup containing every named design, the model, textures and catalog, use **Save project** / **Open project**. See [Project files](PROJECT-FILES.md).
