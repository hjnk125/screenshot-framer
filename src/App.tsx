import { useState, useCallback } from 'react'
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

  const isBrowser = !!selectedFrame?.browserMeta

  const { exportPng } = useCompositor({
    screenshot: image,
    frame: selectedFrame,
    transform,
    shadow,
    browserState: isBrowser ? browserState : undefined,
  })

  const onFile = useCallback((file: File) => { handleFile(file) }, [handleFile])
  const handleExport = useCallback((scale: ExportScale) => { exportPng(scale) }, [exportPng])

  const handleFrameSelect = useCallback((frame: Frame) => {
    setSelectedFrame(frame)
    resetTransform()
  }, [resetTransform])

  return (
    <div className="min-h-screen bg-white text-[#222]">
      <header className="border-b border-[#222] px-6 py-4">
        <h1 className="text-lg font-bold tracking-tight">Screenshot Framer</h1>
      </header>

      <main className="mx-auto max-w-7xl p-6 grid grid-cols-[320px_1fr] gap-6 h-[calc(100vh-65px)]">
        <aside className="flex flex-col overflow-y-auto border-r border-[#222] pr-6">
          <div className="border-b border-[#222] pb-5 mb-5">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#222]">스크린샷</h2>
            {image && fileInfo ? (
              <div className="flex items-center gap-3 rounded-xl border border-[#222] p-2">
                <div className="w-14 h-14 shrink-0 rounded-lg border border-[#222] overflow-hidden bg-[#f0f0f0]">
                  <img
                    src={image.src}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#222] truncate">{fileInfo.name}</p>
                  <p className="text-xs text-[#666] mt-0.5">
                    {image.naturalWidth} × {image.naturalHeight}px
                  </p>
                  <p className="text-xs text-[#666]">
                    {(fileInfo.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={clearImage}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-[#222] text-[#222] hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors text-sm font-bold leading-none"
                >
                  ×
                </button>
              </div>
            ) : (
              <UploadZone onFile={onFile} />
            )}
          </div>

          <div className="border-b border-[#222] pb-5 mb-5">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#222]">프레임</h2>
            <FramePicker selectedId={selectedFrame?.id ?? null} onSelect={handleFrameSelect} />
          </div>

          {image && selectedFrame && (
            <div className="border-b border-[#222] pb-5 mb-5">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#222]">이미지 조정</h2>
              <ImageAdjust
                scale={transform.scale}
                onScaleChange={setScale}
                onReset={resetTransform}
              />
            </div>
          )}

          {isBrowser && selectedFrame && (
            <div className="border-b border-[#222] pb-5 mb-5">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#222]">브라우저</h2>
              <BrowserControls frame={selectedFrame} state={browserState} />
            </div>
          )}

          <div className="border-b border-[#222] pb-5 mb-5">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#222]">그림자</h2>
            <ShadowControls value={shadow} onChange={setShadow} />
          </div>

          <div className="mt-auto pt-2">
            <ExportControls
              onExport={handleExport}
              disabled={!image || !selectedFrame}
            />
          </div>
        </aside>

        <PreviewCanvas
          screenshot={image}
          frame={selectedFrame}
          transform={transform}
          shadow={shadow}
          onPan={pan}
          browserState={isBrowser ? browserState : undefined}
        />
      </main>

      <Toast message={error} onClose={clearImage} />
    </div>
  )
}
