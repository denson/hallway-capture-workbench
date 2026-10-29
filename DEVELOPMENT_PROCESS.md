# Hallway capture demonstration: preserve the process

The user's demonstration for Mike is the development process and the human effort
required, including mistakes, corrections and the reduction in effort learned from
this first attempt. Do not present the final hallway alone as the demonstration.

Private milestone copies are in `outputs/demo-history/`. Its manifest records file
hashes and the actual artifacts available. Earlier stages have screenshots and/or
self-contained model backups; they are not separate, fully replayable app builds.
The final stage also includes a snapshot of the current application source.
Historical source revisions or elapsed times were not recorded and must not be
invented. The preservation date is not the creation date of every milestone.

## Stages established by this conversation

1. **Initial evidence and capture friction.** The user supplied photographs,
   HEIC/MOV files, an accurate third-floor blueprint corresponding closely to the
   second floor, and a few measurements. Repeated requests for wall coverage and
   hallway measurements made this too burdensome. The user rejected an exhaustive
   survey. A 79-inch tape-measured door height became the principal measured anchor.
2. **Repository correction.** A Blender workflow linked from the initial article
   was reviewed before the user supplied the intended `wit543/image-to-3d-house-editor`
   repository. They are different projects. The notes preserve that distinction.
   The intended approach is to modify the existing editor.
3. **First provisional model.** The blueprint scale bar and photos produced a
   navigable model with approximate exposed services, wall equipment and doors.
   Equipment sizes and inferred routes were estimates. The first draft put the
   user's door on the wrong hallway side and started at the wrong viewpoint.
4. **Navigation refinement.** The user requested Street View-like floor movement.
   Double-click floor travel was added, retaining drag-to-look and keyboard
   movement. The user then requested removal of the on-screen arrow controls.
5. **Spatial correction.** The 210 door and frame moved to the opposite wall,
   together with its wall opening. The cabinet remained beside it and the outlet
   opposite. The default view now starts with the user's back to Stairway 2.
   The position along the hallway remains provisional pending the new video.
6. **Capture-method lesson.** Start future captures with continuous ground-level
   video. Supplement with drone video where available and applicable, and focused
   close-up stills from multiple views for equipment details. The user will capture
   only the hallway from Stairway 2 to the T, one view down each adjoining corridor,
   and a 360 from the stairwell side of the Stairway 2 door. IMG_3462.MOV was supplied and reviewed. Draft 02 corrects 210 to the stair
   branch and grays adjoining corridors. No full stairwell-side coverage is
   established by this clip.
7. **Identification and maintenance planning.** An accessible apartment sprinkler
   can provide a close-up reference. A visually similar hallway head should retain
   the status **Needs confirmation for hallway** until evidence establishes the
   match. Matching appearance alone does not establish interchangeable parts.

## Intended repeatable workflow

Ground video -> optional aerial video -> timestamped reference frames -> rough
spatial model and equipment inventory -> targeted stills and selected measurements
-> reviewed component records -> progressively refined model.

The existing editor is not an automatic video reconstruction engine. The agent
interprets frames and updates authored geometry. Keep observed, plan-derived and
inferred information distinct. Human capture should remain quick; avoid requiring
complete measurements of every surface before producing a draft.

## What Mike should be able to assess

- Original evidence, first draft, user corrections and revised result.
- Capture time, agent work and human review effort, recorded when actually known.
- Which equipment details are confirmed, tentative or unknown, with supporting
  photos/labels and timestamps attached to the individual component.
- Whether a field worker can repeat the capture and Mike can work with the agent
  after setup and training. Aspen Acres and a solar plant were mentioned as
  potential future use cases; no site capture or service has been performed there.

## Intended maintenance walkthrough

A worker could locate a damaged component in the model, inspect reference photos
and an evidence-backed manufacturer/model/part number, review the route and access
space, and plan the visit. Useful access records include the height of the actual
service point above its local floor, the source and confidence of that height,
floor space for access equipment, and obstructions. A model estimate of ceiling
height is not a confirmed sprinkler access height or a ladder specification.

Component metadata fields, timestamped source images, and access-height notes are
implemented in draft 02. A dedicated ladder/access planning interface remains a
product goal; the current app does not select access equipment. The worker makes the access-equipment choice using verified
site information and the equipment's requirements.

## Preservation rule

Keep milestone artifacts immutable. Append new numbered stages when the video is
received, the model is refined, and component details are confirmed. Do not replace
the first draft with its corrected version. Preserve source evidence privately.

## Agreed plan for the incoming hallway video

The user is leaving to record the video. This is the next-work plan, not a report
that footage has been received or analyzed. Do not start reconstructing unseen
footage or introduce further capture requirements while the user is out.

### 1. Receive and index the evidence

- Preserve the original video and any close-up stills in ignored `references/`.
  Record filenames, hashes, available capture metadata, duration, resolution and
  orientation. Preserve originals before extracting anything.
