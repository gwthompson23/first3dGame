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
import shadowVert300 from './shaders/shadow.depth.vert-300es.glsl?raw'
import shadowFrag300 from './shaders/shadow.depth.frag-300es.glsl?raw'
import { mat4Multiply, mat4LookAt, mat4Ortho } from '@/core/math/math'
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
  private uGroundLightDir: WebGLUniformLocation | null
  private uGroundLightColor: WebGLUniformLocation | null
  private uGroundAmbient: WebGLUniformLocation | null
  private uGroundCameraPos: WebGLUniformLocation | null
  private uGroundShininess: WebGLUniformLocation | null
  private uGroundSpecColor: WebGLUniformLocation | null
  private uGroundBlobCenter0: WebGLUniformLocation | null
  private uGroundBlobRadius0: WebGLUniformLocation | null
  private uGroundBlobStrength0: WebGLUniformLocation | null
  private uGroundBlobCenter1: WebGLUniformLocation | null
  private uGroundBlobRadius1: WebGLUniformLocation | null
  private uGroundBlobStrength1: WebGLUniformLocation | null
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

  // Shadows (WebGL2 only)
  private shadowFBO: WebGLFramebuffer | null = null
  private shadowDepthTex: WebGLTexture | null = null
  private shadowProgram: WebGLProgram | null = null
  private uShadowLightViewProj: WebGLUniformLocation | null = null
  private shadowSize = 1024
  private lightView = new Float32Array(16)
  private lightProj = new Float32Array(16)
  private lightViewProj = new Float32Array(16)
  private playerShadowBuffer: WebGLBuffer | null = null

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
    this.uGroundLightDir = gl.getUniformLocation(this.groundProgram, 'u_lightDir')
    this.uGroundLightColor = gl.getUniformLocation(this.groundProgram, 'u_lightColor')
    this.uGroundAmbient = gl.getUniformLocation(this.groundProgram, 'u_ambient')
    this.uGroundCameraPos = gl.getUniformLocation(this.groundProgram, 'u_cameraPos')
    this.uGroundShininess = gl.getUniformLocation(this.groundProgram, 'u_shininess')
    this.uGroundSpecColor = gl.getUniformLocation(this.groundProgram, 'u_specColor')
    this.uGroundBlobCenter0 = gl.getUniformLocation(this.groundProgram, 'u_blobCenter0')
    this.uGroundBlobRadius0 = gl.getUniformLocation(this.groundProgram, 'u_blobRadius0')
    this.uGroundBlobStrength0 = gl.getUniformLocation(this.groundProgram, 'u_blobStrength0')
    this.uGroundBlobCenter1 = gl.getUniformLocation(this.groundProgram, 'u_blobCenter1')
    this.uGroundBlobRadius1 = gl.getUniformLocation(this.groundProgram, 'u_blobRadius1')
    this.uGroundBlobStrength1 = gl.getUniformLocation(this.groundProgram, 'u_blobStrength1')

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

    // Ground vertex data: position (x,y,z) + uv (u,v) + normal (nx,ny,nz)
    const size = TERRAIN_SIZE
    const tiling = 20
    const res = 128 // quads per side
    const verts: number[] = []
    const grid = res + 1

    // Precompute positions along axes
    const posX = new Float32Array(grid)
    const posZ = new Float32Array(grid)
    for (let i = 0; i < grid; i++) {
      posX[i] = -size + (i / res) * (2 * size)
      posZ[i] = -size + (i / res) * (2 * size)
    }

    // Precompute heights
    const heights = new Float32Array(grid * grid)
    const hIdx = (ix: number, iz: number) => iz * grid + ix
    for (let iz = 0; iz < grid; iz++) {
      const z = posZ[iz]
      for (let ix = 0; ix < grid; ix++) {
        const x = posX[ix]
        heights[hIdx(ix, iz)] = heightAt(x, z)
      }
    }

    // Compute per-vertex normals via heightfield gradient
    const normals = new Float32Array(grid * grid * 3)
    const nIdx = (ix: number, iz: number) => (iz * grid + ix) * 3
    for (let iz = 0; iz < grid; iz++) {
      const izm = iz > 0 ? iz - 1 : iz
      const izp = iz < res ? iz + 1 : iz
      const dz = posZ[izp] - posZ[izm] || 1
      for (let ix = 0; ix < grid; ix++) {
        const ixm = ix > 0 ? ix - 1 : ix
        const ixp = ix < res ? ix + 1 : ix
        const dx = posX[ixp] - posX[ixm] || 1
        const dhdx = (heights[hIdx(ixp, iz)] - heights[hIdx(ixm, iz)]) / dx
        const dhdz = (heights[hIdx(ix, izp)] - heights[hIdx(ix, izm)]) / dz
        // Normal of heightfield: (-dhdx, 1, -dhdz)
        let nx = -dhdx
        let ny = 1.0
        let nz = -dhdz
        const len = Math.hypot(nx, ny, nz) || 1
        nx /= len; ny /= len; nz /= len
        const ni = nIdx(ix, iz)
        normals[ni + 0] = nx
        normals[ni + 1] = ny
        normals[ni + 2] = nz
      }
    }

    // Build triangles with shared-vertex normals
    for (let iz = 0; iz < res; iz++) {
      const z0 = posZ[iz]
      const z1 = posZ[iz + 1]
      const v0 = (iz / res) * tiling
      const v1 = ((iz + 1) / res) * tiling
      for (let ix = 0; ix < res; ix++) {
        const x0 = posX[ix]
        const x1 = posX[ix + 1]
        const u0 = (ix / res) * tiling
        const u1 = ((ix + 1) / res) * tiling
        const y00 = heights[hIdx(ix, iz)]
        const y10 = heights[hIdx(ix + 1, iz)]
        const y11 = heights[hIdx(ix + 1, iz + 1)]
        const y01 = heights[hIdx(ix, iz + 1)]

        const n00i = nIdx(ix, iz)
        const n10i = nIdx(ix + 1, iz)
        const n11i = nIdx(ix + 1, iz + 1)
        const n01i = nIdx(ix, iz + 1)

        // tri 1: (x0,z0) (x1,z0) (x1,z1)
        verts.push(x0, y00, z0,  u0, v0,  normals[n00i], normals[n00i+1], normals[n00i+2])
        verts.push(x1, y10, z0,  u1, v0,  normals[n10i], normals[n10i+1], normals[n10i+2])
        verts.push(x1, y11, z1,  u1, v1,  normals[n11i], normals[n11i+1], normals[n11i+2])
        // tri 2: (x0,z0) (x1,z1) (x0,z1)
        verts.push(x0, y00, z0,  u0, v0,  normals[n00i], normals[n00i+1], normals[n00i+2])
        verts.push(x1, y11, z1,  u1, v1,  normals[n11i], normals[n11i+1], normals[n11i+2])
        verts.push(x0, y01, z1,  u0, v1,  normals[n01i], normals[n01i+1], normals[n01i+2])
      }
    }
    const groundVerts = new Float32Array(verts)
    this.groundVertexCount = groundVerts.length / 8
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

    // Shadow map (WebGL2 only)
    if (this.isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext
      const depthTex = gl2.createTexture()
      if (!depthTex) throw new Error('Failed to create shadow depth texture')
      this.shadowDepthTex = depthTex
      gl2.bindTexture(gl2.TEXTURE_2D, depthTex)
      gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.DEPTH_COMPONENT16, this.shadowSize, this.shadowSize, 0, gl2.DEPTH_COMPONENT, gl2.UNSIGNED_SHORT, null)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.NEAREST)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.NEAREST)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.CLAMP_TO_EDGE)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE)

      const fbo = gl2.createFramebuffer()
      if (!fbo) throw new Error('Failed to create shadow FBO')
      this.shadowFBO = fbo
      gl2.bindFramebuffer(gl2.FRAMEBUFFER, fbo)
      gl2.framebufferTexture2D(gl2.FRAMEBUFFER, gl2.DEPTH_ATTACHMENT, gl2.TEXTURE_2D, depthTex, 0)
      gl2.drawBuffers([gl2.NONE])
      gl2.readBuffer(gl2.NONE)
      const fbStatus = gl2.checkFramebufferStatus(gl2.FRAMEBUFFER)
      if (fbStatus !== gl2.FRAMEBUFFER_COMPLETE) {
        console.warn('Shadow framebuffer incomplete:', fbStatus)
      }
      gl2.bindFramebuffer(gl2.FRAMEBUFFER, null)

      const sprog = createProgram(gl2, shadowVert300, shadowFrag300)
      this.shadowProgram = sprog
      this.uShadowLightViewProj = gl2.getUniformLocation(sprog, 'u_lightViewProj')

      const psb = gl2.createBuffer()
      if (!psb) throw new Error('Failed to create player shadow buffer')
      this.playerShadowBuffer = psb
    }
  }

  render(view: Float32Array, proj: Float32Array, cameraPos?: readonly number[], player?: { pos: readonly number[], radius: number, height: number }) {
    const gl = this.gl
    const viewProj = new Float32Array(16)
    mat4Multiply(viewProj, proj as any, view as any)

    // Directional light setup shared with shading and shadows
    const lightDir = new Float32Array([0.4, 1.0, 0.3])
    {
      const len = Math.hypot(lightDir[0], lightDir[1], lightDir[2]) || 1
      lightDir[0] /= len; lightDir[1] /= len; lightDir[2] /= len
    }
    // Build light matrices covering the world extents
    const center: [number, number, number] = cameraPos ? [cameraPos[0], 0, cameraPos[2]] : [0, 0, 0]
    const dist = 60
    const eye: [number, number, number] = [
      center[0] - lightDir[0] * dist,
      center[1] - lightDir[1] * dist,
      center[2] - lightDir[2] * dist,
    ]
    mat4LookAt(this.lightView, eye, center, [0, 1, 0])
    // Tighter, camera-centered shadow box for sharper shadows near the player
    const range = Math.min(TERRAIN_SIZE, 25)
    mat4Ortho(this.lightProj, -range, range, -range, range, 1, 200)
    mat4Multiply(this.lightViewProj, this.lightProj as any, this.lightView as any)

    // Shadow pass (WebGL2): render cube and player capsule to depth
    if (this.isWebGL2 && this.shadowFBO && this.shadowProgram && this.shadowDepthTex) {
      const gl2 = gl as WebGL2RenderingContext
      gl2.bindFramebuffer(gl2.FRAMEBUFFER, this.shadowFBO)
      gl2.viewport(0, 0, this.shadowSize, this.shadowSize)
      gl2.clearDepth(1.0)
      gl2.clear(gl2.DEPTH_BUFFER_BIT)
      gl2.colorMask(false, false, false, false)
      gl2.enable(gl2.DEPTH_TEST)
      // Reduce acne with polygon offset and front-face culling in shadow pass
      gl2.enable(gl2.POLYGON_OFFSET_FILL)
      gl2.polygonOffset(1.1, 4.0)
      gl2.enable(gl2.CULL_FACE)
      gl2.cullFace(gl2.FRONT)
      gl2.useProgram(this.shadowProgram)
      gl2.uniformMatrix4fv(this.uShadowLightViewProj, false, this.lightViewProj)
      // Cube
      gl2.bindBuffer(gl2.ARRAY_BUFFER, this.buffer)
      gl2.enableVertexAttribArray(0)
      gl2.vertexAttribPointer(0, 3, gl2.FLOAT, false, 6 * 4, 0)
      gl2.drawArrays(gl2.TRIANGLES, 0, 36)
      // Player capsule (approx)
      if (player && this.playerShadowBuffer) {
        const verts = this.buildPlayerCapsule(player.pos, player.radius, player.height)
        gl2.bindBuffer(gl2.ARRAY_BUFFER, this.playerShadowBuffer)
        gl2.bufferData(gl2.ARRAY_BUFFER, verts, gl2.DYNAMIC_DRAW)
        gl2.enableVertexAttribArray(0)
        gl2.vertexAttribPointer(0, 3, gl2.FLOAT, false, 3 * 4, 0)
        gl2.drawArrays(gl2.TRIANGLES, 0, verts.length / 3)
      }
      gl2.bindFramebuffer(gl2.FRAMEBUFFER, null)
      gl2.colorMask(true, true, true, true)
      gl2.viewport(0, 0, gl2.drawingBufferWidth, gl2.drawingBufferHeight)
      gl2.disable(gl2.POLYGON_OFFSET_FILL)
      gl2.disable(gl2.CULL_FACE)
      }

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
    // Basic lighting setup (directional sun + ambient)
    gl.uniform3fv(this.uGroundLightDir, lightDir)
    gl.uniform3f(this.uGroundLightColor, 1.0, 0.98, 0.92)
    gl.uniform3f(this.uGroundAmbient, 0.22, 0.24, 0.26)
    if (cameraPos) {
      gl.uniform3f(this.uGroundCameraPos, cameraPos[0], cameraPos[1], cameraPos[2])
    }
    gl.uniform1f(this.uGroundShininess, 64.0)
    gl.uniform3f(this.uGroundSpecColor, 0.01, 0.01, 0.01)
    // Blob shadow uniforms (works in WebGL1/2)
    // Cube blob at origin
    if (this.uGroundBlobCenter0) gl.uniform3f(this.uGroundBlobCenter0, 0, 0, 0)
    if (this.uGroundBlobRadius0) gl.uniform1f(this.uGroundBlobRadius0, 1.6)
    if (this.uGroundBlobStrength0) gl.uniform1f(this.uGroundBlobStrength0, 0.6)
    // Player blob
    if (player) {
      if (this.uGroundBlobCenter1) gl.uniform3f(this.uGroundBlobCenter1, player.pos[0], 0, player.pos[2])
      if (this.uGroundBlobRadius1) gl.uniform1f(this.uGroundBlobRadius1, player.radius * 1.8)
      if (this.uGroundBlobStrength1) gl.uniform1f(this.uGroundBlobStrength1, 0.6)
    } else {
      if (this.uGroundBlobCenter1) gl.uniform3f(this.uGroundBlobCenter1, 9999, 0, 9999)
      if (this.uGroundBlobRadius1) gl.uniform1f(this.uGroundBlobRadius1, 0.0)
      if (this.uGroundBlobStrength1) gl.uniform1f(this.uGroundBlobStrength1, 0.0)
    }
    if (this.isWebGL2 && this.shadowDepthTex) {
      const uLVP = gl.getUniformLocation(this.groundProgram, 'u_lightViewProj')
      if (uLVP) gl.uniformMatrix4fv(uLVP, false, this.lightViewProj)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, this.shadowDepthTex)
      const uShadowSampler = gl.getUniformLocation(this.groundProgram, 'u_shadowMap')
      if (uShadowSampler) gl.uniform1i(uShadowSampler, 1)
      const uShadowTexel = gl.getUniformLocation(this.groundProgram, 'u_shadowTexel')
      if (uShadowTexel) gl.uniform2f(uShadowTexel, 1 / this.shadowSize, 1 / this.shadowSize)
      const uShadowBias = gl.getUniformLocation(this.groundProgram, 'u_shadowBias')
      if (uShadowBias) gl.uniform1f(uShadowBias, 0.02)
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundBuffer)
    const gStride = 8 * 4
    if (this.isWebGL2) {
      const posLoc = 0
      const uvLoc = 1
      const nLoc = 2
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, gStride, 0)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, gStride, 3 * 4)
      gl.enableVertexAttribArray(nLoc)
      gl.vertexAttribPointer(nLoc, 3, gl.FLOAT, false, gStride, 5 * 4)
    } else {
      const posLoc = gl.getAttribLocation(this.groundProgram, 'a_position')
      const uvLoc = gl.getAttribLocation(this.groundProgram, 'a_uv')
      const nLoc = gl.getAttribLocation(this.groundProgram, 'a_normal')
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, gStride, 0)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, gStride, 3 * 4)
      if (nLoc !== -1) {
        gl.enableVertexAttribArray(nLoc)
        gl.vertexAttribPointer(nLoc, 3, gl.FLOAT, false, gStride, 5 * 4)
      }
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

  // Build a minimal capsule-like mesh (cylinder with flat caps) for shadow casting
  private buildPlayerCapsule(pos: readonly number[], radius: number, height: number): Float32Array {
    const seg = 16
    const verts: number[] = []
    const y0 = pos[1]
    const y1 = pos[1] + height
    // Side quads
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2
      const a1 = ((i + 1) / seg) * Math.PI * 2
      const x0 = pos[0] + Math.cos(a0) * radius
      const z0 = pos[2] + Math.sin(a0) * radius
      const x1 = pos[0] + Math.cos(a1) * radius
      const z1 = pos[2] + Math.sin(a1) * radius
      // tri 1
      verts.push(x0, y0, z0,  x1, y0, z1,  x1, y1, z1)
      // tri 2
      verts.push(x0, y0, z0,  x1, y1, z1,  x0, y1, z0)
    }
    // Bottom cap fan
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2
      const a1 = ((i + 1) / seg) * Math.PI * 2
      const x0 = pos[0] + Math.cos(a0) * radius
      const z0 = pos[2] + Math.sin(a0) * radius
      const x1 = pos[0] + Math.cos(a1) * radius
      const z1 = pos[2] + Math.sin(a1) * radius
      verts.push(pos[0], y0, pos[2],  x1, y0, z1,  x0, y0, z0)
    }
    // Top cap fan
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2
      const a1 = ((i + 1) / seg) * Math.PI * 2
      const x0 = pos[0] + Math.cos(a0) * radius
      const z0 = pos[2] + Math.sin(a0) * radius
      const x1 = pos[0] + Math.cos(a1) * radius
      const z1 = pos[2] + Math.sin(a1) * radius
      verts.push(pos[0], y1, pos[2],  x0, y1, z0,  x1, y1, z1)
    }
    return new Float32Array(verts)
  }
}
