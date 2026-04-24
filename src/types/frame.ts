export type FrameCategory = 'device' | 'browser'

export type BrowserFrameMeta = {
  contentBg: string
  contentRadius: number
  urlBar: {
    x: number
    y: number
    width: number
    height: number
    bgColor: string
    textColor: string
    fontSize: number
    align: 'left' | 'center'
  }
  faviconArea?: { x: number; y: number; size: number }
}

export type BrowserState = {
  url: string
  favicon: HTMLImageElement | null
}

export type ScreenArea = {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

export type Frame = {
  id: string
  label: string
  category: FrameCategory
  assetPath: string
  screenArea: ScreenArea  // browser frames: height=0 (dynamic), y=toolbarHeight
  aspectRatio: number
  browserMeta?: BrowserFrameMeta
}

export type ShadowConfig = {
  enabled: boolean
  opacity: number  // 0-100
}

export type ImageTransform = {
  scale: number
  offsetX: number
  offsetY: number
}

export type ExportScale = 1 | 2 | 3
