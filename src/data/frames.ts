import type { Frame } from '../types/frame'

export const FRAMES: Frame[] = [
  {
    id: 'macbook-pro-16',
    label: 'MacBook Pro 16',
    category: 'device',
    assetPath: '/frames/device/macbook-pro-16.png',
    screenArea: { x: 442, y: 377, width: 3456, height: 2170, radius: 0 },
    aspectRatio: 3456 / 2170,
  },
  {
    id: 'iphone-15',
    label: 'iPhone 15',
    category: 'device',
    assetPath: '/frames/device/iphone-15.png',
    screenArea: { x: 120, y: 120, width: 1179, height: 2556, radius: 170 },
    aspectRatio: 1179 / 2556,
  },
  {
    id: 'chrome-light',
    label: 'Chrome',
    category: 'browser',
    assetPath: '/frames/browser/chrome-light-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#ffffff',
      contentRadius: 10,
      urlBar: { x: 328, y: 143, width: 3380, height: 74, bgColor: '#f1f3f4', textColor: '#202124', fontSize: 28, align: 'left' },
      faviconArea: { x: 358, y: 161, size: 36 },
    },
  },
  {
    id: 'chrome-dark',
    label: 'Chrome (다크)',
    category: 'browser',
    assetPath: '/frames/browser/chrome-dark-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#2a2a2a',
      contentRadius: 10,
      urlBar: { x: 328, y: 143, width: 3380, height: 74, bgColor: '#292a2d', textColor: '#e8eaed', fontSize: 28, align: 'left' },
      faviconArea: { x: 358, y: 161, size: 36 },
    },
  },
  {
    id: 'safari-bigSur-light',
    label: 'Safari (Big Sur)',
    category: 'browser',
    assetPath: '/frames/browser/safari-bigSur-light-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#ffffff',
      contentRadius: 10,
      urlBar: { x: 1146, y: 39, width: 1548, height: 79, bgColor: '#e9e9e9', textColor: '#222222', fontSize: 28, align: 'center' },
    },
  },
  {
    id: 'safari-bigSur-dark',
    label: 'Safari Big Sur (다크)',
    category: 'browser',
    assetPath: '/frames/browser/safari-bigSur-dark-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#1c1c1e',
      contentRadius: 10,
      urlBar: { x: 1146, y: 37, width: 1548, height: 79, bgColor: '#3a3a3c', textColor: '#e0e0e0', fontSize: 28, align: 'center' },
    },
  },
  {
    id: 'safari-catalina-light',
    label: 'Safari (Catalina)',
    category: 'browser',
    assetPath: '/frames/browser/safari-catalina-light-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#ffffff',
      contentRadius: 10,
      urlBar: { x: 1140, y: 23, width: 1560, height: 69, bgColor: '#f5f5f5', textColor: '#222222', fontSize: 28, align: 'center' },
    },
  },
  {
    id: 'safari-catalina-dark',
    label: 'Safari Catalina (다크)',
    category: 'browser',
    assetPath: '/frames/browser/safari-catalina-dark-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#1c1c1e',
      contentRadius: 10,
      urlBar: { x: 1140, y: 25, width: 1560, height: 65, bgColor: '#6d6d6d', textColor: '#ffffff', fontSize: 28, align: 'center' },
    },
  },
]

export function getFrameById(id: string): Frame | undefined {
  return FRAMES.find(f => f.id === id)
}
