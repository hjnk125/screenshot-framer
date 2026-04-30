import { useCallback, useEffect, useRef, useState } from "react";
import BackgroundCard from "./components/BackgroundCard/BackgroundCard";
import BrowserCard from "./components/BrowserCard/BrowserCard";
import ExportCard from "./components/ExportCard/ExportCard";
import FileCard from "./components/FileCard/FileCard";
import FramePickerCard from "./components/FramePickerCard/FramePickerCard";
import HelpButton from "./components/HelpButton/HelpButton";
import ImageScaleCard from "./components/ImageScaleCard/ImageScaleCard";
import { PreviewCanvas } from "./components/PreviewCanvas";
import ShadowCard from "./components/ShadowCard/ShadowCard";
import TitleCard from "./components/TitleCard/TitleCard";
import { Toast } from "./components/Toast";
import { useBrowserState } from "./hooks/useBrowserState";
import { useCompositor } from "./hooks/useCompositor";
import { useBackground } from "./hooks/useBackground";
import { useImageTransform } from "./hooks/useImageTransform";
import { useImageUpload } from "./hooks/useImageUpload";
import type { Frame, ShadowConfig } from "./types/frame";

const DEFAULT_SHADOW: ShadowConfig = {
  enabled: true,
  opacity: 100,
};

export default function App() {
  const { image, previewUrl, fileInfo, error, handleFile, clearImage } =
    useImageUpload();
  const {
    transform,
    setScale,
    pan,
    reset: resetTransform,
  } = useImageTransform();
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [shadow, setShadow] = useState<ShadowConfig>(DEFAULT_SHADOW);
  const browserState = useBrowserState();
  const background = useBackground();
  const [defaultFavicon, setDefaultFavicon] = useState<HTMLImageElement | null>(
    null,
  );
  const asideRef = useRef<HTMLElement>(null);
  const [showFade, setShowFade] = useState(false);
  const isBrowser = !!selectedFrame?.browserMeta;

  useEffect(() => {
    const path = selectedFrame?.browserMeta?.defaultFaviconPath;
    if (!path) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setDefaultFavicon(img);
    };
    img.src = path;
    return () => {
      cancelled = true;
      setDefaultFavicon(null);
    };
  }, [selectedFrame]);

  const { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting } =
    useCompositor({
      screenshot: image,
      frame: selectedFrame,
      transform,
      shadow,
      browserState: isBrowser ? browserState : undefined,
      defaultFavicon: isBrowser ? defaultFavicon : null,
      background: !isBrowser ? background.background : undefined,
    });

  // Fade visibility — show when aside has more content below
  const checkFade = useCallback(() => {
    if (!asideRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = asideRef.current;
    setShowFade(
      scrollHeight > clientHeight + 8 &&
        scrollTop + clientHeight < scrollHeight - 8,
    );
  }, []);

  useEffect(() => {
    checkFade();
  }, [image, selectedFrame, isBrowser, checkFade]);

  const handleFrameSelect = useCallback(
    (frame: Frame) => {
      setSelectedFrame(frame);
      resetTransform();
      // appstore 프레임은 투명 배경을 허용하지 않으므로 transparent → white로 전환
      if (
        frame.category === "appstore" &&
        background.background.type === "transparent"
      ) {
        background.setType("white");
      }
    },
    [resetTransform, background],
  );

  return (
    <div className="h-[100dvh] bg-page">
      <div className="mx-auto flex h-full max-w-[1440px] flex-col gap-[14px] overflow-y-auto p-[14px] pb-[max(14px,_calc(14px_+_env(safe-area-inset-bottom)))] text-ink lg:grid lg:grid-cols-[360px_1fr] lg:grid-rows-[1fr_auto] lg:overflow-hidden lg:pb-[14px]">
        {/* Sidebar wrapper — relative for fade overlay */}
        <div className="relative flex flex-col lg:min-h-0">
          <aside
            ref={asideRef}
            onScroll={checkFade}
            className="hide-scrollbar flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
          >
            {/* 1. Title card */}
            <TitleCard />

            {/* 2. File card */}
            <FileCard
              image={image}
              previewUrl={previewUrl}
              fileInfo={fileInfo}
              onFile={handleFile}
              onClear={clearImage}
            />

            {/* 3. Frame picker */}
            <FramePickerCard
              selectedId={selectedFrame?.id ?? null}
              onSelect={handleFrameSelect}
              showHint={!!image && !selectedFrame}
            />

            {/* 4a. Browser controls — conditional */}
            {isBrowser && selectedFrame && (
              <BrowserCard frame={selectedFrame} state={browserState} />
            )}

            {/* 4b. Device controls — conditional */}
            {!isBrowser && selectedFrame && (
              <BackgroundCard frame={selectedFrame} state={background} />
            )}

            {/* Mobile/tablet preview — between Frame and ImageAdjust */}
            <div className="h-[480px] shrink-0 lg:hidden">
              <PreviewCanvas
                screenshot={image}
                frame={selectedFrame}
                onPan={pan}
                renderToCanvas={renderToCanvas}
                isRendering={isRendering}
              />
            </div>

            {/* 5. Image adjust — conditional */}
            {image && selectedFrame && (
              <ImageScaleCard
                scale={transform.scale}
                onScaleChange={setScale}
                onReset={resetTransform}
              />
            )}

            {/* 6. Shadow */}
            <ShadowCard value={shadow} onChange={setShadow} />
          </aside>

          {/* Bottom fade — desktop only, fades when scrollable content remains */}
          {showFade && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 hidden h-14 bg-gradient-to-t from-page to-transparent lg:block" />
          )}
        </div>

        {/* Desktop-only preview */}
        <div className="hidden lg:row-span-2 lg:block lg:min-h-0 lg:overflow-hidden">
          <PreviewCanvas
            screenshot={image}
            frame={selectedFrame}
            onPan={pan}
            renderToCanvas={renderToCanvas}
            isRendering={isRendering}
          />
        </div>

        {/* Export */}
        <ExportCard
          onExport={exportPng}
          disabled={!image || !selectedFrame}
          isExporting={isExporting}
          getOutputSize={getOutputSize}
          uploadSize={
            image
              ? { width: image.naturalWidth, height: image.naturalHeight }
              : null
          }
        />

        <Toast message={error} onClose={clearImage} />
      </div>

      {/* Floating help button */}
      <HelpButton />
    </div>
  );
}
