import type {
  Frame,
  ShadowConfig,
  ImageTransform,
  ExportScale,
  BrowserState,
  ScreenArea,
  DeviceBgConfig,
} from "../types/frame";

// Step-wise downscaling: halve each pass with high-quality interpolation.
// Single-pass bilinear degrades badly at >2:1 ratios — this avoids that.
function stepDown(
  src: HTMLCanvasElement,
  targetW: number,
  targetH: number,
): HTMLCanvasElement {
  let cur = src;
  while (cur.width / targetW > 2 || cur.height / targetH > 2) {
    const nextW = Math.max(Math.round(cur.width / 2), targetW);
    const nextH = Math.max(Math.round(cur.height / 2), targetH);
    const step = document.createElement("canvas");
    step.width = nextW;
    step.height = nextH;
    const sCtx = step.getContext("2d")!;
    sCtx.imageSmoothingEnabled = true;
    sCtx.imageSmoothingQuality = "high";
    sCtx.drawImage(cur, 0, 0, nextW, nextH);
    cur = step;
  }
  return cur;
}

export type CanvasSize = { width: number; height: number };

// naturalScale: match scale so screenshot pixels map 1:1 in the screen area.
// Use screenArea.width (not frameImg.naturalWidth) so device bezels don't shrink content.
// Cap at 1.0: never upscale the frame asset above its native resolution.
// portrait (aspectRatio < 1) → 800px min output width, landscape/browser → 1500px min.
export function computeEffectiveScale(
  screenshot: HTMLImageElement,
  frame: Frame,
  frameImg: HTMLImageElement,
): number {
  const screenW = frame.browserMeta
    ? frameImg.naturalWidth
    : frame.screenArea.width;
  const naturalScale = screenshot.naturalWidth / screenW;
  const minWidth = frame.aspectRatio < 1 ? 800 : 1500;
  const minScale = minWidth / frameImg.naturalWidth;
  return Math.min(Math.max(naturalScale, minScale), 1);
}

export function calculateOutputSize(
  screenshot: HTMLImageElement,
  frame: Frame,
  frameImg: HTMLImageElement,
): CanvasSize {
  const assetW = frameImg.naturalWidth;
  const assetH = frameImg.naturalHeight;
  const s = computeEffectiveScale(screenshot, frame, frameImg);

  if (frame.browserMeta) {
    const toolbarH = frameImg.naturalHeight;
    const contentH = Math.round(
      (assetW * screenshot.naturalHeight) / screenshot.naturalWidth,
    );
    return {
      width: Math.round((assetW + SHADOW_PADDING * 2) * s),
      height: Math.round((toolbarH + contentH + SHADOW_PADDING * 2) * s),
    };
  }

  return {
    width: Math.round((assetW + SHADOW_PADDING * 2) * s),
    height: Math.round((assetH + SHADOW_PADDING * 2) * s),
  };
}

// Padding added around the frame to make shadows visible
const SHADOW_PADDING = 80;

type ShadowLayer = {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
};

function buildShadowLayers(config: ShadowConfig): ShadowLayer[] {
  if (!config.enabled) return [];
  const t = config.opacity / 100;
  return [
    {
      color: `rgba(0,0,0,${(0.7 * t).toFixed(3)})`,
      blur: 1,
      offsetX: 0,
      offsetY: 0,
    },
    {
      color: `rgba(0,0,0,${(0.3 * t).toFixed(3)})`,
      blur: 30,
      offsetX: 0,
      offsetY: 20,
    },
    {
      color: `rgba(0,0,0,${(0.2 * t).toFixed(3)})`,
      blur: 50,
      offsetX: 0,
      offsetY: 10,
    },
  ];
}

export function calculateCanvasSize(
  assetWidth: number,
  assetHeight: number,
  scale: ExportScale,
): CanvasSize {
  return { width: assetWidth * scale, height: assetHeight * scale };
}

