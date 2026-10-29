---
name: review-model-evidence
description: Compare a running 3D model with its source photos and video frames, then correct visual inconsistencies before completion. Use for building or revising modeled scenes and their viewing interactions; ordinary text-only annotations do not need this review.
---

# Review Model Evidence

The required check is the built result against the evidence: inspect the running viewer and the actual source images, and correct what does not agree. Apply this to any modeled scene or feature, not just the defect that prompted this skill. Use the project's existing Beadwork workflow.

## Compare, correct, compare again

1. Open the built scene in the viewer. Inspect source photos and relevant video frames alongside it. Use wider views for the arrangement and detail views for individual features; reuse existing material.
2. Navigate the model to comparable viewpoints. Establish which way each source view faces so camera movement or a reversed viewing direction is not mistaken for a change in the scene. Check the affected area in context, not only an isolated object.
3. Compare what is actually visible: location, relative size and height, side and facing direction, shape and projection, attachment, and relationships to surrounding features as applicable. Look for mirrored layouts, reversed parts, missing or invented objects, and inconsistencies between views. Do not use an earlier draft as the reference for itself.
4. Correct discrepancies supported by the evidence, rebuild and repeat the comparison. An uncertainty label does not excuse something visibly contradicted by the images. Preserve measured anchors and distinguish estimated dimensions from observed relationships.
5. Exercise any changed selection/navigation behavior in the running viewer and verify its target. Record the compared evidence IDs, viewer links, screenshot references, outcome and remaining uncertainties in the ticket. Verify the deployed result before closing it.

Check all affected features for a broad scene change; for a small revision, review that feature and its surroundings. The review should be proportional to the change, not a new engineering survey.

When a mismatch comes from shared generation code or a reused asset, audit its other instances and their source views. Fixing one instance is not evidence that the others agree; shared code must allow real differences between the things it represents.

## What counts as verification

Passing code tests, reading coordinates, or successfully opening a view URL does not establish visual consistency. Tests supplement the image comparison; they do not replace it. The user should not be the first visual QA pass.

If the running model cannot be inspected, say that visual verification remains unfinished. Keep any saved review honest about what was actually compared; label retrospective checks as retrospective.

## When evidence is missing

Inspect the existing capture before attributing an error to video movement or asking for more images. If a relationship genuinely cannot be established, record the specific gap and keep it provisional, or ask for one targeted view when needed. Do not require a reshoot or exhaustive measurements to compensate for failing to compare the model with material already provided.
