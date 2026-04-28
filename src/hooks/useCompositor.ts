import { useCallback, useRef, useState } from "react";
import type {
  Frame,
  ShadowConfig,
  ImageTransform,
  BrowserState,
  DeviceBgConfig,
} from "../types/frame";
import {
  drawComposite,
  calculateOutputSize,
  computeEffectiveScale,
} from "../utils/compositor";
import type { CanvasSize } from "../utils/compositor";

export type CompositorParams = {
  screenshot: HTMLImageElement | null;
  frame: Frame | null;
  transform: ImageTransform;
  shadow: ShadowConfig;
  browserState?: BrowserState;
  defaultFavicon?: HTMLImageElement | null;
  deviceBg?: DeviceBgConfig;
};

function resolveFrame(
  frame: Frame | null,
  screenshot: HTMLImageElement | null,
): Frame | null {
  if (!frame) return null;
  if (frame.shortToolbar && screenshot && screenshot.naturalWidth < 800) {
    return {
      ...frame,
      assetPath: frame.shortToolbar.assetPath,
      browserMeta: frame.shortToolbar.browserMeta,
    };
  }
  // Use @2x asset when screenshot is larger than the screen area.
  // screenArea scaling is deferred to renderToCanvas/exportPng after loading
  // the actual image, so we can compute the true ratio regardless of the exact
  // pixel dimensions of the @2x file.
  if (frame.assetPath2x && screenshot && !frame.browserMeta) {
    const naturalScale = screenshot.naturalWidth / frame.screenArea.width;
    if (naturalScale > 1.0) {
      return { ...frame, assetPath: frame.assetPath2x };
    }
  }
  return frame;
}

export function useCompositor({
  screenshot,
  frame,
  transform,
  shadow,
  browserState,
  defaultFavicon,
  deviceBg,
}: CompositorParams) {
  const frameImgCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [, setFrameCacheVersion] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadFrameImage = useCallback(
    (assetPath: string): Promise<HTMLImageElement> => {
      const cached = frameImgCache.current.get(assetPath);
      if (cached) return Promise.resolve(cached);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          frameImgCache.current.set(assetPath, img);
          setFrameCacheVersion((v) => v + 1);
          resolve(img);
        };
        img.onerror = reject;
        img.src = assetPath;
      });
    },
    [],
  );

  // When resolveFrame switches to the @2x asset, screenArea is still in 1x coords.
  // After loading the actual @2x image we know its true width, so we compute the
  // exact ratio (which may differ from exactly ×2) and apply it to screenArea.
  const applyAssetScale = useCallback(
    async (active: Frame, original: Frame): Promise<Frame> => {
      if (!original.assetPath2x || active.assetPath !== original.assetPath2x) {
        return active;
      }
      const [img2x, img1x] = await Promise.all([
        loadFrameImage(original.assetPath2x),
        loadFrameImage(original.assetPath),
      ]);
      const ratio = img2x.naturalWidth / img1x.naturalWidth;
      const sa = original.screenArea;
      return {
        ...active,
        screenArea: {
          ...sa,
          x: Math.round(sa.x * ratio),
          y: Math.round(sa.y * ratio),
          width: Math.round(sa.width * ratio),
          height: Math.round(sa.height * ratio),
          radius: Math.round(sa.radius * ratio),
        },
      };
    },
    [loadFrameImage],
  );

  const renderToCanvas = useCallback(
    async (canvas: HTMLCanvasElement): Promise<void> => {
      if (!screenshot || !frame) return;
      setIsRendering(true);
      try {
        const active = resolveFrame(frame, screenshot);
        if (!active) return;
        const frameImg = await loadFrameImage(active.assetPath);
        const scaledFrame = await applyAssetScale(active, frame);
        drawComposite({
          canvas,
          screenshot,
          frameImg,
          frame: scaledFrame,
          transform,
          shadow,
          scale: 1,
          browserState,
          defaultFavicon,
          deviceBg,
        });
      } finally {
        setIsRendering(false);
      }
    },
    [
      screenshot,
      frame,
      transform,
      shadow,
      browserState,
      defaultFavicon,
      deviceBg,
      loadFrameImage,
      applyAssetScale,
    ],
  );

  const exportPng = useCallback(async (): Promise<void> => {
    if (!screenshot || !frame) return;
    setIsExporting(true);

    const active = resolveFrame(frame, screenshot);
    if (!active) {
      setIsExporting(false);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const frameImg = await loadFrameImage(active.assetPath);
      const scaledFrame = await applyAssetScale(active, frame);
      const scale = computeEffectiveScale(screenshot, scaledFrame, frameImg);
      drawComposite({
        canvas,
        screenshot,
        frameImg,
        frame: scaledFrame,
        transform,
        shadow,
        scale,
        browserState,
        defaultFavicon,
        deviceBg,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `framed-${frame.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  }, [
    screenshot,
    frame,
    transform,
    shadow,
    browserState,
    defaultFavicon,
    deviceBg,
    loadFrameImage,
    applyAssetScale,
  ]);

  const getOutputSize = useCallback((): CanvasSize | null => {
    if (!screenshot || !frame) return null;
    const active = resolveFrame(frame, screenshot);
    if (!active) return null;
    const frameImg = frameImgCache.current.get(active.assetPath);
    if (!frameImg) return null;

    // Compute scaled frame synchronously from cached images
    // to avoid stale data when switching between frames.
    let effectiveFrame = active;
    if (frame.assetPath2x && active.assetPath === frame.assetPath2x) {
      const img1x = frameImgCache.current.get(frame.assetPath);
      if (img1x) {
        const ratio = frameImg.naturalWidth / img1x.naturalWidth;
        const sa = frame.screenArea;
        effectiveFrame = {
          ...active,
          screenArea: {
            ...sa,
            x: Math.round(sa.x * ratio),
            y: Math.round(sa.y * ratio),
            width: Math.round(sa.width * ratio),
            height: Math.round(sa.height * ratio),
            radius: Math.round(sa.radius * ratio),
          },
        };
      }
    }

    return calculateOutputSize(screenshot, effectiveFrame, frameImg, shadow);
  }, [screenshot, frame, shadow]);

  return { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting };
}