// fitMode: 'cover' = device frames (fill area, crop if needed)
//          'width' = browser frames (scale to content width, preserve height)
function drawScreenshot(
  ctx: CanvasRenderingContext2D,
  screenshot: HTMLImageElement,
  screenArea: ScreenArea,
  transform: ImageTransform,
  fitMode: "cover" | "width" = "cover",
): void {
  const { x, y, width: sw, height: sh, radius = 0 } = screenArea;
  const { scale, offsetX, offsetY } = transform;

  const imgW = screenshot.naturalWidth;
  const imgH = screenshot.naturalHeight;

  const baseScale =
    fitMode === "cover" ? Math.max(sw / imgW, sh / imgH) : sw / imgW;

  const drawW = imgW * baseScale * scale;
  const drawH = imgH * baseScale * scale;
  const drawX = x + (sw - drawW) / 2 + offsetX;
  const drawY = y + (sh - drawH) / 2 + offsetY;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.beginPath();
  if (radius > 0 && ctx.roundRect) {
    // browser frames: top corners stay square, only bottom corners are rounded
    const radii = fitMode === "width" ? [0, 0, radius, radius] : radius;
    ctx.roundRect(x, y, sw, sh, radii);
  } else {
    ctx.rect(x, y, sw, sh);
  }
  ctx.clip();
  ctx.drawImage(screenshot, drawX, drawY, drawW, drawH);
  ctx.restore();
}

function applyToMainCanvas(
  canvas: HTMLCanvasElement,
  offscreen: HTMLCanvasElement,
  shadow: ShadowConfig,
  scale: number,
): void {
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const layers = buildShadowLayers(shadow);
  const pad = Math.round(SHADOW_PADDING * scale);
  const drawW = Math.round(offscreen.width * scale);
  const drawH = Math.round(offscreen.height * scale);

  canvas.width = drawW + pad * 2;
  canvas.height = drawH + pad * 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Step-down to target size so bilinear never handles >2:1 in one pass
  const scaled = stepDown(offscreen, drawW, drawH);

  if (layers.length > 0) {
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = canvas.width;
    shadowCanvas.height = canvas.height;
    const sCtx = shadowCanvas.getContext("2d")!;
    sCtx.imageSmoothingEnabled = true;
    sCtx.imageSmoothingQuality = "high";

    for (const layer of layers) {
      sCtx.shadowColor = layer.color;
      sCtx.shadowBlur = layer.blur * scale;
      sCtx.shadowOffsetX = layer.offsetX * scale;
      sCtx.shadowOffsetY = layer.offsetY * scale;
      sCtx.drawImage(scaled, pad, pad, drawW, drawH);
    }

    ctx.drawImage(shadowCanvas, 0, 0);
  }

  // Draw actual image on top (no shadow)
  ctx.drawImage(scaled, pad, pad, drawW, drawH);
}

