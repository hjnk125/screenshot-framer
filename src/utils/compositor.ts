import type { Frame, ShadowConfig, ImageTransform, ExportScale } from '../types/frame'

export type CanvasSize = { width: number; height: number }

export type ShadowSettings = {
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
}

export function calculateCanvasSize(
  assetWidth: number,
  assetHeight: number,
  scale: ExportScale
): CanvasSize {
  return { width: assetWidth * scale, height: assetHeight * scale }
}

export function buildShadow(config: ShadowConfig): ShadowSettings {
  if (!config.enabled) {
    return { shadowColor: 'transparent', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0 }
  }
  const offset = (config.intensity / 100) * 30
  return {
    shadowColor: config.color,
    shadowBlur: config.blur,
    shadowOffsetX: 0,
    shadowOffsetY: offset,
  }
}

function drawScreenshot(
  ctx: CanvasRenderingContext2D,
  screenshot: HTMLImageElement,
  screenArea: Frame['screenArea'],
  transform: ImageTransform
): void {
  const { x, y, width: sw, height: sh } = screenArea
  const { scale, offsetX, offsetY } = transform

  const drawW = sw * scale
  const drawH = sh * scale
  const drawX = x + (sw - drawW) / 2 + offsetX
  const drawY = y + (sh - drawH) / 2 + offsetY

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, sw, sh)
  ctx.clip()
  ctx.drawImage(screenshot, drawX, drawY, drawW, drawH)
  ctx.restore()
}

export function drawComposite(params: {
  canvas: HTMLCanvasElement
  screenshot: HTMLImageElement
  frameImg: HTMLImageElement
  frame: Frame
  transform: ImageTransform
  shadow: ShadowConfig
  scale: ExportScale
}): void {
  const { canvas, screenshot, frameImg, frame, transform, shadow, scale } = params
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const assetW = frameImg.naturalWidth
  const assetH = frameImg.naturalHeight
  const { width, height } = calculateCanvasSize(assetW, assetH, scale)

  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)

  // 오프스크린 캔버스에 스크린샷 + 프레임 합성
  const offscreen = document.createElement('canvas')
  offscreen.width = assetW
  offscreen.height = assetH
  const offCtx = offscreen.getContext('2d')!

  drawScreenshot(offCtx, screenshot, frame.screenArea, transform)
  offCtx.drawImage(frameImg, 0, 0, assetW, assetH)

  // 메인 캔버스에 그림자 적용 후 오프스크린 전사
  const shadowSettings = buildShadow(shadow)
  ctx.shadowColor = shadowSettings.shadowColor
  ctx.shadowBlur = shadowSettings.shadowBlur * scale
  ctx.shadowOffsetX = shadowSettings.shadowOffsetX * scale
  ctx.shadowOffsetY = shadowSettings.shadowOffsetY * scale

  ctx.drawImage(offscreen, 0, 0, width, height)

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}
