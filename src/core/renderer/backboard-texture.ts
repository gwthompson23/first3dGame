import { COURT } from '@/game/world/court'

export async function createBackboardTexture(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): Promise<WebGLTexture> {
  // Maintain board aspect: 1.829 x 1.067 m ~ 1.714:1
  const w = 1024
  const h = Math.round(w / (1.829 / 1.067))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Background (tempered glass look): light gray with subtle variation
  ctx.fillStyle = '#e9eef2'
  ctx.fillRect(0, 0, w, h)

  // Lines
  ctx.strokeStyle = '#d84a1b' // orange/red
  ctx.fillStyle = '#d84a1b'
  // Use approx 2 in line width
  const lineWidthM = 0.0508
  const pxPerM = w / 1.829
  const lw = Math.max(2, Math.round(lineWidthM * pxPerM))
  ctx.lineWidth = lw
  ctx.lineJoin = 'miter'
  ctx.lineCap = 'butt'

  // Shooter's square: 24" x 18"; bottom 6" above rim
  const sqWm = 0.6096
  const sqHm = 0.4572
  const bottomAboveRim = 0.1524
  const rimY = COURT.hoopCenter[1]
  const boardCenterY = rimY + 0.305 // as used in renderer geometry
  // Map to texture coords (0..w, 0..h) with (0,0) top-left
  const boardHm = 1.067
  const cx = w / 2
  const cy = h / 2
  // Vertical mapping from world meters to texture pixels
  const yPerM = h / boardHm
  const sqW = sqWm * pxPerM
  const sqH = sqHm * yPerM
  const bottomY_world = (boardCenterY - boardHm / 2) + (COURT.hoopCenter[1] - (rimY - 0)) // keep centered baseline
  // Position: center horizontally on hoop; bottom edge 6" above rim
  const bottomY = cy - ((COURT.hoopCenter[1] + bottomAboveRim) - boardCenterY) * yPerM
  const topY = bottomY - sqH
  const leftX = cx - sqW / 2
  const rightX = cx + sqW / 2

  // Draw square
  rectStroke(ctx, leftX, topY, sqW, sqH)

  // Thin perimeter around board (optional)
  ctx.strokeStyle = '#cfd5db'
  ctx.lineWidth = Math.max(1, Math.round(lw * 0.6))
  rectStroke(ctx, lw, lw, w - 2 * lw, h - 2 * lw)

  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return tex
}

function rectStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h))
}
function clamp255(v: number) { return Math.max(0, Math.min(255, v | 0)) }
