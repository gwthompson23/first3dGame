import { createProgram } from '@/core/gl'
import vert100 from './shaders/basic.vert.glsl?raw'
import frag100 from './shaders/basic.frag.glsl?raw'
import vert300 from './shaders/basic.vert-300es.glsl?raw'
import frag300 from './shaders/basic.frag-300es.glsl?raw'
import groundVert100 from './shaders/ground.vert.glsl?raw'
import groundFrag100 from './shaders/ground.frag.glsl?raw'
import groundVert300 from './shaders/ground.vert-300es.glsl?raw'
import groundFrag300 from './shaders/ground.frag-300es.glsl?raw'
import skyVert100 from './shaders/skybox.vert.glsl?raw'
import skyFrag100 from './shaders/skybox.frag.glsl?raw'
import skyVert300 from './shaders/skybox.vert-300es.glsl?raw'
import skyFrag300 from './shaders/skybox.frag-300es.glsl?raw'
import { mat4Multiply } from '@/core/math/math'
import { heightAt, TERRAIN_SIZE } from '@/game/world/terrain'
import { loadImageTexture } from '@/core/renderer/texture'
import { loadHDRToLDRTexture } from '@/core/renderer/hdr'

export class Renderer {
  // Color program for debug cube
  private program: WebGLProgram
  private uViewProj: WebGLUniformLocation | null
  private buffer: WebGLBuffer

  // Ground program (textured)
  private groundProgram: WebGLProgram
  private uGroundViewProj: WebGLUniformLocation | null
  private uGroundTile: WebGLUniformLocation | null
  private uGroundSampler: WebGLUniformLocation | null
  private groundBuffer: WebGLBuffer
  private groundVertexCount = 0
  private groundTex: WebGLTexture | null = null

  // Sky program (equirectangular 2D texture)
  private skyProgram: WebGLProgram
  private uSkyInvViewRot: WebGLUniformLocation | null
  private uSkyInvProjScale: WebGLUniformLocation | null
  private uSkySampler: WebGLUniformLocation | null
  private skyTex: WebGLTexture | null = null
  private skyBuffer: WebGLBuffer

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

    // Ground program
    const gvs = this.isWebGL2 ? groundVert300 : groundVert100
    const gfs = this.isWebGL2 ? groundFrag300 : groundFrag100
    this.groundProgram = createProgram(gl, gvs, gfs)
    this.uGroundViewProj = gl.getUniformLocation(this.groundProgram, 'u_viewProj')
    this.uGroundTile = gl.getUniformLocation(this.groundProgram, 'u_tile')
    this.uGroundSampler = gl.getUniformLocation(this.groundProgram, 'u_tex')

    // Sky program
    const svs = this.isWebGL2 ? skyVert300 : skyVert100
    const sfs = this.isWebGL2 ? skyFrag300 : skyFrag100
    this.skyProgram = createProgram(gl, svs, sfs)
    this.uSkyInvViewRot = gl.getUniformLocation(this.skyProgram, 'u_invViewRot')
    this.uSkyInvProjScale = gl.getUniformLocation(this.skyProgram, 'u_invProjScale')
    this.uSkySampler = gl.getUniformLocation(this.skyProgram, 'u_sky')

