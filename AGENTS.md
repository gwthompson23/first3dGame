# Repository Guidelines

## Project Structure
- `src/`: TypeScript source
  - `main.ts` (entry), `app.ts` (GL init, loop, pointer lock)
  - `core/`: engine utilities (`gl.ts`, `input/`, `math/`, `renderer/`)
  - `game/`: gameplay (`camera.ts`, `player.ts`, `world/` with `collision.ts`, `terrain.ts`)
  - `types/`: type decls for raw/GLSL imports
- `public/`: static assets (`textures/ground/diffuse.jpg`, `textures/sky/sky.hdr`)
- `index.html`: app shell with `<canvas id="scene">`
- `vite.config.ts`: `@` alias to `src/`

Prefer small, focused modules. Use `@/path/to/module` for imports inside `src`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server with HMR.
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Preview the production build.
- `npm run typecheck`: Run TypeScript in `--noEmit` mode.

Example: `npm run dev` then click the canvas to lock the pointer.

## Coding Style
- TypeScript (strict), ES modules; 2‑space indent; UTF‑8
- Filenames lowercase with dashes; classes PascalCase; vars/functions camelCase
- Prefer `@/...` imports over deep relatives
- No formatter configured — keep diffs small; run `npm run typecheck`

## Testing
- None configured. If needed, use Vitest and colocate `*.spec.ts`.

## Commits & PRs
- Commits: imperative and scoped (e.g., `feat(player): add capsule collisions`)
- PRs: summarize changes, include visuals for rendering/input, provide steps to verify

## Architecture
- Loop: `src/loop.ts` runs fixed updates + per‑frame render
- Input/Camera: pointer‑lock mouse look; keyboard drives `Player`
- Physics: capsule vs AABB; ground via `heightAt(x,z)` (procedural terrain)
- Render order: sky (fullscreen, equirect HDR decoded in `hdr.ts`), ground (heightfield + tiling diffuse), debug cube; shaders in `core/renderer/shaders/`

## Assets
- Ground: `public/textures/ground/diffuse.jpg`
- Sky: `public/textures/sky/sky.hdr`

## Next Steps
- Optional: surface‑normal grounding/slope limits; basic lighting; world bounds
