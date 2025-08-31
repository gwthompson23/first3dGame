# First 3D Game — WebGL Basketball (TypeScript + Vite)

## Overview
- Walk around a half-court, pick up the ball, aim with an arc preview, and shoot. The ball collides with the backboard/rim, interacts with a flowy net, rotates in the air, and triggers confetti + a score counter on makes.

## Play
- Install: `npm install`
- Run: `npm run dev` and open the printed URL
- Click the canvas to lock the pointer; press `Esc` to unlock

## Controls
- Move: `WASD` or Arrow keys
- Look: Mouse
- Jump: `Space`
- Pick up ball: Walk close to it
- Aim: Hold Left Mouse (trajectory arc shows)
- Shoot: Release Left Mouse

## Build
- Typecheck: `npm run typecheck`
- Production build: `npm run build`
- Preview build: `npm run preview`

## Notes
- Static assets live under `public/` (ground texture, sky HDR).
- Imports inside `src/` use `@/` alias (see `vite.config.ts`).

## GitHub Pages (deploy via docs/)
- Set the base path for your repo when building: on macOS/Linux run `export VITE_BASE="/<REPO_NAME>/"` (PowerShell: `$env:VITE_BASE = '/first3dGame/'`).
- Build to `docs/`: `npm run build`
- Commit and push the `docs/` folder on `main`.
- In GitHub: Settings → Pages → Build and deployment → “Deploy from a branch” → Branch: `main`, Folder: `/docs`.
- Open: [this page](https://gwthompson23.github.io/first3dGame/)!
