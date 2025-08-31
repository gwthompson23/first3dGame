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
