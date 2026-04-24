import { useCallback, useRef, useState } from "react";
import type {
  Frame,
  ShadowConfig,
  ImageTransform,
  ExportScale,
  BrowserState,
  DeviceBgConfig,
} from "../types/frame";
import { drawComposite, calculateOutputSize } from "../utils/compositor";
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

function computeExportScale(
  screenshot: HTMLImageElement,
  frame: Frame,
  frameImg: HTMLImageElement,
  userScale: ExportScale,
): number {
  if (frame.browserMeta) {
    return (screenshot.naturalWidth / frameImg.naturalWidth) * userScale;
  }
  const { width: sw, height: sh } = frame.screenArea;
  const coverBase = Math.max(
    sw / screenshot.naturalWidth,
    sh / screenshot.naturalHeight,
  );
  return (1 / coverBase) * userScale;
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

  // Preview: always renders at full frame asset resolution (scale=1) — CSS scales to container
  const renderToCanvas = useCallback(
    async (canvas: HTMLCanvasElement): Promise<void> => {
      if (!screenshot || !frame) return;
      const frameImg = await loadFrameImage(frame.assetPath);
      drawComposite({
        canvas,
        screenshot,
        frameImg,
        frame,
        transform,
        shadow,
        scale: 1,
        browserState,
        defaultFavicon,
        deviceBg,
      });
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

  // Export: applies naturalScale so 1x = screenshot native pixel dimensions
  const exportPng = useCallback(
    async (userScale: ExportScale): Promise<void> => {
      if (!screenshot || !frame) return;

      const canvas = document.createElement("canvas");
      const frameImg = await loadFrameImage(frame.assetPath);
      const scale = computeExportScale(screenshot, frame, frameImg, userScale);
      drawComposite({
        canvas,
        screenshot,
        frameImg,
        frame,
        transform,
        shadow,
        scale,
        browserState,
        defaultFavicon,
        deviceBg,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `framed-${frame.id}-${userScale}x.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
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

  const getOutputSize = useCallback(
    (scale: ExportScale): CanvasSize | null => {
      if (!screenshot || !frame) return null;
      const frameImg = frameImgCache.current.get(frame.assetPath);
      if (!frameImg) return null;
      return calculateOutputSize(screenshot, frame, frameImg, scale);
    },
    [screenshot, frame],
  );

  return { renderToCanvas, exportPng, getOutputSize };
}
