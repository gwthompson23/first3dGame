# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript source.
  - `main.ts` (entry), `app.ts` (GL init, loop, pointer lock).
  - `core/`: Engine utilities (`gl.ts`, `input/`, `math/`, `renderer/`).
  - `game/`: Game logic (`camera.ts`, `player.ts`, `world/`).
  - `types/`: Type decls for raw/GLSL imports.
- `index.html`: App shell with `<canvas id="scene">`.
- `src/styles.css`: Global styles.
- `vite.config.ts`: `@` alias to `src/`.

Prefer small, focused modules. Use `@/path/to/module` for imports inside `src`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server with HMR.
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Preview the production build.
- `npm run typecheck`: Run TypeScript in `--noEmit` mode.

Example: `npm run dev` then click the canvas to lock the pointer.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Modules: ESNext.
- Indentation: 2 spaces; Unix newlines; UTF‑8.
- Filenames: lowercase with dashes for multiword (`basic.vert-300es.glsl`).
- Naming: PascalCase for classes (`Camera`, `Renderer`), camelCase for vars/functions.
- Imports: prefer path alias `@/...` over relative `../../`.
- Formatting/Linting: Not configured. Keep diffs small and consistent; run `npm run typecheck` before pushing.

## Testing Guidelines
- No test framework is configured yet.
- If adding tests, use Vitest and colocate as `*.spec.ts` next to modules or under `src/__tests__/`.
- Keep tests deterministic (fixed timestep where applicable). Mock WebGL where needed.

## Commit & Pull Request Guidelines
- Commits: Imperative mood, concise scope, e.g., `feat(player): add capsule collisions`.
- PRs should include:
  - Summary of changes and rationale.
  - Screenshots/GIFs for visual changes (camera, rendering, input).
  - Linked issues and clear testing steps (`npm run dev`, reproduce, verify).
- Keep PRs focused; avoid unrelated refactors.

## Architecture Overview
- Loop: `src/loop.ts` runs fixed updates and renders each frame.
- Input/Camera: Mouse look via pointer lock; keyboard drives `Player`.
- Physics: Simple capsule vs AABB + ground plane.
- Render: `Renderer` draws ground and debug cube; shaders live under `core/renderer/shaders/` and are imported with `?raw`.

