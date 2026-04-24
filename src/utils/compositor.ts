import type {
  Frame,
  ShadowConfig,
  ImageTransform,
  ExportScale,
  BrowserState,
  ScreenArea,
  DeviceBgConfig,
} from "../types/frame";

export type CanvasSize = { width: number; height: number };

export function calculateOutputSize(
  screenshot: HTMLImageElement,
  frame: Frame,
  frameImg: HTMLImageElement,
  scale: ExportScale,
): CanvasSize {
  const assetW = frameImg.naturalWidth;
  const pad = SHADOW_PADDING * 2;

  if (frame.browserMeta) {
    const toolbarH = frameImg.naturalHeight;
    const contentH = Math.round(
      (assetW * screenshot.naturalHeight) / screenshot.naturalWidth,
    );
    const naturalScale = screenshot.naturalWidth / assetW;
    const effectiveScale = naturalScale * scale;
    return {
      width: Math.round((assetW + pad) * effectiveScale),
      height: Math.round((toolbarH + contentH + pad) * effectiveScale),
    };
  }

  const assetH = frameImg.naturalHeight;
  const { width: sw, height: sh } = frame.screenArea;
  const coverBase = Math.max(
    sw / screenshot.naturalWidth,
    sh / screenshot.naturalHeight,
  );
  const effectiveScale = (1 / coverBase) * scale;
  return {
    width: Math.round((assetW + pad) * effectiveScale),
    height: Math.round((assetH + pad) * effectiveScale),
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
  scale: ExportScale,
): void {
  const ctx = canvas.getContext("2d")!;
  const layers = buildShadowLayers(shadow);
  const pad = SHADOW_PADDING * scale;

  canvas.width = offscreen.width * scale + pad * 2;
  canvas.height = offscreen.height * scale + pad * 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (layers.length > 0) {
    // Draw each shadow layer onto a temp canvas, then composite under the image
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = canvas.width;
    shadowCanvas.height = canvas.height;
    const sCtx = shadowCanvas.getContext("2d")!;

    for (const layer of layers) {
      sCtx.shadowColor = layer.color;
      sCtx.shadowBlur = layer.blur * scale;
      sCtx.shadowOffsetX = layer.offsetX * scale;
      sCtx.shadowOffsetY = layer.offsetY * scale;
      sCtx.drawImage(
        offscreen,
        pad,
        pad,
        offscreen.width * scale,
        offscreen.height * scale,
      );
    }

    ctx.drawImage(shadowCanvas, 0, 0);
  }

  // Draw the actual image on top (no shadow, covers ghost copies from shadow draws)
  ctx.drawImage(
    offscreen,
    pad,
    pad,
    offscreen.width * scale,
    offscreen.height * scale,
  );
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
