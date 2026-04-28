import { useState, useCallback, useEffect, useRef } from "react";
import type { Frame, ShadowConfig } from "./types/frame";
import { useImageUpload } from "./hooks/useImageUpload";
import { useImageTransform } from "./hooks/useImageTransform";
import { useCompositor } from "./hooks/useCompositor";
import { useBrowserState } from "./hooks/useBrowserState";
import { useDeviceBg } from "./hooks/useDeviceBg";
import { UploadZone } from "./components/UploadZone";
import { FramePicker } from "./components/FramePicker";
import { ImageAdjust } from "./components/ImageAdjust";
import { ShadowControls } from "./components/ShadowControls";
import { ExportControls } from "./components/ExportControls";
import { BrowserControls } from "./components/BrowserControls";
import { DeviceControls } from "./components/DeviceControls";
import { PreviewCanvas } from "./components/PreviewCanvas";
import { Toast } from "./components/Toast";
import { HelpModal } from "./components/HelpModal";

const DEFAULT_SHADOW: ShadowConfig = {
  enabled: true,
  opacity: 100,
};

export default function App() {
  const { image, fileInfo, error, handleFile, clearImage } = useImageUpload();
  const {
    transform,
    setScale,
    pan,
    reset: resetTransform,
  } = useImageTransform();
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [shadow, setShadow] = useState<ShadowConfig>(DEFAULT_SHADOW);
  const browserState = useBrowserState();
  const deviceBgState = useDeviceBg();
  const [defaultFavicon, setDefaultFavicon] = useState<HTMLImageElement | null>(
    null,
  );
  const asideRef = useRef<HTMLElement>(null);
  const [showFade, setShowFade] = useState(false);
  const [showHelp, setShowHelp] = useState(
    () => !localStorage.getItem("help-seen"),
  );

  const closeHelp = () => {
    localStorage.setItem("help-seen", "1");
    setShowHelp(false);
  };

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

  const { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting } = useCompositor({
    screenshot: image,
    frame: selectedFrame,
    transform,
    shadow,
    browserState: isBrowser ? browserState : undefined,
    defaultFavicon: isBrowser ? defaultFavicon : null,
    deviceBg: !isBrowser ? deviceBgState.deviceBg : undefined,
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
    },
    [resetTransform],
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
            <div className="flex shrink-0 items-center justify-between gap-2 rounded-card-dense bg-ink px-3 py-[10px]">
              <div className="flex items-center gap-[9px]">
                <div className="flex h-[22px] w-[22px] select-none items-center justify-center rounded-[6px] bg-accent">
                  <img src="/logo.svg" alt="" className="h-[14px] w-[14px]" />
                </div>
                <h1 className="text-[12px] font-semibold text-white" aria-hidden="true">
                  Screenshot Framer
                </h1>
              </div>
              <span className="font-mono text-[10px] text-white/50">v0.1</span>
            </div>

            {/* 2. File card */}
            <div className="shrink-0 rounded-card-dense border border-black/[0.07] bg-card-dense p-4">
              {image && fileInfo ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
                      File
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {fileInfo.size >= 1024 * 1024
                        ? `${(fileInfo.size / 1024 / 1024).toFixed(1)} MB`
                        : `${(fileInfo.size / 1024).toFixed(0)} KB`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[8px] border border-black/[0.07] bg-[#f0f0ef]">
                      <img
                        src={image.src}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-ink">
                        {fileInfo.name}
                      </p>
                      <p className="mt-[1px] font-mono text-[10px] text-muted">
                        {image.naturalWidth} × {image.naturalHeight}
                      </p>
                    </div>
                    <button
                      onClick={clearImage}
                      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] text-[14px] leading-none text-soft transition-colors hover:bg-red-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
                      File
                    </span>
                  </div>
                  <UploadZone onFile={handleFile} />
                </>
              )}
            </div>

            {/* 3. Frame picker */}
            <FramePicker
              selectedId={selectedFrame?.id ?? null}
              onSelect={handleFrameSelect}
              showHint={!!image && !selectedFrame}
            />

            {/* 4a. Browser controls — conditional */}
            {isBrowser && selectedFrame && (
              <div className="shrink-0 rounded-card-dense border border-black/[0.07] bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
                    Browser
                  </span>
                </div>
                <BrowserControls frame={selectedFrame} state={browserState} />
              </div>
            )}

            {/* 4b. Device controls — conditional */}
            {!isBrowser && selectedFrame && (
              <div className="shrink-0 rounded-card-dense border border-black/[0.07] bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
                    Device
                  </span>
                </div>
                <DeviceControls state={deviceBgState} />
              </div>
            )}

            {/* Mobile/tablet preview — between Frame and ImageAdjust */}
            <div className="h-[260px] shrink-0 lg:hidden">
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
              <ImageAdjust
                scale={transform.scale}
                onScaleChange={setScale}
                onReset={resetTransform}
              />
            )}

            {/* 6. Shadow */}
            <ShadowControls value={shadow} onChange={setShadow} />
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
        <ExportControls
          onExport={exportPng}
          disabled={!image || !selectedFrame}
          isExporting={isExporting}
          getOutputSize={getOutputSize}
          uploadSize={image ? { width: image.naturalWidth, height: image.naturalHeight } : null}
        />

        <Toast message={error} onClose={clearImage} />
      </div>

      {/* Floating help button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed right-5 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[16px] font-extrabold text-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-colors hover:text-white" style={{ bottom: 'max(20px, calc(20px + env(safe-area-inset-bottom)))' }}
        aria-label="Help"
      >
        ?
      </button>

      {showHelp && <HelpModal onClose={closeHelp} />}
    </div>
  );
}
