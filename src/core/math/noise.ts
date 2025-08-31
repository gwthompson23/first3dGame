// Simple 2D value noise with fractal Brownian motion (fBm)

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return s - Math.floor(s)
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function smooth(t: number) { return t * t * (3 - 2 * t) }

export function valueNoise2D(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const v00 = hash(xi, yi)
  const v10 = hash(xi + 1, yi)
  const v01 = hash(xi, yi + 1)
  const v11 = hash(xi + 1, yi + 1)
  const ux = smooth(xf)
  const uy = smooth(yf)
  const x1 = lerp(v00, v10, ux)
  const x2 = lerp(v01, v11, ux)
  return lerp(x1, x2, uy)
}

export function fbm2D(x: number, y: number, octaves = 4, lacunarity = 2.0, gain = 0.5): number {
  let amp = 0.5
  let freq = 1.0
  let sum = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq)
    freq *= lacunarity
    amp *= gain
  }
  return sum
}

