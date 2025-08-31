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
import { COURT } from '@/game/world/court'
import { createCourtTexture } from '@/core/renderer/court-texture'
import { Net } from '@/game/world/net'
import { NetRenderer } from '@/core/renderer/net-renderer'
import { createBackboardTexture } from '@/core/renderer/backboard-texture'
import ballVert100 from './shaders/ball.vert.glsl?raw'
import ballFrag100 from './shaders/ball.frag.glsl?raw'
import ballVert300 from './shaders/ball.vert-300es.glsl?raw'
import ballFrag300 from './shaders/ball.frag-300es.glsl?raw'

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
  
  // Court
  private courtBuffer: WebGLBuffer | null = null
  private courtVertexCount = 0
  private courtTex: WebGLTexture | null = null
  // Hoop/backboard
  private hoopBuffer: WebGLBuffer | null = null
  private hoopVertexCount = 0
  private backboardTex: WebGLTexture | null = null
  private backboardBuffer: WebGLBuffer | null = null
  private backboardVertexCount = 0
  private netRenderer: NetRenderer | null = null
  // Basketball (procedural textured sphere)
  private ballProgram: WebGLProgram | null = null
  private uBallViewProj: WebGLUniformLocation | null = null
  private uBallLightDir: WebGLUniformLocation | null = null
  private ballUnit: Float32Array | null = null // pos(3), uv(2), normal(3)
  private ballBuffer: WebGLBuffer | null = null

  // Dynamic primitives: sphere + line
  private sphereUnit: Float32Array | null = null // interleaved pos(3)+col(3)
  private sphereVertexCount = 0
  private sphereBuffer: WebGLBuffer | null = null
  private lineBuffer: WebGLBuffer | null = null

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

    // Start loading textures (respect Vite base for GitHub Pages)
    const BASE = (import.meta as any).env?.BASE_URL ?? '/'
    loadImageTexture(gl, BASE + 'textures/ground/diffuse.jpg').then(tex => { this.groundTex = tex }).catch(() => {})
    loadHDRToLDRTexture(gl, BASE + 'textures/sky/sky.hdr').then(tex => { this.skyTex = tex }).catch(() => {})
    // Build court texture and mesh
    createCourtTexture(gl, COURT).then(({ tex }) => { this.courtTex = tex }).catch(() => {})
    {
      const y = COURT.y + 0.01
      const hw = COURT.halfWidth
      const hl = COURT.length / 2
      // Two triangles, with normals up and uv 0..1 across the court rect
      const cx = COURT.center[0]
      const cz = COURT.center[2]
      const x0 = cx - hw
      const x1 = cx + hw
      const z0 = cz - hl
      const z1 = cz + hl
      const verts = new Float32Array([
        x0, y, z0,  0, 0,  0, 1, 0,
        x1, y, z0,  1, 0,  0, 1, 0,
        x1, y, z1,  1, 1,  0, 1, 0,
        x0, y, z0,  0, 0,  0, 1, 0,
        x1, y, z1,  1, 1,  0, 1, 0,
        x0, y, z1,  0, 1,  0, 1, 0,
      ])
      const buf = gl.createBuffer()
      if (buf) {
        this.courtBuffer = buf
        this.courtVertexCount = 6
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
      }
    }

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

    // Build hoop/backboard geometry buffer
    {
      const g = this.buildHoopGeometry()
      const buf = gl.createBuffer()
      if (buf) {
        this.hoopBuffer = buf
        this.hoopVertexCount = g.length / 6
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, g, gl.STATIC_DRAW)
      }
    }
    // Backboard front-face textured quad
    createBackboardTexture(gl).then(tex => { this.backboardTex = tex }).catch(() => {})
    {
      const boardW = 1.829
      const boardH = 1.067
      const boardT = 0.05
      const cx = COURT.center[0]
      const backZ = COURT.backboardZ
      const rimY = COURT.hoopCenter[1]
      const boardCenterY = rimY + 0.305
      const y0 = boardCenterY - boardH / 2
      const y1 = boardCenterY + boardH / 2
      const x0 = cx - boardW / 2
      const x1 = cx + boardW / 2
      // Place overlay just in front of recessed side faces
      const z = backZ + boardT / 2 + 0.002
      // pos, uv, normal
      const verts = new Float32Array([
        x0, y0, z,  0, 0,  0, 0, 1,
        x1, y0, z,  1, 0,  0, 0, 1,
        x1, y1, z,  1, 1,  0, 0, 1,
        x0, y0, z,  0, 0,  0, 0, 1,
        x1, y1, z,  1, 1,  0, 0, 1,
        x0, y1, z,  0, 1,  0, 0, 1,
      ])
      const buf = gl.createBuffer()
      if (buf) {
        this.backboardBuffer = buf
        this.backboardVertexCount = 6
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
      }
    }
    // Net renderer
    this.netRenderer = new NetRenderer(gl)

    // Build basketball shader program
    try {
      const bvs = this.isWebGL2 ? ballVert300 : ballVert100
      const bfs = this.isWebGL2 ? ballFrag300 : ballFrag100
      const prog = createProgram(gl, bvs, bfs)
      this.ballProgram = prog
      this.uBallViewProj = gl.getUniformLocation(prog, 'u_viewProj')
      this.uBallLightDir = gl.getUniformLocation(prog, 'u_lightDir')
    } catch {}
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
      // Hoop/backboard into shadow map
      if (this.hoopBuffer) {
        gl2.bindBuffer(gl2.ARRAY_BUFFER, this.hoopBuffer)
        gl2.enableVertexAttribArray(0)
        gl2.vertexAttribPointer(0, 3, gl2.FLOAT, false, 6 * 4, 0)
        gl2.drawArrays(gl2.TRIANGLES, 0, this.hoopVertexCount)
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

    // 2b) Court plane
    if (this.courtBuffer && this.courtTex) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.courtBuffer)
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
      gl.uniform2f(this.uGroundTile, 1.0, 1.0)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.courtTex)
      gl.uniform1i(this.uGroundSampler, 0)
      gl.drawArrays(gl.TRIANGLES, 0, this.courtVertexCount)
    }

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

    // 3b) Hoop/backboard (colored)
    if (this.hoopBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.hoopBuffer)
      const stride2 = 6 * 4
      if (this.isWebGL2) {
        const posLoc = 0
        const colLoc = 1
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride2, 0)
        gl.enableVertexAttribArray(colLoc)
        gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, stride2, 3 * 4)
      } else {
        const posLoc = gl.getAttribLocation(this.program, 'a_position')
        const colLoc = gl.getAttribLocation(this.program, 'a_color')
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride2, 0)
        gl.enableVertexAttribArray(colLoc)
        gl.vertexAttribPointer(colLoc, 3, gl.FLOAT, false, stride2, 3 * 4)
      }
      gl.drawArrays(gl.TRIANGLES, 0, this.hoopVertexCount)
    }

    // 3c) Backboard front-face texture overlay (lit)
    if (this.backboardBuffer && this.backboardTex) {
      gl.useProgram(this.groundProgram)
      gl.uniformMatrix4fv(this.uGroundViewProj, false, viewProj)
      gl.uniform2f(this.uGroundTile, 1.0, 1.0)
      // Reuse lighting params from ground
      const ldir = new Float32Array([0.4, 1.0, 0.3])
      {
        const len = Math.hypot(ldir[0], ldir[1], ldir[2]) || 1
        ldir[0] /= len; ldir[1] /= len; ldir[2] /= len
      }
      gl.uniform3fv(this.uGroundLightDir, ldir)
      gl.uniform3f(this.uGroundLightColor, 1.0, 0.98, 0.92)
      gl.uniform3f(this.uGroundAmbient, 0.22, 0.24, 0.26)
      if (cameraPos) gl.uniform3f(this.uGroundCameraPos, cameraPos[0], cameraPos[1], cameraPos[2])
      gl.uniform1f(this.uGroundShininess, 64.0)
      gl.uniform3f(this.uGroundSpecColor, 0.01, 0.01, 0.01)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.backboardBuffer)
      const stride3 = 8 * 4
      if (this.isWebGL2) {
        const posLoc = 0
        const uvLoc = 1
        const nLoc = 2
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride3, 0)
        gl.enableVertexAttribArray(uvLoc)
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride3, 3 * 4)
        gl.enableVertexAttribArray(nLoc)
        gl.vertexAttribPointer(nLoc, 3, gl.FLOAT, false, stride3, 5 * 4)
      } else {
        const posLoc = gl.getAttribLocation(this.groundProgram, 'a_position')
        const uvLoc = gl.getAttribLocation(this.groundProgram, 'a_uv')
        const nLoc = gl.getAttribLocation(this.groundProgram, 'a_normal')
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride3, 0)
        gl.enableVertexAttribArray(uvLoc)
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride3, 3 * 4)
        if (nLoc !== -1) {
          gl.enableVertexAttribArray(nLoc)
          gl.vertexAttribPointer(nLoc, 3, gl.FLOAT, false, stride3, 5 * 4)
        }
      }
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.backboardTex)
      gl.uniform1i(this.uGroundSampler, 0)
      gl.drawArrays(gl.TRIANGLES, 0, this.backboardVertexCount)
    }

    // 3d) Net lines
    if (this.netRenderer) {
      this.netRenderer.render(this.program, this.uViewProj, viewProj, this.isWebGL2)
    }
  }

  syncNet(net: Net, camPos: readonly number[]) {
    if (this.netRenderer) this.netRenderer.sync(net, camPos)
  }

  // Draw a colored sphere at center with radius
  renderSphere(viewProj: Float32Array, center: readonly number[], radius: number, color: readonly number[]) {
    const gl = this.gl
    if (!this.sphereUnit) this.buildSphereUnit()
    if (!this.sphereBuffer) {
      const b = gl.createBuffer(); if (!b) return; this.sphereBuffer = b
    }
    const unit = this.sphereUnit as Float32Array
    const out = new Float32Array(unit.length)
    for (let i = 0; i < unit.length; i += 6) {
      out[i + 0] = center[0] + unit[i + 0] * radius
      out[i + 1] = center[1] + unit[i + 1] * radius
      out[i + 2] = center[2] + unit[i + 2] * radius
      out[i + 3] = color[0]
      out[i + 4] = color[1]
      out[i + 5] = color[2]
    }
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uViewProj, false, viewProj)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, out, gl.DYNAMIC_DRAW)
    const stride = 6 * 4
    if (this.isWebGL2) {
      const posLoc = 0, colLoc = 1
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
    gl.drawArrays(gl.TRIANGLES, 0, this.sphereVertexCount)
  }

  // Draw a colored line strip from 3D points
  renderLineStrip(viewProj: Float32Array, points: readonly number[], color: readonly number[]) {
    const gl = this.gl
    if (!this.lineBuffer) { const b = gl.createBuffer(); if (!b) return; this.lineBuffer = b }
    const n = Math.floor(points.length / 3)
    if (n <= 1) return
    const data = new Float32Array(n * 6)
    for (let i = 0; i < n; i++) {
      data[i*6+0] = points[i*3+0]
      data[i*6+1] = points[i*3+1]
      data[i*6+2] = points[i*3+2]
      data[i*6+3] = color[0]
      data[i*6+4] = color[1]
      data[i*6+5] = color[2]
    }
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uViewProj, false, viewProj)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
    const stride = 6 * 4
    if (this.isWebGL2) {
      const posLoc = 0, colLoc = 1
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
    gl.lineWidth(2)
    gl.drawArrays(gl.LINE_STRIP, 0, n)
  }

  // Draw lines from an interleaved array [x,y,z,r,g,b] per-vertex (pairs make segments)
  renderLines(viewProj: Float32Array, vertices: Float32Array) {
    const gl = this.gl
    if (vertices.length === 0) return
    if (!this.lineBuffer) { const b = gl.createBuffer(); if (!b) return; this.lineBuffer = b }
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uViewProj, false, viewProj)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)
    const stride = 6 * 4
    if (this.isWebGL2) {
      const posLoc = 0, colLoc = 1
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
    gl.lineWidth(2)
    gl.drawArrays(gl.LINES, 0, vertices.length / 6)
  }

  private buildSphereUnit() {
    const segU = 18
    const segV = 12
    const verts: number[] = []
    for (let v = 0; v < segV; v++) {
      const v0 = v / segV
      const v1 = (v + 1) / segV
      const phi0 = v0 * Math.PI
      const phi1 = v1 * Math.PI
      for (let u = 0; u < segU; u++) {
        const u0 = u / segU
        const u1 = (u + 1) / segU
        const th0 = u0 * Math.PI * 2
        const th1 = u1 * Math.PI * 2
        const p000 = sph(th0, phi0)
        const p010 = sph(th1, phi0)
        const p011 = sph(th1, phi1)
        const p001 = sph(th0, phi1)
        // tri1
        verts.push(p000[0], p000[1], p000[2], 1, 1, 1)
        verts.push(p010[0], p010[1], p010[2], 1, 1, 1)
        verts.push(p011[0], p011[1], p011[2], 1, 1, 1)
        // tri2
        verts.push(p000[0], p000[1], p000[2], 1, 1, 1)
        verts.push(p011[0], p011[1], p011[2], 1, 1, 1)
        verts.push(p001[0], p001[1], p001[2], 1, 1, 1)
      }
    }
    function sph(theta: number, phi: number): [number, number, number] {
      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)
      return [x, y, z]
    }
    this.sphereUnit = new Float32Array(verts)
    this.sphereVertexCount = verts.length / 6
  }

  // Unit sphere for ball: pos, uv, normal interleaved
  private buildBallUnit() {
    const segU = 36
    const segV = 18
    const verts: number[] = []
    for (let v = 0; v < segV; v++) {
      const v0 = v / segV
      const v1 = (v + 1) / segV
      const phi0 = v0 * Math.PI
      const phi1 = v1 * Math.PI
      for (let u = 0; u < segU; u++) {
        const u0 = u / segU
        const u1 = (u + 1) / segU
        const th0 = u0 * Math.PI * 2
        const th1 = u1 * Math.PI * 2
        const p000 = sph(th0, phi0)
        const p010 = sph(th1, phi0)
        const p011 = sph(th1, phi1)
        const p001 = sph(th0, phi1)
        // tri1
        push(p000, [u0, v0]); push(p010, [u1, v0]); push(p011, [u1, v1])
        // tri2
        push(p000, [u0, v0]); push(p011, [u1, v1]); push(p001, [u0, v1])
      }
    }
    function sph(theta: number, phi: number): [number, number, number] {
      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)
      return [x, y, z]
    }
    function push(p: [number, number, number], uv: [number, number]) {
      const nx = p[0], ny = p[1], nz = p[2]
      verts.push(p[0], p[1], p[2],  uv[0], uv[1],  nx, ny, nz)
    }
    this.ballUnit = new Float32Array(verts)
  }

  renderBasketball(viewProj: Float32Array, center: readonly number[], radius: number, rot3x3: Float32Array) {
    if (!this.ballProgram) { return this.renderSphere(viewProj, center, radius, [0.92,0.45,0.1]) }
    const gl = this.gl
    if (!this.ballUnit) this.buildBallUnit()
    if (!this.ballBuffer) { const b = gl.createBuffer(); if (!b) return; this.ballBuffer = b }
    const unit = this.ballUnit as Float32Array
    const nverts = unit.length / 8
    const out = new Float32Array(unit.length)
    const m = rot3x3
    for (let i = 0; i < nverts; i++) {
      const ip = i*8
      // transform position by R, scale, translate
      const ux = unit[ip+0], uy = unit[ip+1], uz = unit[ip+2]
      const rx = m[0]*ux + m[1]*uy + m[2]*uz
      const ry = m[3]*ux + m[4]*uy + m[5]*uz
      const rz = m[6]*ux + m[7]*uy + m[8]*uz
      out[ip+0] = center[0] + rx * radius
      out[ip+1] = center[1] + ry * radius
      out[ip+2] = center[2] + rz * radius
      // uv passthrough
      out[ip+3] = unit[ip+3]
      out[ip+4] = unit[ip+4]
      // normal transform by R
      const nxu = unit[ip+5], nyu = unit[ip+6], nzu = unit[ip+7]
      out[ip+5] = m[0]*nxu + m[1]*nyu + m[2]*nzu
      out[ip+6] = m[3]*nxu + m[4]*nyu + m[5]*nzu
      out[ip+7] = m[6]*nxu + m[7]*nyu + m[8]*nzu
    }
    gl.useProgram(this.ballProgram)
    gl.uniformMatrix4fv(this.uBallViewProj, false, viewProj)
    // light dir like ground
    const ld = new Float32Array([0.4, 1.0, 0.3])
    const len = Math.hypot(ld[0], ld[1], ld[2]) || 1
    ld[0]/=len; ld[1]/=len; ld[2]/=len
    gl.uniform3fv(this.uBallLightDir, ld)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ballBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, out, gl.DYNAMIC_DRAW)
    const stride = 8 * 4
    if (this.isWebGL2) {
      const posLoc = 0, uvLoc = 1, nLoc = 2
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 3 * 4)
      gl.enableVertexAttribArray(nLoc)
      gl.vertexAttribPointer(nLoc, 3, gl.FLOAT, false, stride, 5 * 4)
    } else {
      const posLoc = gl.getAttribLocation(this.ballProgram, 'a_position')
      const uvLoc = gl.getAttribLocation(this.ballProgram, 'a_uv')
      const nLoc = gl.getAttribLocation(this.ballProgram, 'a_normal')
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 3 * 4)
      gl.enableVertexAttribArray(nLoc)
      gl.vertexAttribPointer(nLoc, 3, gl.FLOAT, false, stride, 5 * 4)
    }
    gl.drawArrays(gl.TRIANGLES, 0, nverts)
  }

  // Generate simple hoop/backboard geometry: pole (box), backboard (box), rim (ring)
  private buildHoopGeometry(): Float32Array {
    const colGray = [0.6, 0.6, 0.65]
    const colWhite = [0.95, 0.95, 0.98]
    const colOrange = [0.9, 0.45, 0.1]
    const v: number[] = []
    const pushBox = (min: [number, number, number], max: [number, number, number], col: number[]) => {
      const [x0,y0,z0] = min, [x1,y1,z1] = max
      // 12 triangles, 36 vertices; each vertex: pos(3)+col(3)
      const quads = [
        // +X
        [ [x1,y0,z0],[x1,y0,z1],[x1,y1,z1], [x1,y0,z0],[x1,y1,z1],[x1,y1,z0] ],
        // -X
        [ [x0,y0,z0],[x0,y1,z1],[x0,y0,z1], [x0,y0,z0],[x0,y1,z0],[x0,y1,z1] ],
        // +Y
        [ [x0,y1,z0],[x1,y1,z1],[x1,y1,z0], [x0,y1,z0],[x0,y1,z1],[x1,y1,z1] ],
        // -Y
        [ [x0,y0,z0],[x1,y0,z0],[x1,y0,z1], [x0,y0,z0],[x1,y0,z1],[x0,y0,z1] ],
        // +Z
        [ [x0,y0,z1],[x0,y1,z1],[x1,y1,z1], [x0,y0,z1],[x1,y1,z1],[x1,y0,z1] ],
        // -Z
        [ [x0,y0,z0],[x1,y1,z0],[x0,y1,z0], [x0,y0,z0],[x1,y0,z0],[x1,y1,z0] ],
      ] as const
      for (const q of quads) {
        for (const p of q) { v.push(p[0],p[1],p[2], col[0],col[1],col[2]) }
      }
    }
    // Rim ring (flat strip). Clamp back side so it never goes behind backboard front.
    const pushRing = (center: [number, number, number], rIn: number, rOut: number, y: number, seg = 24) => {
      const zMin = COURT.backboardZ + 0.05/2 + 0.002 // keep in front of backboard
      for (let i = 0; i < seg; i++) {
        const a0 = (i / seg) * Math.PI * 2
        const a1 = ((i + 1) / seg) * Math.PI * 2
        const c0 = Math.cos(a0), s0 = Math.sin(a0)
        const c1 = Math.cos(a1), s1 = Math.sin(a1)
        const x0i = center[0] + c0 * rIn
        let z0i = center[2] + s0 * rIn
        const x0o = center[0] + c0 * rOut
        let z0o = center[2] + s0 * rOut
        const x1i = center[0] + c1 * rIn
        let z1i = center[2] + s1 * rIn
        const x1o = center[0] + c1 * rOut
        let z1o = center[2] + s1 * rOut
        // Clamp any vertex that would fall behind the backboard front plane
        if (z0i < zMin) z0i = zMin
        if (z0o < zMin) z0o = zMin
        if (z1i < zMin) z1i = zMin
        if (z1o < zMin) z1o = zMin
        v.push(x0i,y,z0i, ...colOrange)
        v.push(x1i,y,z1i, ...colOrange)
        v.push(x1o,y,z1o, ...colOrange)
        v.push(x0i,y,z0i, ...colOrange)
        v.push(x1o,y,z1o, ...colOrange)
        v.push(x0o,y,z0o, ...colOrange)
      }
    }
    // Build using COURT spec
    const cx = COURT.center[0]
    const baseZ = COURT.baselineZ
    const backZ = COURT.backboardZ
    const rimY = COURT.hoopCenter[1]
    const rimZ = COURT.hoopCenter[2]

    // Pole (box) behind baseline
    const poleW = 0.18
    const poleD = 0.18
    const poleH = 3.4
    const poleZ = baseZ - 0.8 - poleD/2
    pushBox([cx - poleW/2, 0, poleZ - poleD/2], [cx + poleW/2, poleH, poleZ + poleD/2], colGray)

    // Backboard box at backZ (thin) — omit the +Z face (front) to avoid z-fighting with the textured overlay
    const boardW = 1.829
    const boardH = 1.067
    const boardT = 0.05
    const boardCenterY = rimY + 0.305
    {
      const x0 = cx - boardW/2, x1 = cx + boardW/2
      const y0 = boardCenterY - boardH/2, y1 = boardCenterY + boardH/2
      const z0 = backZ - boardT/2, z1 = backZ + boardT/2
      const zFrontInset = z1 - 0.002 // slightly recess side/top/bottom faces to avoid overlap with overlay
      // +X
      ;(function(){ const pts = [
        [x1,y0,z0],[x1,y0,zFrontInset],[x1,y1,zFrontInset], [x1,y0,z0],[x1,y1,zFrontInset],[x1,y1,z0]
      ] as const; for (const p of pts) v.push(p[0],p[1],p[2], ...colWhite) })()
      // -X
      ;(function(){ const pts = [
        [x0,y0,z0],[x0,y1,zFrontInset],[x0,y0,zFrontInset], [x0,y0,z0],[x0,y1,z0],[x0,y1,zFrontInset]
      ] as const; for (const p of pts) v.push(p[0],p[1],p[2], ...colWhite) })()
      // +Y
      ;(function(){ const pts = [
        [x0,y1,z0],[x1,y1,zFrontInset],[x1,y1,z0], [x0,y1,z0],[x0,y1,zFrontInset],[x1,y1,zFrontInset]
      ] as const; for (const p of pts) v.push(p[0],p[1],p[2], ...colWhite) })()
      // -Y
      ;(function(){ const pts = [
        [x0,y0,z0],[x1,y0,z0],[x1,y0,zFrontInset], [x0,y0,z0],[x1,y0,zFrontInset],[x0,y0,zFrontInset]
      ] as const; for (const p of pts) v.push(p[0],p[1],p[2], ...colWhite) })()
      // -Z (back face)
      ;(function(){ const pts = [
        [x0,y0,z0],[x1,y1,z0],[x0,y1,z0], [x0,y0,z0],[x1,y0,z0],[x1,y1,z0]
      ] as const; for (const p of pts) v.push(p[0],p[1],p[2], ...colWhite) })()
      // (+Z face intentionally omitted)
    }

    // Mounting beams: two horizontal beams from pole to board, plus two short vertical struts near board
    const beamW = 0.10
    const beamH = 0.08
    const poleFrontZ = poleZ + poleD/2
    const boardBackZ = backZ - boardT/2
    // Upper horizontal beam
    pushBox(
      [cx - beamW/2, rimY + 0.20 - beamH/2, poleFrontZ],
      [cx + beamW/2, rimY + 0.20 + beamH/2, boardBackZ],
      colGray,
    )
    // Lower horizontal beam
    pushBox(
      [cx - beamW/2, rimY - 0.20 - beamH/2, poleFrontZ],
      [cx + beamW/2, rimY - 0.20 + beamH/2, boardBackZ],
      colGray,
    )
    // Vertical struts near board
    const strutXOffset = 0.35
    const strutT = 0.08
    pushBox(
      [cx - strutXOffset - strutT/2, rimY - 0.20, boardBackZ - 0.10],
      [cx - strutXOffset + strutT/2, rimY + 0.20, boardBackZ + 0.02],
      colGray,
    )
    pushBox(
      [cx + strutXOffset - strutT/2, rimY - 0.20, boardBackZ - 0.10],
      [cx + strutXOffset + strutT/2, rimY + 0.20, boardBackZ + 0.02],
      colGray,
    )

    // Rim ring centered at hoop
    const rIn = 0.205
    const rOut = 0.255
    pushRing([cx, rimY, rimZ], rIn, rOut, rimY)

    return new Float32Array(v)
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
