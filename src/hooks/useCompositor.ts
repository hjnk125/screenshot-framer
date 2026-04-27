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

  const renderToCanvas = useCallback(
    async (canvas: HTMLCanvasElement): Promise<void> => {
      if (!screenshot || !frame) return;
      setIsRendering(true);
      try {
        const active = resolveFrame(frame, screenshot);
        if (!active) return;
        const frameImg = await loadFrameImage(active.assetPath);
        drawComposite({
          canvas,
          screenshot,
          frameImg,
          frame: active,
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

    const canvas = document.createElement("canvas");
    const frameImg = await loadFrameImage(active.assetPath);
    const scale = computeEffectiveScale(screenshot, active, frameImg);
    drawComposite({
      canvas,
      screenshot,
      frameImg,
      frame: active,
      transform,
      shadow,
      scale,
      browserState,
      defaultFavicon,
      deviceBg,
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        setIsExporting(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `framed-${frame.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, "image/png");
  }, [
    screenshot,
    frame,
    transform,
    shadow,
    browserState,
    defaultFavicon,
    deviceBg,
    loadFrameImage,
  ]);

  const getOutputSize = useCallback((): CanvasSize | null => {
    if (!screenshot || !frame) return null;
    const active = resolveFrame(frame, screenshot);
    if (!active) return null;
    const frameImg = frameImgCache.current.get(active.assetPath);
    if (!frameImg) return null;
    return calculateOutputSize(screenshot, active, frameImg, shadow);
  }, [screenshot, frame, shadow]);

  return { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting };
}
