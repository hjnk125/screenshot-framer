import { useCallback, useRef } from "react";
import type {
  Frame,
  ShadowConfig,
  ImageTransform,
  ExportScale,
  BrowserState,
} from "../types/frame";
import { drawComposite } from "../utils/compositor";

export type CompositorParams = {
  screenshot: HTMLImageElement | null;
  frame: Frame | null;
  transform: ImageTransform;
  shadow: ShadowConfig;
  browserState?: BrowserState;
  defaultFavicon?: HTMLImageElement | null;
};

export function useCompositor({
  screenshot,
  frame,
  transform,
  shadow,
  browserState,
  defaultFavicon,
}: CompositorParams) {
  const frameImgCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const loadFrameImage = useCallback(
    (assetPath: string): Promise<HTMLImageElement> => {
      const cached = frameImgCache.current.get(assetPath);
      if (cached) return Promise.resolve(cached);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          frameImgCache.current.set(assetPath, img);
          resolve(img);
        };
        img.onerror = reject;
        img.src = assetPath;
      });
    },
    [],
  );

  const renderToCanvas = useCallback(
    async (
      canvas: HTMLCanvasElement,
      scale: ExportScale = 1,
    ): Promise<void> => {
      if (!screenshot || !frame) return;
      const frameImg = await loadFrameImage(frame.assetPath);
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
      });
    },
    [
      screenshot,
      frame,
      transform,
      shadow,
      browserState,
      defaultFavicon,
      loadFrameImage,
    ],
  );

  const exportPng = useCallback(
    async (scale: ExportScale): Promise<void> => {
      if (!screenshot || !frame) return;

      const canvas = document.createElement("canvas");
      const frameImg = await loadFrameImage(frame.assetPath);
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
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `framed-${frame.id}-${scale}x.png`;
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
      loadFrameImage,
    ],
  );

  return { renderToCanvas, exportPng };
}
