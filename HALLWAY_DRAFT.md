# Hallway 210 — video-informed draft 02

This adapts the existing Three.js house editor. The scene is real editable geometry;
the original navigation, object editing, history, browser saves and exports remain.
Nothing has been published. Private photographs and the blueprint stay in ignored
`references/`, outside the served website.

## Open it

Double-click `Open-Hallway.cmd`, or run:

```sh
npm ci
npm run setup
npm run dev -- --host 127.0.0.1 --port 5177
```

Open `http://localhost:5177/`. It starts with your back to Stairway 2, looking
toward the corridor junction. Drag to look, including
upward; double-click visible floor to glide to that spot, keeping your viewing
direction and eye height. A green ring marks the destination. WASD and keyboard
arrows also move and interrupt a glide. Movement respects walls and equipment;
move nearer a corner before choosing a point around it. Double-click movement is
available in **Walk inside**; Orbit and Edit retain their existing behavior.
Location shortcuts include the
services bay, both corridor ends and the stair branch. Floor plan and Orbit give
overall views. Switch **Ceiling / full walls** off for a cutaway.

In **Edit**, select a named component to see dimensions, an imperial readout and
its evidence note. Keep all scene editing optional; incoming real measurements
can still be supplied in chat. The existing metric dimension fields resize groups.

## Evidence and calibration

- The user identifies the supplied blueprint as accurate. Its scale bar runs from
  pixel X=916 to X=1066 over 24 ft in the 1280×853 supplied image.
- Calibration: 0.048768 metres per pixel. Local origin is plan pixel (288,335),
  X toward the right and Z down the plan. This is not a geospatial north claim.
- The main corridor and branch use traced raster boundary anchors in
  `lib/hallway-data.ts`. The main run is 31.554 m long at nominal width 1.609 m;
  the Stair 2 branch is 1.512 m wide. The east lobby follows the plan's offset.
  These are derived from a raster plan, not new tape measurements or survey claims.
- The supplied drawing is third floor; the modeled space is second floor. The user
  confirms 310 is directly above 210 and the layouts are very similar. Matching
  plan geometry is retained; unphotographed second-floor differences remain open.
- Apartment 210's leaf height is exactly the supplied 79 in = 2.0066 m. Frame and
  number plate are separate assemblies so they do not inflate the leaf height.
- Door body width uses the existing provisional 34-inch iPhone reading. Overall
  bounds include hinges/hardware. Other doors inherit its proportions as estimates.
- IMG_3462.MOV (328.275 seconds) establishes apartment 210 on the east wall of
  the Stair 2 branch near the stair door. This corrects the earlier main-corridor
  interpretation. The tape-measured leaf height stays 79 inches. The cabinet is
  between 210 and Stair 2, with the outlet opposite. Positions along the wall are
  estimated from the video. Unchanged historical browser placements migrate;
  manually repositioned objects remain intact.
- Floor-to-slab height uses the existing 11 ft 6 in iPhone reading (3.5052 m).
  No new hallway or ceiling measurements are requested.

## What was modeled

The corridor floor, walls and door openings; closed apartment doors with frames,
hinges, lever handles, peepholes and kickplates; the stair exit and brick surround;
elevator door proxy; concrete beams, posts and diagonal braces; black sprinkler
pipes, orange fittings/bolts, hangers and simplified heads; metal conduits and clips;
wall-top cables/ties; round lights and their stems; twin-head emergency light units,
exit signs, round detector housings, a dome camera, outlet and white wall cabinet.

Concrete textures are deterministic procedural approximations, not scans.
The captured branch retains orange walls and exposed services. Both adjoining
corridors and the remote lobby use gray context geometry with no invented detailed
service runs. Their basic footprint follows the supplied blueprint.

The video supplies clear views of the red manual pull station and wall heater near
Stair 2, the white cabinet, grooved pipe junctions, upright pipe ends/heads, ceiling
lights, conduit, loose cables and the camera at the T. Spacing, device sizes and
service-point heights remain estimates. The reviewed video does not establish a
full stairwell-side 360; no stair flights or exterior area have been invented.

## Component records

Two subsequent user close-ups confirm that the white cabinet contains a fire
extinguisher. Its geometry now includes the narrow left viewing window, opaque
white door, left metal pull, right hinge, extinguisher body, hose and ABC label.
Original dimensions remain estimates. Manufacturer/model/part number are unknown;
the exact-product identification stays tentative. After checking, the user confirms
the existing location is pretty correct; the placement is retained.
Both private photos are attached to the component record. Its stable ID remains
`wall-cabinet` for compatibility with saved layouts.

In Edit, select an object and expand **Component record**. Records include
manufacturer, model, part number, identification status, notes, multiple timestamped
video references, additional evidence notes, estimated/measured work-point height,
height source and access notes. **Focus selected component** frames the object from
its front and hides oversized measurement guides; numeric dimensions remain in
the panel. Measurement guides can be turned back on.

