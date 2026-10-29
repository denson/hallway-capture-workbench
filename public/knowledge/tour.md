# Prepared narrated tour

Do not start automatically. The user stopped the previous attempt because it was
slow and speech continued after stop requests. Start only when asked. Load each
URL, check its readable camera URL or selected-object field, then speak that stop's
short script. No fixed sleeps. Do not queue the next stop while the user is speaking.
On “stop”, stop both narration and navigation immediately; do not finish the sentence.
If corrected, acknowledge the correction and pause the tour. Avoid screenshots for
ordinary positioning checks; URL state now supplies camera and selection.

Base URL: https://denson.github.io/hallway-capture-workbench/

1. `#v=1&mode=walk&location=stair2`
   “We’re starting with our back to Stairway 2, facing the T. The blueprint supplied
   the initial footprint; the video tells us which second-floor details to retain.”
2. `#v=1&mode=walk&location=stair2&look=wall-cabinet`
   “Here is the fire extinguisher cabinet. Your close-ups refined its narrow window,
   white door, metal handle and the extinguisher inside. Its exact model is unknown.”
3. `#v=1&mode=edit&object=wall-heater-stair2&focus=1&roof=0`
   “This heater now projects from the wall. The video showed its depth and divided
   grille. The geometry is still approximate; the reference images are attached.”
4. `#v=1&mode=edit&object=fire-pull-station&focus=1&roof=0`
   “The pull station is a separate component. Honeywell is visible; the exact model
   and part number remain unconfirmed. The white horn/strobe is separate above it.”
5. `#v=1&mode=walk&location=services`
   “The video connects the beams, lighting, conduit, cables and sprinkler pipe
   along this route. Sizes and spacing remain estimates where we lack a measurement.”
6. `#v=1&mode=edit&object=sprinkler-head-B0&focus=1&roof=0`
   “This head has its own record and source frames. It says Needs confirmation for
   hallway. Better close-ups can refine the part identity without rebuilding the hall.”
7. `#v=1&mode=plan&roof=0`
   “Orange is the captured route. Gray corridors retain the plan footprint with
   details not captured. The first draft and later corrections are preserved so we
   can show the actual process, including the mistakes and the work to fix them.”

These are prepared statements, not a claim that a new live tour has run. Validate
each stop against the latest model and user corrections before speaking.
