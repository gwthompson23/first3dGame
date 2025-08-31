import { createProgram } from '@/core/gl'
import vert100 from './shaders/basic.vert.glsl?raw'
import frag100 from './shaders/basic.frag.glsl?raw'
import vert300 from './shaders/basic.vert-300es.glsl?raw'
import frag300 from './shaders/basic.frag-300es.glsl?raw'

export class Renderer {
  private program: WebGLProgram
  private uViewProj: WebGLUniformLocation | null
  private buffer: WebGLBuffer
  private groundBuffer: WebGLBuffer
  private isWebGL2: boolean

  // Cube vertex data: position (x,y,z) + color (r,g,b)
  private static cube(): Float32Array {
    const p = [
      // Front (+Z)
      -1, -1,  1,  0.9, 0.2, 0.2,
       1, -1,  1,  0.9, 0.2, 0.2,
       1,  1,  1,  0.9, 0.2, 0.2,
      -1, -1,  1,  0.9, 0.2, 0.2,
       1,  1,  1,  0.9, 0.2, 0.2,
      -1,  1,  1,  0.9, 0.2, 0.2,
      // Back (-Z)
      -1, -1, -1,  0.2, 0.2, 0.9,
       1,  1, -1,  0.2, 0.2, 0.9,
       1, -1, -1,  0.2, 0.2, 0.9,
      -1, -1, -1,  0.2, 0.2, 0.9,
      -1,  1, -1,  0.2, 0.2, 0.9,
       1,  1, -1,  0.2, 0.2, 0.9,
      // Left (-X)
      -1, -1, -1,  0.2, 0.9, 0.2,
      -1, -1,  1,  0.2, 0.9, 0.2,
      -1,  1,  1,  0.2, 0.9, 0.2,
      -1, -1, -1,  0.2, 0.9, 0.2,
      -1,  1,  1,  0.2, 0.9, 0.2,
      -1,  1, -1,  0.2, 0.9, 0.2,
      // Right (+X)
       1, -1, -1,  0.9, 0.9, 0.2,
       1,  1,  1,  0.9, 0.9, 0.2,
       1, -1,  1,  0.9, 0.9, 0.2,
       1, -1, -1,  0.9, 0.9, 0.2,
       1,  1, -1,  0.9, 0.9, 0.2,
       1,  1,  1,  0.9, 0.9, 0.2,
      // Top (+Y)
      -1,  1, -1,  0.2, 0.9, 0.9,
      -1,  1,  1,  0.2, 0.9, 0.9,
       1,  1,  1,  0.2, 0.9, 0.9,
      -1,  1, -1,  0.2, 0.9, 0.9,
       1,  1,  1,  0.2, 0.9, 0.9,
       1,  1, -1,  0.2, 0.9, 0.9,
      // Bottom (-Y)
      -1, -1, -1,  0.9, 0.2, 0.9,
       1, -1,  1,  0.9, 0.2, 0.9,
      -1, -1,  1,  0.9, 0.2, 0.9,
      -1, -1, -1,  0.9, 0.2, 0.9,
       1, -1, -1,  0.9, 0.2, 0.9,
       1, -1,  1,  0.9, 0.2, 0.9,
    ]
    return new Float32Array(p)
  }

  constructor(private gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext
    const vs = this.isWebGL2 ? vert300 : vert100
    const fs = this.isWebGL2 ? frag300 : frag100
    this.program = createProgram(gl, vs, fs)
    this.uViewProj = gl.getUniformLocation(this.program, 'u_viewProj')

    const buffer = gl.createBuffer()
    if (!buffer) throw new Error('Failed to create buffer')
    this.buffer = buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, Renderer.cube(), gl.STATIC_DRAW)

    const groundVerts = new Float32Array([
      // Large ground quad at y = 0
      -50, 0, -50,  0.2, 0.5, 0.2,
       50, 0, -50,  0.2, 0.5, 0.2,
       50, 0,  50,  0.2, 0.5, 0.2,
      -50, 0, -50,  0.2, 0.5, 0.2,
       50, 0,  50,  0.2, 0.5, 0.2,
      -50, 0,  50,  0.2, 0.5, 0.2,
    ])
    const gbuf = gl.createBuffer()
    if (!gbuf) throw new Error('Failed to create ground buffer')
    this.groundBuffer = gbuf
    gl.bindBuffer(gl.ARRAY_BUFFER, gbuf)
    gl.bufferData(gl.ARRAY_BUFFER, groundVerts, gl.STATIC_DRAW)
  }

  render(viewProj: Float32Array) {
    const gl = this.gl
    gl.useProgram(this.program)
    const stride = 6 * 4

    const setAttribs = () => {
      if (this.isWebGL2) {
        const posLoc = 0
        const colLoc = 1
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0)
        gl.enableVertexAttribArray(colLoc)
        gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, stride, 3 * 4)
      } else {
        const posLoc = gl.getAttribLocation(this.program, 'a_position')
        const colLoc = gl.getAttribLocation(this.program, 'a_color')
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0)
        gl.enableVertexAttribArray(colLoc)
        gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, stride, 3 * 4)
      }
    }

    gl.uniformMatrix4fv(this.uViewProj, false, viewProj)

    // Draw ground first
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundBuffer)
    setAttribs()
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // Draw cube
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    setAttribs()
    gl.drawArrays(gl.TRIANGLES, 0, 36)
  }
}