- Extract timestamped frames and a compact contact sheet, adding denser frames
  around slow rotations, equipment close-ups, turns and changes in view. Keep
  frame-to-video provenance. Avoid reviewing every redundant frame.
- Register Stairway 2, the user's door, the T, each corridor overview, and the
  stairwell-side 360 to a simple route ledger. List conflicts explicitly.

### 2. Correct the model and show coverage

- First resolve topology, doorway side and position, the start with back to
  Stairway 2, and the relationship between the T and the captured hallway.
- Use the accurate blueprint and existing measurement anchors. Do not request
  more hallway widths or floor-to-ceiling measurements.
- Refine only the captured hallway and the visible stairwell-side area. Keep the
  two adjoining corridors as gray simplified geometry labeled "Details not
  captured". Preserve the plan footprint and navigation; do not invent detailed
  services for those areas from the two overview shots.
- Save a new milestone after spatial correction, before adding fine equipment
  detail. Keep all four existing milestones intact.

### 3. Add observed equipment progressively

- Match wall fixtures, lights, conduits, sprinkler pipes, junctions, hangers and
  heads across frames. Use multiple views to refine visible geometry and placement.
- Give independently inspectable equipment stable component IDs. Separate a head
  from a larger pipe assembly when it needs its own record.
- Retain approximate geometry where evidence is insufficient. Preserve the
  distinction between observed placement, inferred dimensions and confirmed
  measurement. Produce a short targeted follow-up list only after using the video.

### 4. Build the component detail records

- Extend the existing editor with manufacturer, model, part number, identification
  status, notes, evidence reference/timestamp, and component dimensions or mounting
  height with their source/status. Make these records survive save/reload, project
  backup and export. Preserve existing IDs and saved user edits.
- Use explicit statuses such as Unknown, Tentative, Confirmed, and **Needs
  confirmation for hallway**. An identified apartment head can be a reference;
  the hallway match remains separate until evidence supports it.
- Attach readable markings and source photos to identification claims. Investigate
  candidate parts using manufacturer documentation only after the footage or
  close-ups provide usable identifying evidence. Do not infer replacement
  interchangeability from visual similarity.
- Include an access note and the height of the actual work point when evidenced.
  Keep estimated mounting heights separate from confirmed measurements. Access
  equipment selection remains the worker's decision; there is no current ladder
  recommendation feature.

### 5. Verify and prepare Mike's process demonstration

- Check walking, floor double-click travel, drag-to-look, coverage labels, component
  selection, metadata persistence and exports. Run meaningful tests, type checking
  and the build. Keep the working local viewer open for the user.
- Preserve the video-derived first revision, later detailed revision, model/project
  backups, screenshots and current source as additional numbered milestones.
- Assemble a concise before/after process view: original capture -> first draft ->
  corrections -> detailed component -> unresolved confirmation. Show the actual
  difficulties and what changed in the repeatable video-first capture method.
- Record human capture/review time when known and available processing/work times
  without inventing historical durations. The intended repeatable service uses
  ground video, optional drone coverage, and targeted close-up stills.
- Keep the material local and private. Sending anything to Mike, publishing, and
  work at other sites require their own user request.

### Completion target

A locally usable model of the captured route, clear gray coverage boundaries,
inspectable equipment with evidence-backed detail/status, a concise unresolved-item
list, and preserved stages that let Mike judge the process and human effort.


## Video revision completed

IMG_3462.MOV is 5:28.275 long. Its original is preserved with matching SHA-256.
The review has 55 overview sampling times and 26 larger detail versions. Route
registration corrects the first model's mistaken placement of 210 on the main
corridor. The captured branch is detailed; adjoining corridors remain gray context.
Component records and their video-reference IDs persist through saves and backups.
Part numbers remain unknown unless supported; hallway sprinkler identification
retains Needs confirmation for hallway. Evidence files remain private and local.
The video was reviewed visually; audio was not transcribed.

## Close-up refinement and tour correction

The user supplied two close-ups and confirmed the cabinet holds a fire extinguisher.
The draft's generic glazed cabinet and bare cylinder were replaced with the observed
narrow-window door, handle/hinge, hose and extinguisher details. Exact-product identity
and dimensions remain unverified. The user initially questioned the location, then checked and confirmed it is pretty
correct. This detail refinement retains the assembly placement. Preserve it as the next milestone.

The attempted live tour was too slow and continued after spoken stop requests.
Before another narrated tour, prepare explicit camera stops paired with narration,
with a fast next-stop action and immediate stop behavior. Do not resume the tour
until requested. The cabinet is a fire extinguisher cabinet, not a utility cabinet.

The user requested URL-driven camera control after the failed tour. `TOUR_PLAN.md`
now pairs each stop with a short script and direct view URL. URLs update continuously
and restore camera/selection, avoiding screenshot exchanges for ordinary orientation.
The door audit also removed the unverified mid-branch 208 entrance inherited from
the third-floor drawing; 209 and 210 have video plaque references. Heater side frames
correct the previously embedded enclosure and clarify its projection as an estimate.
