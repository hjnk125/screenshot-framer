import type { Frame } from '../types/frame'

export const FRAMES: Frame[] = [
  {
    id: 'macbook-pro-16',
    label: 'MacBook Pro 16',
    category: 'device',
    assetPath: '/frames/macbook-pro-16.png',
    screenArea: { x: 140, y: 90, width: 1728, height: 1117 },
    aspectRatio: 1728 / 1117,
  },
  {
    id: 'iphone-15',
    label: 'iPhone 15',
    category: 'device',
    assetPath: '/frames/iphone-15.png',
    screenArea: { x: 30, y: 60, width: 390, height: 844 },
    aspectRatio: 390 / 844,
  },
  {
    id: 'chrome-mac',
    label: 'Chrome (Mac)',
    category: 'browser',
    assetPath: '/frames/chrome-mac.png',
    screenArea: { x: 0, y: 88, width: 1440, height: 832 },
    aspectRatio: 1440 / 832,
  },
  {
    id: 'safari-mac',
    label: 'Safari (Mac)',
    category: 'browser',
    assetPath: '/frames/safari-mac.png',
    screenArea: { x: 0, y: 88, width: 1440, height: 832 },
    aspectRatio: 1440 / 832,
  },
]

export function getFrameById(id: string): Frame | undefined {
  return FRAMES.find(f => f.id === id)
}
