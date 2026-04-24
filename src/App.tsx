import { useState, useCallback, useEffect, useRef } from 'react'
import type { Frame, ShadowConfig, ExportScale } from './types/frame'
import { useImageUpload } from './hooks/useImageUpload'
import { useImageTransform } from './hooks/useImageTransform'
import { useCompositor } from './hooks/useCompositor'
import { useBrowserState } from './hooks/useBrowserState'
import { UploadZone } from './components/UploadZone'
import { FramePicker } from './components/FramePicker'
import { ImageAdjust } from './components/ImageAdjust'
import { ShadowControls } from './components/ShadowControls'
import { ExportControls } from './components/ExportControls'
import { BrowserControls } from './components/BrowserControls'
import { PreviewCanvas } from './components/PreviewCanvas'
import { Toast } from './components/Toast'

const DEFAULT_SHADOW: ShadowConfig = {
  enabled: true,
  opacity: 100,
}

export default function App() {
  const { image, fileInfo, error, handleFile, clearImage } = useImageUpload()
  const { transform, setScale, pan, reset: resetTransform } = useImageTransform()
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [shadow, setShadow] = useState<ShadowConfig>(DEFAULT_SHADOW)
  const browserState = useBrowserState()
  const [defaultFavicon, setDefaultFavicon] = useState<HTMLImageElement | null>(null)
  const asideRef = useRef<HTMLElement>(null)
  const [showFade, setShowFade] = useState(false)

  const isBrowser = !!selectedFrame?.browserMeta

  useEffect(() => {
    const path = selectedFrame?.browserMeta?.defaultFaviconPath
    if (!path) { setDefaultFavicon(null); return }
    const img = new Image()
    img.onload = () => setDefaultFavicon(img)
    img.src = path
  }, [selectedFrame])

  const { renderToCanvas, exportPng } = useCompositor({
    screenshot: image,
    frame: selectedFrame,
    transform,
    shadow,
    browserState: isBrowser ? browserState : undefined,
    defaultFavicon: isBrowser ? defaultFavicon : null,
  })

  // Fade visibility — show when aside has more content below
  const checkFade = useCallback(() => {
    if (!asideRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = asideRef.current
    setShowFade(scrollHeight > clientHeight + 8 && scrollTop + clientHeight < scrollHeight - 8)
  }, [])

  useEffect(() => { checkFade() }, [image, selectedFrame, isBrowser, checkFade])

  const onFile = useCallback((file: File) => { handleFile(file) }, [handleFile])
  const handleExport = useCallback((scale: ExportScale) => { exportPng(scale) }, [exportPng])

  const handleFrameSelect = useCallback((frame: Frame) => {
    setSelectedFrame(frame)
    resetTransform()
  }, [resetTransform])

  return (
    <div className="
      p-[14px] gap-[14px] bg-page text-ink
      flex flex-col h-screen overflow-y-auto
      lg:overflow-hidden lg:grid lg:grid-cols-[360px_1fr] lg:grid-rows-[1fr_auto]
    ">
      {/* Sidebar wrapper — relative for fade overlay */}
      <div className="relative lg:min-h-0 flex flex-col">
        <aside
          ref={asideRef}
          onScroll={checkFade}
          className="hide-scrollbar flex flex-col gap-3 lg:overflow-y-auto lg:flex-1 lg:min-h-0"
        >
          {/* 1. Title card */}
          <div className="bg-ink rounded-card-dense px-3 py-[10px] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-[9px]">
              <div className="w-[22px] h-[22px] rounded-[6px] bg-accent flex items-center justify-center select-none">
                <img src="/logo.svg" alt="" className="w-[14px] h-[14px]" />
              </div>
              <span className="text-[12px] font-semibold text-white">Screenshot Framer</span>
            </div>
            <span className="text-[10px] text-white/50 font-mono">v0.3</span>
          </div>

          {/* 2. File card */}
          <div className="bg-card-dense rounded-card-dense border border-black/[0.07] p-4 shrink-0">
            {image && fileInfo ? (
              <>
                <div className="flex justify-between items-baseline mb-[6px]">
                  <span className="text-[9.5px] font-bold text-soft uppercase tracking-[0.06em]">File</span>
                  <span className="text-[10px] text-muted font-mono">
                    {fileInfo.size >= 1024 * 1024
                      ? `${(fileInfo.size / 1024 / 1024).toFixed(1)} MB`
                      : `${(fileInfo.size / 1024).toFixed(0)} KB`}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-[8px] shrink-0 border border-black/[0.07] overflow-hidden bg-[#f0f0ef]">
                    <img src={image.src} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-ink truncate">{fileInfo.name}</p>
                    <p className="text-[10px] text-muted mt-[1px] font-mono">
                      {image.naturalWidth} × {image.naturalHeight}
                    </p>
                  </div>
                  <button
                    onClick={clearImage}
                    className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[14px] leading-none text-soft hover:bg-red-500 hover:text-white transition-colors shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-[6px]">
                  <span className="text-[9.5px] font-bold text-soft uppercase tracking-[0.06em]">File</span>
                </div>
                <UploadZone onFile={onFile} />
              </>
            )}
          </div>

          {/* 3. Frame picker */}
          <FramePicker
            selectedId={selectedFrame?.id ?? null}
            onSelect={handleFrameSelect}
            showHint={!!image && !selectedFrame}
          />

          {/* 4. Browser controls — conditional */}
          {isBrowser && selectedFrame && (
            <div className="bg-card rounded-card border border-black/[0.07] p-4 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-soft uppercase tracking-[0.04em]">Browser</span>
              </div>
              <BrowserControls frame={selectedFrame} state={browserState} />
            </div>
          )}

          {/* Mobile/tablet preview — between Frame and ImageAdjust */}
          <div className="h-[260px] shrink-0 lg:hidden">
            <PreviewCanvas
              screenshot={image}
              frame={selectedFrame}
              onPan={pan}
              renderToCanvas={renderToCanvas}
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
          <div className="pointer-events-none hidden lg:block absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-page to-transparent" />
        )}
      </div>

      {/* Desktop-only preview */}
      <div className="hidden lg:flex lg:row-span-2 lg:min-h-0 lg:overflow-hidden">
        <PreviewCanvas
          screenshot={image}
          frame={selectedFrame}
          onPan={pan}
          renderToCanvas={renderToCanvas}
        />
      </div>

      {/* Export */}
      <ExportControls
        onExport={handleExport}
        disabled={!image || !selectedFrame}
      />

      <Toast message={error} onClose={clearImage} />
    </div>
  )
}