function drawDeviceBg(
  ctx: CanvasRenderingContext2D,
  bg: DeviceBgConfig,
  screenArea: ScreenArea,
): void {
  if (bg.type === "transparent") return;
  const { x, y, width: w, height: h, radius } = screenArea;

  ctx.save();
  ctx.beginPath();
  if (radius > 0 && ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();

  if (bg.type === "white" || bg.type === "black") {
    ctx.fillStyle = bg.type === "white" ? "#ffffff" : "#000000";
    ctx.fillRect(x, y, w, h);
  } else if (bg.type === "image" && bg.image) {
    const { naturalWidth: iw, naturalHeight: ih } = bg.image;
    const bgScale = Math.max(w / iw, h / ih);
    const dw = iw * bgScale;
    const dh = ih * bgScale;
    ctx.drawImage(bg.image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  ctx.restore();
}

function drawDeviceComposite(params: DrawCompositeParams): void {
  const {
    canvas,
    screenshot,
    frameImg,
    frame,
    transform,
    shadow,
    scale,
    deviceBg,
  } = params;
  const assetW = frameImg.naturalWidth;
  const assetH = frameImg.naturalHeight;

  const offscreen = document.createElement("canvas");
  offscreen.width = assetW;
  offscreen.height = assetH;
  const offCtx = offscreen.getContext("2d")!;

  // 1. Background (below screenshot)
  if (deviceBg) {
    drawDeviceBg(offCtx, deviceBg, frame.screenArea);
  }

  // 2. Screenshot
  drawScreenshot(offCtx, screenshot, frame.screenArea, transform, "cover");
  // 3. Frame overlay
  offCtx.drawImage(frameImg, 0, 0, assetW, assetH);

  applyToMainCanvas(canvas, offscreen, shadow, scale);
}

function drawBrowserComposite(params: DrawCompositeParams): void {
  const {
    canvas,
    screenshot,
    frameImg,
    frame,
    transform,
    shadow,
    scale,
    browserState,
    defaultFavicon,
  } = params;
  const { browserMeta } = frame;
  if (!browserMeta) return;

  const assetW = frameImg.naturalWidth;
  const toolbarH = frameImg.naturalHeight;
  const contentW = assetW;
  const contentH = Math.round(
    (contentW * screenshot.naturalHeight) / screenshot.naturalWidth,
  );
  const totalH = toolbarH + contentH;

  const offscreen = document.createElement("canvas");
  offscreen.width = contentW;
  offscreen.height = totalH;
  const offCtx = offscreen.getContext("2d")!;

  // 1. Content background with bottom radius
  const r = browserMeta.contentRadius;
  offCtx.fillStyle = browserMeta.contentBg;
  offCtx.beginPath();
  if (offCtx.roundRect) {
    offCtx.roundRect(0, toolbarH, contentW, contentH, [0, 0, r, r]);
  } else {
    offCtx.rect(0, toolbarH, contentW, contentH);
  }
  offCtx.fill();

  // 2. Screenshot into content area (bottom radius only)
  const screenAreaForBrowser: ScreenArea = {
    x: 0,
    y: toolbarH,
    width: contentW,
    height: contentH,
    radius: r,
  };
  drawScreenshot(offCtx, screenshot, screenAreaForBrowser, transform, "width");

  // 3. Toolbar image on top
  offCtx.drawImage(frameImg, 0, 0, contentW, toolbarH);

  // 4. URL bar text overlay (no background fill — toolbar image provides background)
  const { urlBar } = browserMeta;
  if (urlBar.width > 0 && browserState?.url) {
    offCtx.fillStyle = urlBar.textColor;
    offCtx.font = `${urlBar.fontSize}px "SF Compact Text", sans-serif`;
    offCtx.textBaseline = "middle";
    const midY = urlBar.y + urlBar.height / 2;
    if (urlBar.align === "center") {
      offCtx.textAlign = "center";
      offCtx.fillText(
        browserState.url,
        urlBar.x + urlBar.width / 2,
        midY,
        urlBar.width - 24,
      );
    } else {
      // left-aligned: place text after lock icon with comfortable padding
      offCtx.textAlign = "left";
      const textStartX = urlBar.x + 90;
      const maxW = urlBar.width - 90 - 16;
      offCtx.fillText(browserState.url, textStartX, midY, maxW);
    }
  }

  // 5. Tab area overlay (Chrome only) — title + favicon (no background fill — toolbar image provides it)
  if (browserMeta.tabArea && browserState?.title) {
    const tab = browserMeta.tabArea;

    const faviconImg = browserState?.favicon ?? defaultFavicon ?? null;
    if (faviconImg) {
      offCtx.drawImage(
        faviconImg,
        tab.x + tab.faviconX,
        tab.y + tab.faviconY,
        tab.faviconSize,
        tab.faviconSize,
      );
    }

    offCtx.fillStyle = tab.textColor;
    offCtx.font = `${tab.fontSize}px "SF Compact Text", sans-serif`;
    offCtx.textBaseline = "middle";
    offCtx.textAlign = "left";
    const titleX = tab.x + tab.textOffsetX;
    const titleMaxW = tab.width - tab.textOffsetX - 52;
    const midY = tab.y + tab.height / 2;

    // Ellipsis truncation
    let text = browserState.title;
    if (offCtx.measureText(text).width > titleMaxW) {
      while (
        text.length > 0 &&
        offCtx.measureText(text + "…").width > titleMaxW
      ) {
        text = text.slice(0, -1);
      }
      text = text + "…";
    }
    offCtx.fillText(text, titleX, midY);
  }

  applyToMainCanvas(canvas, offscreen, shadow, scale);
}

export type DrawCompositeParams = {
  canvas: HTMLCanvasElement;
  screenshot: HTMLImageElement;
  frameImg: HTMLImageElement;
  frame: Frame;
  transform: ImageTransform;
  shadow: ShadowConfig;
  scale: number; // raw multiplier applied to the frame asset size
  browserState?: BrowserState;
  defaultFavicon?: HTMLImageElement | null;
  deviceBg?: DeviceBgConfig;
};

export function drawComposite(params: DrawCompositeParams): void {
  if (params.frame.browserMeta) {
    drawBrowserComposite(params);
  } else {
    drawDeviceComposite(params);
  }
}
