import { useState, useCallback } from 'react'
import type { Frame, ShadowConfig, ExportScale } from './types/frame'
import { useImageUpload } from './hooks/useImageUpload'
import { useImageTransform } from './hooks/useImageTransform'
import { useCompositor } from './hooks/useCompositor'
import { UploadZone } from './components/UploadZone'
import { FramePicker } from './components/FramePicker'
import { ImageAdjust } from './components/ImageAdjust'
import { ShadowControls } from './components/ShadowControls'
import { ExportControls } from './components/ExportControls'
import { PreviewCanvas } from './components/PreviewCanvas'
import { Toast } from './components/Toast'

const DEFAULT_SHADOW: ShadowConfig = {
  enabled: false,
  color: '#000000',
  blur: 40,
  intensity: 50,
}

export default function App() {
  const { image, error, handleFile, clearImage } = useImageUpload()
  const { transform, setScale, pan, reset: resetTransform } = useImageTransform()
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [shadow, setShadow] = useState<ShadowConfig>(DEFAULT_SHADOW)

  const { exportPng } = useCompositor({
    screenshot: image,
    frame: selectedFrame,
    transform,
    shadow,
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
            {image ? (
              <div className="flex items-center justify-between rounded-xl border border-[#222] px-3 py-2 text-sm">
                <span className="text-[#222] truncate font-medium">업로드 완료</span>
                <button onClick={clearImage} className="text-[#222] hover:text-red-600 ml-2 font-bold text-lg leading-none">×</button>
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
        />
      </main>

      <Toast message={error} onClose={clearImage} />
    </div>
  )
}
