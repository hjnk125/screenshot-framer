export type FrameCategory = 'device' | 'browser'

export type ScreenArea = {
  x: number
  y: number
  width: number
  height: number
}

export type Frame = {
  id: string
  label: string
  category: FrameCategory
  assetPath: string
  screenArea: ScreenArea
  aspectRatio: number
}

export type ShadowConfig = {
  enabled: boolean
  color: string
  blur: number
  intensity: number
}

export type ImageTransform = {
  scale: number
  offsetX: number
  offsetY: number
}

export type ExportScale = 1 | 2 | 3