## View URLs

The address bar updates every 200 ms while walking, dragging, orbiting, focusing
equipment or changing views. **Copy view link** copies the current view. Reloading
or opening it restores the camera, orientation, orbit target, mode, selected
component, ceiling/wall cutaway, measurement guides, labels and lighting.
Positions use local model metres and yaw/pitch use degrees. Continuous movement
replaces the current history entry; named location/mode changes create checkpoints.
Back/Forward and same-page hash links restore views without reloading the model.

Examples (append to `http://localhost:5177/`):

- `#v=1&mode=walk&location=stair2` — back to Stairway 2, looking toward the T.
- `#v=1&mode=walk&location=stair2&look=wall-cabinet` — stay there and look at the extinguisher.
- `#v=1&mode=edit&object=wall-heater-stair2&focus=1&roof=0` — frame the heater.
- `#v=1&mode=edit&object=sprinkler-head-B0&focus=1&roof=0` — frame the sprinkler.
- `#v=1&mode=plan&roof=0` — coverage overview.

Short commands are expanded to a complete camera URL after application. Links
change viewing state, never component placements or records. They reference this
model; they do not carry its geometry, local edits or private evidence files.
Walking bookmarks are adjusted to clear floor if their position is obstructed.

## Door and heater evidence correction

Video at 00:09 / 02:48 supports 210's plaque, and 01:00 shows 209's plaque on the
opposite side near Stairway 2. Views toward the T at 02:36 / 02:42 show uninterrupted
wall where the model had an additional 208 door inherited from the third-floor plan.
That opening and its door/frame were removed from the captured branch. This does
not establish where apartment 208's actual second-floor entrance lies.

Side views at 02:12 and 02:18 show the heater projecting from the wall. Its authored
body had been partly embedded; the enclosure now projects approximately 20 cm,
still an estimate. Heater/pull-station spacing was refined from the new context
stills so the heater no longer overlaps the extinguisher cabinet. The confirmed
cabinet placement is unchanged. Nearby 209/210 plaques now sit beside their doors.

Sprinkler records start with **Needs confirmation for hallway**, a blank part
number, and an estimated height. The pull station has a visually supported
Honeywell manufacturer entry with tentative identification; its exact model remains
unknown. No manufacturer catalog match or replacement compatibility was asserted.

Records participate in undo/redo, arrangement saves, layouts, project backups and
catalog copies. Export component records produces a JSON inventory. GLB carries
component records in node extras. Source stills remain separate private files;
project JSON retains their reference IDs, not the original video or frame bytes.

Local preview serves only whitelisted review stills using a Vite middleware. They
stay in ignored references/, not public/. This evidence image route is local-only;
it is not packaged for deployment. Keep the private evidence folder with the
project to retain its image previews. Nothing has been published.

## Video evidence and location

The original 397,065,524-byte video was preserved and its SHA-256 verified against
the Downloads original. Review used 55 timestamped overview samples and 26 larger
versions of selected samples, with HDR-to-SDR review conversion. The original HDR
file is unchanged. Audio was not transcribed. Private metadata, extraction manifest,
contact sheets, route ledger and location verification are in
references/video-IMG_3462/. GPS agrees with the Fuel & Iron building location; the
user independently checked Google Maps. It does not locate a floor, device, or
router or identify how the phone obtained the estimate.

## Optional refinement list

No hallway widths or floor-to-ceiling measurements are requested. Only exact
sprinkler markings/an accessible apartment-head comparison, readable equipment
labels, and any already-recorded separate stairwell-side footage remain useful.
The current app lists these three optional follow-ups.

## Dimensions and exports

Measurements enclose every mesh in the selected assembly, using its own axes.
Moving/rotating does not alter its size. Display precision is not physical accuracy.
Source notes identify measured, plan-derived and estimated components; preserve
those distinctions when using a dimension for a real task.

**GLB** carries geometry/materials. The full ceiling is included even when the view
is cut away. **PNG** captures the current camera without edit guides. **Save project**
backs up editable base geometry/textures and arrangement/catalog/design state.
**Layout** contains placements for compatible source IDs, not standalone geometry.
The inherited SVG export is an object-bounds diagram, not a clear-space survey.
Arbitrary two-point measuring is not part of this draft.

## Verification

Run `npm run typecheck`, `npm test` and `npm run build`. Hallway-specific checks cover
scale calibration, 79-inch door height, unique component identities, finite dimensions,
floor-union navigation and passage through the junction. Browser/export results are
recorded separately in ignored `outputs/verification.json` after inspection.

The upstream lockfile is retained. Its dependency audit has pre-existing advisories,
including development-tool/transitive findings. This local prototype is not deployed;
dependency maintenance is separate from the geometry change, not silently forced.
