import type { Frame } from '../types/frame'

export const FRAMES: Frame[] = [
  {
    id: 'macbook-pro-16',
    label: 'MacBook Pro 16',
    category: 'device',
    assetPath: '/frames/macbook-pro-16.png',
    screenArea: { x: 442, y: 377, width: 3456, height: 2170, radius: 0 },
    aspectRatio: 3456 / 2170,
  },
  {
    id: 'iphone-15',
    label: 'iPhone 15',
    category: 'device',
    assetPath: '/frames/iphone-15.png',
    screenArea: { x: 120, y: 120, width: 1179, height: 2556, radius: 170 },
    aspectRatio: 1179 / 2556,
  },
  {
    id: 'chrome-mac',
    label: 'Chrome (Mac)',
    category: 'browser',
    assetPath: '/frames/chrome-mac.png',
    screenArea: { x: 0, y: 88, width: 1440, height: 832, radius: 0 },
    aspectRatio: 1440 / 832,
  },
  {
    id: 'safari-mac',
    label: 'Safari (Mac)',
    category: 'browser',
    assetPath: '/frames/safari-mac.png',
    screenArea: { x: 0, y: 88, width: 1440, height: 832, radius: 0 },
    aspectRatio: 1440 / 832,
  },
]

export function getFrameById(id: string): Frame | undefined {
  return FRAMES.find(f => f.id === id)
}
