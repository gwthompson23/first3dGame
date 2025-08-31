// Minimal Radiance .hdr (RGBE) loader that decodes to LDR RGBA8
// Tone maps with simple Reinhard + gamma 2.2

function toneMapReinhard(c: number): number {
  return c / (1.0 + c)
}

function gammaEncode(c: number): number {
  return Math.pow(Math.max(0, c), 1.0 / 2.2)
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return await res.arrayBuffer()
}

// Parses Radiance .hdr (new RLE format) into Float32 RGB
function parseHDR(data: Uint8Array): { width: number; height: number; rgb: Float32Array } {
  let pos = 0
  function readLine(): string {
    let s = ''
    while (pos < data.length) {
      const c = data[pos++]
      if (c === 10) break
      s += String.fromCharCode(c)
    }
    return s
  }
  // Header
  let line = readLine()
  if (!line.startsWith('#?RADIANCE') && !line.startsWith('#?RGBE')) {
    throw new Error('Invalid HDR header')
  }
  // Read until empty line
  while (true) {
    line = readLine()
    if (line.length === 0) break
  }
  // Resolution string, e.g., "-Y 512 +X 1024"
  const resLine = readLine()
  const m = resLine.match(/([\-\+])Y\s+(\d+)\s+([\-\+])X\s+(\d+)/)
  if (!m) throw new Error('Invalid HDR resolution line')
  const height = parseInt(m[2], 10)
  const width = parseInt(m[4], 10)

  const rgb = new Float32Array(width * height * 3)
  const scanline = new Uint8Array(width * 4)
  let outIdx = 0

  for (let y = 0; y < height; y++) {
    const a = data[pos++], b = data[pos++], c = data[pos++], d = data[pos++]
    if (a !== 2 || b !== 2 || (c << 8 | d) !== width) {
      throw new Error('Unsupported HDR scanline format')
    }
    for (let ch = 0; ch < 4; ch++) {
      let x = 0
      while (x < width) {
        const count = data[pos++]
        if (count > 128) {
          const run = count - 128
          const val = data[pos++]
          for (let i = 0; i < run; i++) scanline[ch * width + x++] = val
        } else {
          for (let i = 0; i < count; i++) scanline[ch * width + x++] = data[pos++]
        }
      }
    }
    for (let x = 0; x < width; x++) {
      const r = scanline[x]
      const g = scanline[width + x]
      const b2 = scanline[2 * width + x]
      const e = scanline[3 * width + x]
      if (e) {
        const f = Math.pow(2, e - 128) / 256.0
        rgb[outIdx++] = r * f
        rgb[outIdx++] = g * f
        rgb[outIdx++] = b2 * f
      } else {
        rgb[outIdx++] = 0
        rgb[outIdx++] = 0
        rgb[outIdx++] = 0
      }
    }
  }
  return { width, height, rgb }
}

export async function loadHDRToLDRTexture(gl: WebGLRenderingContext | WebGL2RenderingContext, url: string, options?: { exposure?: number }): Promise<WebGLTexture> {
  const buf = await fetchArrayBuffer(url)
  const { width, height, rgb } = parseHDR(new Uint8Array(buf))
  const exposure = options?.exposure ?? 1.0
  const rgba8 = new Uint8Array(width * height * 4)
  for (let i = 0, j = 0; i < rgb.length; i += 3, j += 4) {
    let r = rgb[i + 0] * exposure
    let g = rgb[i + 1] * exposure
    let b = rgb[i + 2] * exposure
    r = gammaEncode(toneMapReinhard(r))
    g = gammaEncode(toneMapReinhard(g))
    b = gammaEncode(toneMapReinhard(b))
    rgba8[j + 0] = Math.min(255, Math.max(0, Math.round(r * 255)))
    rgba8[j + 1] = Math.min(255, Math.max(0, Math.round(g * 255)))
    rgba8[j + 2] = Math.min(255, Math.max(0, Math.round(b * 255)))
    rgba8[j + 3] = 255
  }
  const tex = gl.createTexture()
  if (!tex) throw new Error('Failed to create texture')
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba8)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return tex
}

