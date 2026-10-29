# Hallway Capture Workbench

An interactive, provisional industrial hallway model adapted from [wit543/image-to-3d-house-editor](https://github.com/wit543/image-to-3d-house-editor). Published with GitHub Pages.

## Run and build

Use Node 24. Run `npm ci`, `npm run dev:pages`, and open the printed URL. `npm run build:pages` writes `dist-pages/`; `npm run preview:pages` serves that build.

## AI-forward knowledge

Start with [public/llms.txt](public/llms.txt), [knowledge index](public/knowledge/index.md), [component catalog](public/knowledge/components.json), and [refresh process](knowledge/source-refresh.md). The HTML knowledge page and Markdown work without JavaScript. Agent navigation uses the camera URL, not screenshots.

## Evidence

The user authorized publication of selected reference stills in `public/evidence/`. The original video, raw phone metadata, unpublished references, browser saves and complete milestone archives stay local. Public geometry remains provisional, with explicit measured/estimated/unknown status.

## Source refresh

Install Python requirements with `python -m pip install -r requirements-sources.txt`, then run `npm run refresh` to check sources and rebuild, or `npm run refresh:sources` to check only. Read changed page snapshots/diffs in ignored `source-cache/`, review affected notes, and rebuild. The manual GitHub source-check workflow produces a report, not automatic changes to model claims.

## Checks

`npm run typecheck`, `npm test`, `npm run test:sources`, `npm run build:pages`, and `npm run check:public`.
