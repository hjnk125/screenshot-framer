import { calculateCanvasSize, buildShadow } from '../utils/compositor'
import type { ShadowConfig } from '../types/frame'

describe('calculateCanvasSize', () => {
  it('1x 스케일에서 에셋 기준 캔버스 크기를 반환한다', () => {
    const result = calculateCanvasSize(1500, 950, 1)
    expect(result).toEqual({ width: 1500, height: 950 })
  })

  it('2x 스케일에서 두 배 크기를 반환한다', () => {
    const result = calculateCanvasSize(1500, 950, 2)
    expect(result).toEqual({ width: 3000, height: 1900 })
  })

  it('3x 스케일에서 세 배 크기를 반환한다', () => {
    const result = calculateCanvasSize(1500, 950, 3)
    expect(result).toEqual({ width: 4500, height: 2850 })
  })
})

describe('buildShadow', () => {
  it('disabled 상태면 빈 shadow 설정을 반환한다', () => {
    const config: ShadowConfig = { enabled: false, color: '#000', blur: 40, intensity: 50 }
    const result = buildShadow(config)
    expect(result.shadowBlur).toBe(0)
    expect(result.shadowColor).toBe('transparent')
  })

  it('enabled 상태면 blur와 color를 반환한다', () => {
    const config: ShadowConfig = { enabled: true, color: '#000000', blur: 60, intensity: 50 }
    const result = buildShadow(config)
    expect(result.shadowBlur).toBe(60)
    expect(result.shadowColor).toBe('#000000')
  })

  it('intensity 50이면 offsetY가 양수다', () => {
    const config: ShadowConfig = { enabled: true, color: '#000', blur: 40, intensity: 50 }
    const result = buildShadow(config)
    expect(result.shadowOffsetY).toBeGreaterThan(0)
  })
})
