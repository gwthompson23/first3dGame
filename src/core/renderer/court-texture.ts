import type { CourtSpec } from '@/game/world/court'

export async function createCourtTexture(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  spec: CourtSpec,
): Promise<{ tex: WebGLTexture, width: number, height: number }> {
  const canvas = document.createElement('canvas')
  const widthPx = 2048
  const pxPerM = widthPx / (spec.halfWidth * 2)
  const heightPx = Math.max(1, Math.round(pxPerM * spec.length))
  canvas.width = widthPx
  canvas.height = heightPx
  const ctx = canvas.getContext('2d')!

  // Helpers
  const m2px = (m: number) => m * pxPerM
  const lw = Math.max(1, Math.round(m2px(spec.lineWidth)))
  const courtW = spec.halfWidth * 2
  const courtL = spec.length

  // Base asphalt color
  ctx.fillStyle = '#44484c'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add speckle noise
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = img.data
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.random() * 0.12 - 0.06
    data[i] = clamp255(data[i] + r * 255)
    data[i + 1] = clamp255(data[i + 1] + r * 255)
    data[i + 2] = clamp255(data[i + 2] + r * 255)
  }
  ctx.putImageData(img, 0, 0)

  // Faint directional streaks
  ctx.globalAlpha = 0.05
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * canvas.height
    ctx.fillRect(0, y, canvas.width, 1)
  }
  ctx.globalAlpha = 1.0

  // Lines layer
  ctx.lineWidth = lw
  ctx.strokeStyle = '#f6f6f6'
  ctx.fillStyle = '#f6f6f6'
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'round'

  // Coordinate mapping: (0,0) top-left of court; y forward (+Z)
  const centerX = canvas.width / 2
  const originY = 0 // at baseline

  // Outline (sidelines and baseline)
  rectStroke(ctx, centerX - m2px(courtW / 2), originY, m2px(courtW), m2px(courtL))

  // Backboard line (at backboard plane)
  const BACKBOARD_FROM_BASELINE = 1.2192
  const backY = originY + m2px(BACKBOARD_FROM_BASELINE)
  line(ctx, centerX - m2px(0.915), backY, centerX + m2px(0.915), backY) // 72" wide board line

  // Key (lane)
  const KEY_WIDTH = 4.877
  const FT_FROM_BACKBOARD = 4.572
  const keyLen = BACKBOARD_FROM_BASELINE + FT_FROM_BACKBOARD
  rectStroke(ctx, centerX - m2px(KEY_WIDTH / 2), originY, m2px(KEY_WIDTH), m2px(keyLen))

  // Free throw circle
  const FT_RADIUS = 1.829
  const ftCenterY = originY + m2px(keyLen)
  circle(ctx, centerX, ftCenterY, m2px(FT_RADIUS))
  // Dashes on lower half
  ctx.save()
  ctx.setLineDash([lw * 2, lw * 2])
  arc(ctx, centerX, ftCenterY, m2px(FT_RADIUS), Math.PI, 2 * Math.PI)
  ctx.restore()

  // Restricted area semicircle under hoop
  const RESTRICT_RADIUS = 1.219
  const hoopY = originY + m2px(BACKBOARD_FROM_BASELINE + 0.1524)
  arc(ctx, centerX, hoopY, m2px(RESTRICT_RADIUS), 0, Math.PI) // facing into court

  // Three-point line: sides + arc
  const THREE_RADIUS_IN = 7.239 // measured to inside edge
  const CORNER_DIST_IN = 6.706 // measured to inside edge
  const lwMeters = spec.lineWidth
  const R = THREE_RADIUS_IN + lwMeters * 0.5 // stroke center radius
  const X = CORNER_DIST_IN + lwMeters * 0.5 // stroke center x offset for sides
  const theta = Math.acos(Math.min(1, X / R))
  const arcYExtent = Math.sqrt(Math.max(R * R - X * X, 0))
  const sideXLeft = centerX - m2px(X)
  const sideXRight = centerX + m2px(X)
  const joinY = hoopY + m2px(arcYExtent)
  const lwPx = lw
  // Draw vertical sides as filled rects to avoid join artifacts, overlap slightly into arc
  ctx.fillStyle = ctx.strokeStyle
  ctx.fillRect(Math.round(sideXLeft - lwPx / 2), Math.round(originY), Math.round(lwPx), Math.round((joinY - originY) + lwPx * 0.6))
  ctx.fillRect(Math.round(sideXRight - lwPx / 2), Math.round(originY), Math.round(lwPx), Math.round((joinY - originY) + lwPx * 0.6))
  // Draw arc centered on stroke radius
  ctx.beginPath()
  arc(ctx, centerX, hoopY, m2px(R), 0 + theta, Math.PI - theta)
  ctx.stroke()

  // Upload to GL
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return { tex, width: canvas.width, height: canvas.height }
}

function rectStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h))
}

function line(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
}
function circle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.stroke()
}
function arc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a0: number, a1: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, a0, a1)
  ctx.stroke()
}
function clamp255(v: number) { return Math.max(0, Math.min(255, v | 0)) }
