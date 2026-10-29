# Vite deployment configuration

Source: https://vite.dev/guide/static-deploy.html

Reviewed working note, 2026-10-29. This is project-relevant paraphrased knowledge; full fetched page Markdown is retained locally, not republished here.

The Vite deployment guide requires the correct base path for a GitHub Pages project site, such as /hallway-capture-workbench/. It describes building static assets and deploying through GitHub Actions. This project uses a separate static Vite entry point while retaining the existing React/Three.js editor. Markdown and selected evidence images are static assets under the same project base path.
