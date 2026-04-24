import type { Frame, ShadowConfig, ImageTransform, ExportScale, BrowserState, ScreenArea } from '../types/frame'

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

// fitMode: 'cover' = device frames (fill area, crop if needed)
//          'width' = browser frames (scale to content width, preserve height)
function drawScreenshot(
  ctx: CanvasRenderingContext2D,
  screenshot: HTMLImageElement,
  screenArea: ScreenArea,
  transform: ImageTransform,
  fitMode: 'cover' | 'width' = 'cover'
): void {
  const { x, y, width: sw, height: sh, radius = 0 } = screenArea
  const { scale, offsetX, offsetY } = transform

  const imgW = screenshot.naturalWidth
  const imgH = screenshot.naturalHeight

  const baseScale = fitMode === 'cover'
    ? Math.max(sw / imgW, sh / imgH)
    : sw / imgW

  const drawW = imgW * baseScale * scale
  const drawH = imgH * baseScale * scale
  const drawX = x + (sw - drawW) / 2 + offsetX
  const drawY = y + (sh - drawH) / 2 + offsetY

  ctx.save()
  ctx.beginPath()
  if (radius > 0 && ctx.roundRect) {
    // browser frames: top corners stay square, only bottom corners are rounded
    const radii = fitMode === 'width' ? [0, 0, radius, radius] : radius
    ctx.roundRect(x, y, sw, sh, radii)
  } else {
    ctx.rect(x, y, sw, sh)
  }
  ctx.clip()
  ctx.drawImage(screenshot, drawX, drawY, drawW, drawH)
  ctx.restore()
}

function applyToMainCanvas(
  canvas: HTMLCanvasElement,
  offscreen: HTMLCanvasElement,
  shadow: ShadowConfig,
  scale: ExportScale
): void {
  const ctx = canvas.getContext('2d')!
  const { shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } = buildShadow(shadow)
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur * scale
  ctx.shadowOffsetX = shadowOffsetX * scale
  ctx.shadowOffsetY = shadowOffsetY * scale
  ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

function drawDeviceComposite(params: DrawCompositeParams): void {
  const { canvas, screenshot, frameImg, frame, transform, shadow, scale } = params
  const assetW = frameImg.naturalWidth
  const assetH = frameImg.naturalHeight
  const { width, height } = calculateCanvasSize(assetW, assetH, scale)

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  const offscreen = document.createElement('canvas')
  offscreen.width = assetW
  offscreen.height = assetH
  const offCtx = offscreen.getContext('2d')!

  drawScreenshot(offCtx, screenshot, frame.screenArea, transform, 'cover')
  offCtx.drawImage(frameImg, 0, 0, assetW, assetH)

  applyToMainCanvas(canvas, offscreen, shadow, scale)
}

function drawBrowserComposite(params: DrawCompositeParams): void {
  const { canvas, screenshot, frameImg, frame, transform, shadow, scale, browserState } = params
  const { browserMeta } = frame
  if (!browserMeta) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const assetW = frameImg.naturalWidth
  const toolbarH = frameImg.naturalHeight  // toolbar image height = full toolbar
  const contentW = assetW
  // Content height adapts to screenshot's aspect ratio
  const contentH = Math.round(contentW * screenshot.naturalHeight / screenshot.naturalWidth)
  const totalH = toolbarH + contentH

  canvas.width = contentW * scale
  canvas.height = totalH * scale
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const offscreen = document.createElement('canvas')
  offscreen.width = contentW
  offscreen.height = totalH
  const offCtx = offscreen.getContext('2d')!

  // 1. Content background with bottom radius
  const r = browserMeta.contentRadius
  offCtx.fillStyle = browserMeta.contentBg
  offCtx.beginPath()
  if (offCtx.roundRect) {
    offCtx.roundRect(0, toolbarH, contentW, contentH, [0, 0, r, r])
  } else {
    offCtx.rect(0, toolbarH, contentW, contentH)
  }
  offCtx.fill()

  // 2. Screenshot into content area
  const screenAreaForBrowser: ScreenArea = {
    x: 0,
    y: toolbarH,
    width: contentW,
    height: contentH,
    radius: r,
  }
  drawScreenshot(offCtx, screenshot, screenAreaForBrowser, transform, 'width')

  // 3. Toolbar image on top
  offCtx.drawImage(frameImg, 0, 0, contentW, toolbarH)

  // 4. URL bar overlay
  const { urlBar } = browserMeta
  if (urlBar.width > 0 && browserState?.url) {
    offCtx.fillStyle = urlBar.bgColor
    offCtx.beginPath()
    const urlR = urlBar.height / 2
    if (offCtx.roundRect) {
      offCtx.roundRect(urlBar.x, urlBar.y, urlBar.width, urlBar.height, urlR)
    } else {
      offCtx.rect(urlBar.x, urlBar.y, urlBar.width, urlBar.height)
    }
    offCtx.fill()

    offCtx.fillStyle = urlBar.textColor
    offCtx.font = `${urlBar.fontSize}px -apple-system, "Helvetica Neue", sans-serif`
    offCtx.textBaseline = 'middle'
    const midY = urlBar.y + urlBar.height / 2
    if (urlBar.align === 'center') {
      offCtx.textAlign = 'center'
      offCtx.fillText(browserState.url, urlBar.x + urlBar.width / 2, midY, urlBar.width - 24)
    } else {
      offCtx.textAlign = 'left'
      offCtx.fillText(browserState.url, urlBar.x + 16, midY, urlBar.width - 32)
    }
  }

  // 5. Favicon overlay (Chrome only)
  if (browserMeta.faviconArea && browserState?.favicon) {
    const { x, y, size } = browserMeta.faviconArea
    offCtx.drawImage(browserState.favicon, x, y, size, size)
  }

  applyToMainCanvas(canvas, offscreen, shadow, scale)
}

export type DrawCompositeParams = {
  canvas: HTMLCanvasElement
  screenshot: HTMLImageElement
  frameImg: HTMLImageElement
  frame: Frame
  transform: ImageTransform
  shadow: ShadowConfig
  scale: ExportScale
  browserState?: BrowserState
}

export function drawComposite(params: DrawCompositeParams): void {
  if (params.frame.browserMeta) {
    drawBrowserComposite(params)
  } else {
    drawDeviceComposite(params)
  }
}
