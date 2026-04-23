import { FRAMES, getFrameById } from '../data/frames'

describe('FRAMES 메타데이터', () => {
  it('4개 프레임이 정의되어 있다', () => {
    expect(FRAMES.length).toBe(4)
  })

  it('모든 프레임에 screenArea가 정의되어 있다', () => {
    FRAMES.forEach(f => {
      expect(f.screenArea.width).toBeGreaterThan(0)
      expect(f.screenArea.height).toBeGreaterThan(0)
    })
  })

  it('aspectRatio가 screenArea와 일치한다', () => {
    FRAMES.forEach(f => {
      const computed = f.screenArea.width / f.screenArea.height
      expect(f.aspectRatio).toBeCloseTo(computed, 2)
    })
  })

  it('getFrameById가 올바른 프레임을 반환한다', () => {
    const frame = getFrameById('macbook-pro-16')
    expect(frame?.label).toBe('MacBook Pro 16')
  })

  it('getFrameById가 없는 id에 undefined를 반환한다', () => {
    expect(getFrameById('nonexistent')).toBeUndefined()
  })
})
