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
    id: 'chrome-light',
    label: 'Chrome',
    category: 'browser',
    assetPath: '/frames/chrome-light-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#ffffff',
      contentRadius: 10,
      urlBar: { x: 336, y: 130, width: 3360, height: 74, bgColor: '#f1f3f4', textColor: '#202124', fontSize: 28, align: 'left' },
      faviconArea: { x: 364, y: 149, size: 36 },
    },
  },
  {
    id: 'chrome-dark',
    label: 'Chrome (다크)',
    category: 'browser',
    assetPath: '/frames/chrome-dark-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#2a2a2a',
      contentRadius: 10,
      urlBar: { x: 336, y: 130, width: 3360, height: 74, bgColor: '#292a2d', textColor: '#e8eaed', fontSize: 28, align: 'left' },
      faviconArea: { x: 364, y: 149, size: 36 },
    },
  },
  {
    id: 'safari-bigSur-light',
    label: 'Safari (Big Sur)',
    category: 'browser',
    assetPath: '/frames/safari-bigSur-light-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#ffffff',
      contentRadius: 10,
      urlBar: { x: 1148, y: 36, width: 1540, height: 90, bgColor: '#e9e9e9', textColor: '#222222', fontSize: 28, align: 'center' },
    },
  },
  {
    id: 'safari-bigSur-dark',
    label: 'Safari Big Sur (다크)',
    category: 'browser',
    assetPath: '/frames/safari-bigSur-dark-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#1c1c1e',
      contentRadius: 10,
      urlBar: { x: 1148, y: 34, width: 1540, height: 90, bgColor: '#3a3a3c', textColor: '#e0e0e0', fontSize: 28, align: 'center' },
    },
  },
  {
    id: 'safari-catalina-light',
    label: 'Safari (Catalina)',
    category: 'browser',
    assetPath: '/frames/safari-catalina-light-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#ffffff',
      contentRadius: 10,
      urlBar: { x: 1140, y: 24, width: 1560, height: 66, bgColor: '#e9e9e9', textColor: '#222222', fontSize: 28, align: 'center' },
    },
  },
  {
    id: 'safari-catalina-dark',
    label: 'Safari Catalina (다크)',
    category: 'browser',
    assetPath: '/frames/safari-catalina-dark-toolbar.png',
    screenArea: { x: 0, y: 0, width: 3840, height: 0, radius: 10 },
    aspectRatio: 16 / 9,
    browserMeta: {
      contentBg: '#1c1c1e',
      contentRadius: 10,
      urlBar: { x: 1140, y: 24, width: 1560, height: 66, bgColor: '#3a3a3c', textColor: '#e0e0e0', fontSize: 28, align: 'center' },
    },
  },
]

export function getFrameById(id: string): Frame | undefined {
  return FRAMES.find(f => f.id === id)
}
