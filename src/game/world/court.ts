export type CourtSpec = {
  center: [number, number, number]
  y: number
  halfWidth: number
  length: number // halfcourt length (baseline to midcourt)
  lineWidth: number
  // Derived
  baselineZ: number
  midZ: number
  hoopCenter: [number, number, number]
  backboardZ: number
}

// NBA dimensions in meters
const COURT_WIDTH = 15.24
const HALFLENGTH = 14.326 // halfcourt length
const LINE_WIDTH = 0.0508 // 2 inches
const BACKBOARD_FROM_BASELINE = 1.2192 // 4 ft
const RIM_CENTER_FROM_BACKBOARD = 0.1524 // 6 in
const RIM_HEIGHT = 3.048

export const COURT_CENTER: [number, number, number] = [22, 0, 18]

export const COURT: CourtSpec = (() => {
  const center = COURT_CENTER
  const y = 0
  const halfWidth = COURT_WIDTH / 2
  const length = HALFLENGTH
  const baselineZ = center[2] - length / 2
  const midZ = center[2] + length / 2
  const backboardZ = baselineZ + BACKBOARD_FROM_BASELINE
  const hoopZ = backboardZ + RIM_CENTER_FROM_BACKBOARD
  const hoopCenter: [number, number, number] = [center[0], y + RIM_HEIGHT, hoopZ]
  return { center, y, halfWidth, length, lineWidth: LINE_WIDTH, baselineZ, midZ, hoopCenter, backboardZ }
})()

