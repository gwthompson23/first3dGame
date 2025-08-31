First FPS (TypeScript + Vite + WebGL)

Quick start
- Install: `npm install`
- Dev server: `npm run dev` then open the shown URL
- Build: `npm run build`
- Preview build: `npm run preview`

Controls
- Click the canvas to capture the pointer
- Press `Esc` to release pointer lock
- WASD/Arrow keys and mouse deltas are captured (no movement yet)

Project layout
- `index.html`: App shell; loads `/src/main.ts`
- `src/main.ts`: Entry; boots `App`
- `src/app.ts`: WebGL context, resize, pointer lock, RAF loop wiring
- `src/loop.ts`: Fixed timestep update + interpolated render
- `src/core/input/inputs.ts`: Keyboard + mouse state with pointer lock
- `src/core/gl.ts`: Shader/program helpers (for when you start drawing)
- `src/styles.css`: Basic full-viewport canvas and cursor hiding

Next steps
- Add a camera: `src/game/camera.ts` with yaw/pitch + projection
- Add a player/controller: `src/game/player.ts` to apply inputs
- Add a renderer: `src/core/renderer/` and simple shaders under `src/core/renderer/shaders/`
- Draw something (e.g., a colored triangle or a skybox) to verify matrices

Notes
- Index file sits at project root (Vite default). Static assets go in `public/` if needed.
- Import GLSL files using `?raw` or add them under `src` and declare `*.glsl` (see `src/types/glsl.d.ts`).

