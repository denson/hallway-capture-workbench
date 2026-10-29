# Explore what is possible with Three.js

Open the [official Three.js examples gallery](https://threejs.org/examples/) to try interactive demos. These show possibilities for future additions; they are not a list of features already included in this editor.

## Examples to try

| Interactive example | What to explore | An idea to ask Codex to build |
| --- | --- | --- |
| [Animated scene — keyframes](https://threejs.org/examples/#webgl_animation_keyframes) | An animated 3D scene, rather than a still render | Animate a door opening or create a short house presentation with moving objects. |
| [Glass and transmission](https://threejs.org/examples/#webgl_materials_physical_transmission) | How light passes through physical materials | Improve a glass tabletop or decorative glass object, with adjustable roughness. |
| [Transform controls](https://threejs.org/examples/#misc_controls_transform) | Handles for moving, rotating and scaling objects | Extend our existing Edit mode with local/world axes or scale handles. |
| [glTF model loading](https://threejs.org/examples/#webgl_loader_gltf) | Loading and displaying a prepared 3D asset | Add a GLB furniture import workflow and register imported objects in the catalog. |

The ideas in the last column are proposed adaptations, not features demonstrated exactly as described. This editor already supports moving, rotating and resizing objects. General animation playback and arbitrary GLB asset import would require additional implementation.

## Use an example as a reference for Codex

1. Open a demo and try its controls.
2. Copy its URL. Describe the specific effect or interaction you want; a screenshot or short screen recording can help.
3. Open your copy of this repository in Codex and paste the prompt below. Attach any relevant model or image separately.
4. Review the local result before asking Codex to publish it.

```text
Read AGENTS.md, README.md and docs/PROMPTS.md. Extend this existing editor.

Reference example: [paste a Three.js example URL]
What I like: [describe the animation, material or interaction]
Apply it to: [name the room or object]
Desired controls: [for example Play/Pause, a slider, or click to open]

Inspect the linked example and use Context7 for current Three.js documentation.
Adapt the relevant technique to our scene. Keep walking, editing, the catalog,
measurements, Save/Open project and existing exports working. Explain what
additional model data or assets are needed, and implement the requested feature.
Use assets we are allowed to publish and record any required attribution.

If the feature introduces new project state, include it in project save/load.
Explain whether it appears in PNG, GLB and floor-plan exports; do not assume
an animation or interactive behavior is preserved by every export format.
Run type checks, relevant tests and the build. Test the feature in a browser,
including save/open. Show the local result. Do not publish yet.
```

For example: “Use the keyframe demo as inspiration. Make the living-room door open and close when clicked, with an Open/Close button too. Keep its hinge fixed and make walking collision follow the door.” This requests a new feature; the linked animated-city demo is a technique reference, not a ready-made door system.

Visual quality depends on model detail, texture quality, lighting and device performance. A reference image can guide reconstruction, but does not contain all the geometry or animation data needed for a complete 3D asset. Check each example asset's own license before reusing it; linking to a demo does not grant permission to redistribute its models or textures.
