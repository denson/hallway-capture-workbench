# Run the hallway on another computer

This repository contains the current editable hallway source, selected public reference images, agent-readable knowledge, tests and GitHub Pages workflow. It runs without the original video or old desktop paths.

Use Git, Node.js 24 and npm. Clone the repository, open a terminal in it, then run:

```powershell
npm ci
npm run dev:pages
```

Open the URL printed by Vite, including `/hallway-capture-workbench/`. Do not assume an old port is still available. This is the React/Three.js application; Blender is not required.

```powershell
npm run typecheck
npm test
npm run test:sources
npm run build:pages
npm run check:public
```

Python 3.11 or newer is useful for source refresh and video review. `python -m pip install -r requirements-sources.txt` installs source-refresh requirements. Video review additionally uses Pillow and ffmpeg; the historical review script contains desktop-specific executable/font paths. Existing extracted stills are already preserved. Do not rerun that script unchanged on another machine.

## Complete transfer package

The user chose Google Drive for the complete laptop transfer. The private field-capture-handoff package contains both applications, source-history Git bundles, HANDOFF.md, reusable skills, original footage/stills, research, prior stages and checksums. It is separate from this public repository. No new companion GitHub repository is required.

Extract the package and start with its README and HANDOFF. The setup helper restores both editable apps from their included Git bundles. Original footage is optional for running the hallway but necessary for further evidence review. Historical ZIPs and browser-local saves are not the current edit target.

## Publishing and work tracking

Pushes to `main` run `.github/workflows/pages.yml`. Follow AGENTS.md for Beadwork tickets and required checks; verify deployment before calling a site update complete. GitHub authentication and access must be established on the laptop separately. Never copy credentials from the desktop into Git.

The Beadwork store lives on branch `beadwork`. Fetch it with the other branches; install the existing `bw` CLI separately if unavailable, then run `bw prime` from this repository. Do not create a second store or silently discard its history.

The launch helper and existing camera URLs remain useful, but the printed server URL is authoritative. A URL carries viewing state and selection, not unsubmitted edits. Git source and published component records are the shared state.
