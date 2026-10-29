# Capture process and preserved stages

The intended service is quick capture followed by progressive detail. The field worker starts with ground video, optional drone footage when relevant, and close-up stills for specific equipment. An agent authors a rough spatial model, links observations to components, and asks only for targeted missing evidence.

This demonstration began with individual photos and an accurate related-floor plan. Repeated requests for wall coverage and hallway dimensions made the capture process too burdensome. The user rejected a complete engineering survey and initially supplied a 79-inch door height, later considered unreliable; the outside frame width is now measured at 40 inches. This failure is part of the demonstration.

The repository supplied an existing Three.js viewer and editor. Its controls, selection, editing, history, saves and exports were retained. The initial Blender inspiration article describes a different workflow; this app does not run Blender or automatically turn uploaded video into geometry.

The first draft placed 210 incorrectly and invented too much detail beyond the photographed area. Street View-like double-click movement was added, then the arrow pad was removed. A 5:28 video clarified the connected route, equipment relationships, camera and exposed services. Uncaptured corridors became gray context. Further close-ups refined the extinguisher, alarm and heater; a door audit removed an unsupported 208 entrance.

The first attempt at a live narrated tour was too slow and continued after spoken stop requests. The next tour must use prepared stops and scripts, direct camera URLs, no arbitrary pauses, and immediate stop behavior. Do not start a tour until requested.

Seven local milestone packages preserve the available first draft, navigation refinements, door/start correction, video review, component records, and URL/equipment revision. Earlier stages do not all have replayable historical source builds. The public site documents the stages; it does not publish the private archive or the original video. Do not invent historical processing times.

The goal of a demonstration for Mike is to show the process, actual trouble encountered, corrections, and what a trained person and agent can repeat. A solar plant and Aspen Acres were mentioned as future possibilities; this model is not a completed survey of either site.

The repeatable workflow is: video → timestamped review frames → provisional model → component inventory → targeted close-ups/selected measurements → reviewed identification and access notes → refined model. When new evidence conflicts with plan-derived assumptions, record the conflict and correct the model.

## Evidence review before a spatial update

For any new modeled scene or spatial revision, the agent follows the [model evidence review skill](model-review.md): compare the running model with the actual source photos and video frames from comparable viewpoints. Check the affected features and their surroundings for flipped orientations, wrong placement or proportions, missing/invented details and other visible inconsistencies. Correct discrepancies, rebuild and compare again before calling the work complete. Tests and camera URLs support this check but do not replace looking at the rendered result. Record evidence, viewer links, screenshots, the comparison outcome and remaining uncertainty in the ticket. Reuse existing capture; ask for more only when the comparison establishes a specific evidence gap. This review belongs to the agent, before the user's review.

## Updating the model through the agent

The agent is the primary application interface. A person selects an object in the viewer, then tells the agent by voice or text what to add or correct and supplies any photos, readings or measurements. The selected component ID is included in the current view URL. The agent uses that identity and existing evidence to resolve the request, asking a targeted question only if needed.

For each actionable change, the agent creates and starts a project Beadwork ticket containing the requested change, component IDs, evidence, unknowns and acceptance criteria. The agent updates the canonical component records or geometry and relevant Markdown, validates the change, commits it and publishes the site. Once deployment and the relevant published result have been verified, the agent records the outcome, closes and syncs the ticket, and gives the person a published link and specific things to check. Failed publication remains unfinished work. Examples and future ideas are recorded without automatically implementing them.

This makes accepted information part of the shared published model, available to a fresh browser and a later agent session. Browser-local edits are separate: the agent does not automatically receive unsent field contents. A person can ask the agent to apply those edits; the agent then reads the selected record or a supplied export and reconciles it into the canonical source. Saving an arrangement or downloading a project remains an optional local backup path.

For example, a person could photograph the extinguisher's gauge and inspection or replacement labels. Those observations belong to the specific extinguisher represented by the cabinet component, not to every extinguisher in the building. The agent records the observation date separately from any dates printed on the equipment or tag, the legible gauge reading or visible range, and the source photos. It preserves earlier dated observations so the record shows changes over time. Unreadable text remains unknown; a reported replacement date is not inferred from an inspection date. A photographed gauge or tag is evidence of what was visible, not an agent-issued inspection or certification. This is the intended intake workflow; no gauge reading or inspection/replacement date has yet been supplied for this extinguisher.
