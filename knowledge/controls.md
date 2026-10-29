# Navigation and URL controls

Walk inside: drag to look, including upward; double-click visible floor to glide there. WASD also moves; arrow keys move/turn. Movement respects modeled walls. Move closer to a turn before selecting floor around the corner. Orbit, Floor plan and Edit retain the editor controls.

The address bar updates approximately every 200 ms. **Copy view link** copies the camera view. It includes mode; local model position x/y/z in metres; yaw/pitch in degrees; the orbit target; ceiling/full-wall state; labels; lighting; measurement guides; and selected object. Back/Forward restores navigation checkpoints. Continuous movement replaces the current history entry.

Open these relative URLs from the site root:

- `#v=1&mode=walk&location=stair2` — back to Stairway 2, looking toward the T.
- `#v=1&mode=walk&location=stair2&look=wall-cabinet` — look at the extinguisher from there.
- `#v=1&mode=edit&object=wall-heater-stair2&focus=1&roof=0` — inspect the heater.
- `#v=1&mode=edit&object=fire-pull-station&focus=1&roof=0` — inspect the pull station.
- `#v=1&mode=edit&object=fire-horn-strobe-stair2&focus=1&roof=0` — inspect the upper alarm.
- `#v=1&mode=edit&object=sprinkler-head-B0&focus=1&roof=0` — inspect a sprinkler record.
- `#v=1&mode=plan&roof=0` — show coverage.

Named locations are `stair2`, `door210`, `junction`, `services`, `west`, `east`, `stair1`. Short commands expand to a complete camera URL. `object` selects a stable component ID; `look` aims at one. URLs change viewing state, never geometry or records. A walking position that is obstructed is adjusted to clear floor.

The component catalog lists IDs, dimensions, evidence notes, identification status and photo references. A selected assembly may include frame/hardware, so its bounds may exceed a door leaf or appliance body.

Undo, arrangements, design variants and editing are browser-local. A view link does not carry local edits. Save project downloads geometry and arrangement data; GLB exports geometry/materials with component records. PNG is a still render. Arbitrary two-point measurement is not implemented.

An agent can read the current URL and these Markdown files without taking a screenshot. Visual checks are still useful for confirming appearance, evidence visibility, or a reported geometry problem. Optional browser WebMCP tools expose context and reversible navigation when supported; ordinary links work independently of that interface.

In Walk inside, Orbit and Floor plan, hover over visible equipment or a door to see its name and a pointer cursor. Click without dragging to open its component details, source images and known identification. Close with Escape or Back to exploring. External references open only through explicit links. The Edit record button opens the existing editor for that component. Floors retain double-click travel; dragging continues to control the camera. Edit mode retains its existing selection/transform controls.
