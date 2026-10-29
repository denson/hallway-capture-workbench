# Copy-paste Codex prompts

**Looking for ideas?** Try the [Three.js examples guide](THREEJS-EXAMPLES.md) and use its prompt to adapt an animation, material or interaction to your project.

**Changing room sizes or walls?** See the [annotated floor-plan tutorial](ROOM-LAYOUT-TUTORIAL.md).


Open a copy of this repository in Codex. Attach the image to the same request; the reference does not need to be committed to GitHub.

**New:** [Illustrated chair, stone and wallpaper tutorial](TUTORIAL.md), with complete prompts, follow-up edits and review steps.

## 1. Image → interactive 3D house

```text
Read AGENTS.md. Use this existing project and my attached image to build a new
interactive 3D house. Reuse its viewer and editor instead of rewriting them.

Match the room arrangement, exterior style, doors, windows, roof, deck and
pool shown in the references. Build real geometry, not a still-image mockup.
Use a unique project ID and title. Keep object IDs stable and furniture grouped
sensibly. Estimate missing measurements and document the assumptions.

Keep orbit, walking, floor-plan view, roof toggle, room shortcuts, daylight,
move/rotate, duplicate/delete, undo/redo, local saving, layout JSON, PNG render
and GLB export working. Ensure usable doorways and update collision volumes.

Use Context7 and relevant skills. Run setup, type checks, tests and the build.
Test the main controls in a browser and fix failures. Show the local viewer.
Keep my image in the ignored references/ folder. Do not publish yet.
```

Useful details to append:

```text
House width: [metres]
House depth: [metres]
Ceiling height: [metres]
Known room measurements: [details]
Keep unchanged: [layout/materials/features]
Style: [minimal / tropical / industrial / other]
```

Leave unknown measurements blank; do not invent exact measurements in the prompt.

## 2. Furniture image → editable object

```text
Use the attached furniture photo to create an approximate 3D object in this
house. Match its shape, proportions and materials. Place it in [room/location]
without blocking the doorway. Keep its parts grouped as one named editable
object, with a stable ID. Make selection, movement, rotation, duplication,
deletion, undo and exports work for it. Preserve the rest of my layout.
Keep the original photo private unless I explicitly ask to publish it.
```

## 3. Change the design

```text
In [room], move [object] to [location] and rotate it [angle] degrees so it faces
[direction/object]. Preserve other changes and update its walking collision
volume. Check that doors and circulation still work. Show the revised result.
```

## 4. Create an image render from the model

```text
Use the actual 3D model to create a rendered view of [room/exterior/whole house].
Use [daylight/golden-hour] lighting, place the camera at [viewpoint], and export
a PNG. Preserve the model geometry and my saved arrangement. This should be
a render of the model, not an unrelated AI-generated image.
```

## 5. Add a feature

```text
Add [feature] to the existing house editor. Reuse its object IDs, grouping,
history, persistence and export system. Preserve existing saved layouts where
possible. Explain any migration needed. Implement meaningful tests and check
the feature in a browser. Keep the change local until I request publication.
```

Included tools now cover preset materials, object dimensions, object names/search and multiple local design snapshots. Ideas to implement separately include custom texture uploads, face-level painting, external GLB furniture import, cloud saving and collaboration.

## 6. Reuse for a different house

```text
Use this template for a separate house based on my new attached image. Keep the
editor framework and reusable furniture modules. Replace the example geometry
and room data, use a new project ID/storage namespace, and keep the previous
house project unchanged. Do not load the old house's layout JSON into this one.
Document estimated dimensions and show a working local preview.
```

## 7. Publish and share

Private publishing:

```text
Publish this finished project privately through ChatGPT Sites. I authorize
uploading the website source and the assets intentionally included in public/.
Do not upload ignored reference images or local secrets. Register a new Site
for this project if it does not already have one. Keep its access private and
give me the working link.
```

Public publishing, only when intended:

```text
Publish this viewer publicly so anyone with its link can open it. I authorize
uploading the source and the assets intentionally included in public/. Keep
ignored references and credentials out of the upload. Check the published
viewer and give me its link.
```

Publishing uses hosting; GitHub source visibility and website visitor access are separate settings. Availability of ChatGPT Sites and external invitations depends on the account.

## 8. Share an arrangement

In the website, click **Save arrangement** and **Layout** to download the JSON. Load it on another device in the same house version. To ask Codex to incorporate it:

```text
Apply my attached layout JSON to this same house model. Verify the object IDs
match, including duplicate sources and deletion states. Preserve missing or
unrelated objects carefully. Do not publish the changed default layout until
I request it. Tell me if the file belongs to a different model.
```

## 9. Check object measurements

Use **Edit → select an object → Measurements** for overall width, depth and height. [Read the guide](MEASUREMENTS.md) before interpreting grouped objects or floor thickness.

```text
Check this selected object's model dimensions against my supplied measurements.
Explain which parts are included in the bounds. If I give room dimensions,
measure clear inside distances separately from wall or floor group bounds.
Do not resize anything unless I request it.
```
