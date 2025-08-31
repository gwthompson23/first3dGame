import { Net } from '@/game/world/net'

export class NetRenderer {
  private gl: WebGLRenderingContext | WebGL2RenderingContext
  private buffer: WebGLBuffer | null = null
  private vertexCount = 0
  private thickness = 0.0075 // meters (approx visual width)

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl
    this.buffer = gl.createBuffer()
  }

  // Build camera-facing quads (two triangles per segment) for verticals and diagonals
  sync(net: Net, camPos: readonly number[]) {
    const p = net.getPositions()
    const cols = (net as any).cols as number
    const rows = (net as any).rows as number
    const verts: number[] = []
    const color = [0.92, 0.92, 0.92]
    const idx = (c: number, r: number) => (r * cols + ((c % cols) + cols) % cols) * 3
    const addQuad = (i0: number, i1: number) => {
      const x0 = p[i0], y0 = p[i0+1], z0 = p[i0+2]
      const x1 = p[i1], y1 = p[i1+1], z1 = p[i1+2]
      // segment and approximate view direction
      const sx = x1 - x0, sy = y1 - y0, sz = z1 - z0
      let vx = (camPos[0] - (x0 + x1) * 0.5)
      let vy = (camPos[1] - (y0 + y1) * 0.5)
      let vz = (camPos[2] - (z0 + z1) * 0.5)
      // perp = normalize(cross(seg, view))
      let px = sy * vz - sz * vy
      let py = sz * vx - sx * vz
      let pz = sx * vy - sy * vx
      let plen = Math.hypot(px, py, pz)
      if (plen < 1e-5) {
        // fallback using up axis
        vx = 0; vy = 1; vz = 0
        px = sy * vz - sz * vy
        py = sz * vx - sx * vz
        pz = sx * vy - sy * vx
        plen = Math.hypot(px, py, pz) || 1
      }
      px /= plen; py /= plen; pz /= plen
      const t = this.thickness * 0.5
      const ox = px * t, oy = py * t, oz = pz * t
      // four corners
      const ax = x0 + ox, ay = y0 + oy, az = z0 + oz
      const bx = x1 + ox, by = y1 + oy, bz = z1 + oz
      const cx = x1 - ox, cy = y1 - oy, cz = z1 - oz
      const dx = x0 - ox, dy = y0 - oy, dz = z0 - oz
      // two triangles: a-b-c and a-c-d
      verts.push(ax, ay, az, ...color)
      verts.push(bx, by, bz, ...color)
      verts.push(cx, cy, cz, ...color)
      verts.push(ax, ay, az, ...color)
      verts.push(cx, cy, cz, ...color)
      verts.push(dx, dy, dz, ...color)
    }
    // verticals
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        const i0 = idx(c, r)
        const i1 = idx(c, r + 1)
        addQuad(i0, i1)
      }
    }
    // diagonals
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        const i0 = idx(c, r)
        const i1 = idx(c + 1, r + 1)
        addQuad(i0, i1)
      }
    }
    const gl = this.gl
    const data = new Float32Array(verts)
    this.vertexCount = data.length / 6
    if (!this.buffer) this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
  }

  render(program: WebGLProgram, uViewProj: WebGLUniformLocation | null, viewProj: Float32Array, isWebGL2: boolean) {
    if (!this.buffer || this.vertexCount === 0) return
    const gl = this.gl
    gl.useProgram(program)
    gl.uniformMatrix4fv(uViewProj, false, viewProj)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    const stride = 6 * 4
    if (isWebGL2) {
      gl.enableVertexAttribArray(0)
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0)
      gl.enableVertexAttribArray(1)
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4)
    } else {
      const posLoc = gl.getAttribLocation(program, 'a_position')
      const colLoc = gl.getAttribLocation(program, 'a_color')
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0)
      gl.enableVertexAttribArray(colLoc)
      gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, stride, 3 * 4)
    }
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount)
  }
}
