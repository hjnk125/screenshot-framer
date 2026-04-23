import type { Frame, ShadowConfig } from '../types/frame'

describe('타입 구조 검증', () => {
  it('Frame 타입이 필요한 필드를 가진다', () => {
    const frame: Frame = {
      id: 'macbook-pro-16',
      label: 'MacBook Pro 16',
      category: 'device',
      assetPath: '/frames/macbook-pro-16.png',
      screenArea: { x: 100, y: 80, width: 1200, height: 750 },
      aspectRatio: 1.6,
    }
    expect(frame.id).toBe('macbook-pro-16')
    expect(frame.screenArea.width).toBe(1200)
  })

  it('ShadowConfig 타입이 필요한 필드를 가진다', () => {
    const shadow: ShadowConfig = {
      enabled: true,
      color: '#000000',
      blur: 40,
      intensity: 50,
    }
    expect(shadow.blur).toBe(40)
  })
})