    const buffer = gl.createBuffer()
    if (!buffer) throw new Error('Failed to create buffer')
    this.buffer = buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, Renderer.cube(), gl.STATIC_DRAW)

    // Ground vertex data: position (x,y,z) + uv (u,v)
    const size = TERRAIN_SIZE
    const tiling = 20
    const res = 128 // number of quads per side
    const verts: number[] = []
    const sampleHeight = (x: number, z: number) => heightAt(x, z)
    for (let iz = 0; iz < res; iz++) {
      for (let ix = 0; ix < res; ix++) {
        const x0 = -size + (ix / res) * (2 * size)
        const x1 = -size + ((ix + 1) / res) * (2 * size)
        const z0 = -size + (iz / res) * (2 * size)
        const z1 = -size + ((iz + 1) / res) * (2 * size)
        const u0 = (ix / res) * tiling
        const u1 = ((ix + 1) / res) * tiling
        const v0 = (iz / res) * tiling
        const v1 = ((iz + 1) / res) * tiling
        const y00 = sampleHeight(x0, z0)
        const y10 = sampleHeight(x1, z0)
        const y11 = sampleHeight(x1, z1)
        const y01 = sampleHeight(x0, z1)
        // tri 1
        verts.push(x0, y00, z0,  u0, v0)
        verts.push(x1, y10, z0,  u1, v0)
        verts.push(x1, y11, z1,  u1, v1)
        // tri 2
        verts.push(x0, y00, z0,  u0, v0)
        verts.push(x1, y11, z1,  u1, v1)
        verts.push(x0, y01, z1,  u0, v1)
      }
    }
    const groundVerts = new Float32Array(verts)
    this.groundVertexCount = groundVerts.length / 5
    const gbuf = gl.createBuffer()
    if (!gbuf) throw new Error('Failed to create ground buffer')
    this.groundBuffer = gbuf
    gl.bindBuffer(gl.ARRAY_BUFFER, gbuf)
    gl.bufferData(gl.ARRAY_BUFFER, groundVerts, gl.STATIC_DRAW)

    // Start loading textures
    loadImageTexture(gl, '/textures/ground/diffuse.jpg').then(tex => { this.groundTex = tex }).catch(() => {})
    loadHDRToLDRTexture(gl, '/textures/sky/sky.hdr').then(tex => { this.skyTex = tex }).catch(() => {})

    // Fullscreen triangle buffer for sky
    const skyVerts = new Float32Array([
      -1, -1,
       3, -1,
      -1,  3,
    ])
    const sbuf = gl.createBuffer()
    if (!sbuf) throw new Error('Failed to create sky buffer')
    this.skyBuffer = sbuf
    gl.bindBuffer(gl.ARRAY_BUFFER, sbuf)
    gl.bufferData(gl.ARRAY_BUFFER, skyVerts, gl.STATIC_DRAW)
  }

  render(view: Float32Array, proj: Float32Array) {
    const gl = this.gl
    const viewProj = new Float32Array(16)
    mat4Multiply(viewProj, proj as any, view as any)

    // 1) Sky (draw first, depth off, no writes)
    if (this.skyTex) {
      gl.depthMask(false)
      gl.disable(gl.DEPTH_TEST)
      gl.useProgram(this.skyProgram)
      // inverse view rotation = transpose of upper-left 3x3
      const m = view
      const invRot = new Float32Array([
        m[0], m[4], m[8],
        m[1], m[5], m[9],
        m[2], m[6], m[10],
      ])
      gl.uniformMatrix3fv(this.uSkyInvViewRot, false, invRot)
      const invProjScaleX = 1.0 / (proj as any)[0]
      const invProjScaleY = 1.0 / (proj as any)[5]
      gl.uniform2f(this.uSkyInvProjScale, invProjScaleX, invProjScaleY)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.skyTex)
      gl.uniform1i(this.uSkySampler, 0)
      // Draw fullscreen triangle
      gl.bindBuffer(gl.ARRAY_BUFFER, this.skyBuffer)
      if (this.isWebGL2) {
        const posLoc = 0
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 2 * 4, 0)
      } else {
        const posLoc = gl.getAttribLocation(this.skyProgram, 'a_position')
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 2 * 4, 0)
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      gl.enable(gl.DEPTH_TEST)
      gl.depthMask(true)
    }

    // 2) Ground textured
    gl.useProgram(this.groundProgram)
    gl.uniformMatrix4fv(this.uGroundViewProj, false, viewProj)
    gl.uniform2f(this.uGroundTile, 1.0, 1.0)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundBuffer)
    const gStride = 5 * 4
    if (this.isWebGL2) {
      const posLoc = 0
      const uvLoc = 1
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, gStride, 0)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, gStride, 3 * 4)
    } else {
      const posLoc = gl.getAttribLocation(this.groundProgram, 'a_position')
      const uvLoc = gl.getAttribLocation(this.groundProgram, 'a_uv')
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, gStride, 0)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, gStride, 3 * 4)
    }
    if (this.groundTex) {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.groundTex)
      gl.uniform1i(this.uGroundSampler, 0)
    }
    gl.drawArrays(gl.TRIANGLES, 0, this.groundVertexCount)

    // 3) Debug cube (colored)
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uViewProj, false, viewProj)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    const stride = 6 * 4
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
    gl.drawArrays(gl.TRIANGLES, 0, 36)
  }
}
