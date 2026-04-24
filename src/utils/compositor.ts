import type { Frame, ShadowConfig, ImageTransform, ExportScale, BrowserState, ScreenArea } from '../types/frame'

export type CanvasSize = { width: number; height: number }

// Padding added around the frame to make shadows visible
const SHADOW_PADDING = 80

type ShadowLayer = {
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

function buildShadowLayers(config: ShadowConfig): ShadowLayer[] {
  if (!config.enabled) return []
  const t = config.opacity / 100
  return [
    { color: `rgba(0,0,0,${(0.7 * t).toFixed(3)})`, blur: 1,  offsetX: 0, offsetY: 0  },
    { color: `rgba(0,0,0,${(0.3 * t).toFixed(3)})`, blur: 30, offsetX: 0, offsetY: 20 },
    { color: `rgba(0,0,0,${(0.2 * t).toFixed(3)})`, blur: 50, offsetX: 0, offsetY: 10 },
  ]
}

export function calculateCanvasSize(
  assetWidth: number,
  assetHeight: number,
  scale: ExportScale
): CanvasSize {
  return { width: assetWidth * scale, height: assetHeight * scale }
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
  const layers = buildShadowLayers(shadow)
  const pad = SHADOW_PADDING * scale

  canvas.width = offscreen.width * scale + pad * 2
  canvas.height = offscreen.height * scale + pad * 2
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (layers.length > 0) {
    // Draw each shadow layer onto a temp canvas, then composite under the image
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = canvas.width
    shadowCanvas.height = canvas.height
    const sCtx = shadowCanvas.getContext('2d')!

    for (const layer of layers) {
      sCtx.shadowColor = layer.color
      sCtx.shadowBlur = layer.blur * scale
      sCtx.shadowOffsetX = layer.offsetX * scale
      sCtx.shadowOffsetY = layer.offsetY * scale
      sCtx.drawImage(offscreen, pad, pad, offscreen.width * scale, offscreen.height * scale)
    }

    ctx.drawImage(shadowCanvas, 0, 0)
  }

  // Draw the actual image on top (no shadow, covers ghost copies from shadow draws)
  ctx.drawImage(offscreen, pad, pad, offscreen.width * scale, offscreen.height * scale)
}

function drawDeviceComposite(params: DrawCompositeParams): void {
  const { canvas, screenshot, frameImg, frame, transform, shadow, scale } = params
  const assetW = frameImg.naturalWidth
  const assetH = frameImg.naturalHeight

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

  const assetW = frameImg.naturalWidth
  const toolbarH = frameImg.naturalHeight
  const contentW = assetW
  const contentH = Math.round(contentW * screenshot.naturalHeight / screenshot.naturalWidth)
  const totalH = toolbarH + contentH

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

  // 2. Screenshot into content area (bottom radius only)
  const screenAreaForBrowser: ScreenArea = {
    x: 0, y: toolbarH, width: contentW, height: contentH, radius: r,
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
