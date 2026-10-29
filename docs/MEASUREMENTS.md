# Measure objects in 3D

1. Open **Edit**.
2. Click an object or choose it from **Selected object**.
3. Leave **Measurements** on to show dimension lines and labels in the scene.
4. Read or edit **Width**, **Depth**, and **Height** in the panel, in metres. Press Enter or leave the field to resize. The panel values remain available when the scene guides are switched off.

All selectable objects use the same measurement system: furniture, plants, floors, walls, roofs and copies. Values follow the assembly's own axes, so moving or rotating it does not change its dimensions. Zoom in for easier reading of the 3D labels.

## What the numbers mean

| Selection | Interpretation |
| --- | --- |
| Chair | Overall enclosing width, depth and height, including legs and back |
| Table group | Bounds of every part in the group, including decorative props if grouped with it |
| Floor slab | Width, depth and slab thickness; not the room's ceiling height |
| Wall with openings | Overall wall group including trim; openings are not subtracted |
| Roof | Overall roof assembly, not an individual panel |

Curved and irregular objects are enclosed by a box aligned to the object's axes. These are not seat height, circumference, surface area, clear doorway width or room-to-room distances. A two-point ruler and automatic part-specific measurements are not implemented.

Measurements describe the current mesh model. If geometry was estimated from an image, its displayed dimensions remain estimates. Rounded values are shown to two decimal places in metres; this does not imply survey accuracy.

The original courtyard example reports approximately 1.02 × 1.03 × 0.86 m for the reference lounge chair. Your model may differ. Rotating that chair should leave all three readings unchanged.

## Saving and sharing

Measurement guides are viewing aids. They do not change layout data, are excluded from PNG renders, and are not included in the exported GLB. Geometry and its model scale are exported normally. Use a screenshot if you want to share the panel and visible guides.

For measured layout changes, use the [annotated floor-plan tutorial](ROOM-LAYOUT-TUTORIAL.md).

## Resize using dimensions

The fields scale the whole selected assembly along its own axes. Height scaling keeps the bottom at the same elevation. Dimensions must be between 0.01 and 50 metres and within the supported scale range. Undo/redo, saved layouts, named designs, copies and model exports preserve resizing.

This is geometric scaling, not parametric remodeling: legs, trim, patterns and wall openings stretch with the object. Adjoining floors and walls do not automatically follow. Use Codex for architectural layout changes. [Asset catalog guide](ASSET-CATALOG.md).
