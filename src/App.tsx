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
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Screenshot Framer</h1>
      </header>

      <main className="mx-auto max-w-7xl p-6 grid grid-cols-[320px_1fr] gap-6 h-[calc(100vh-65px)]">
        <aside className="flex flex-col gap-5 overflow-y-auto">
          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">스크린샷</h2>
            {image ? (
              <div className="flex items-center justify-between rounded-xl border border-gray-800 px-3 py-2 text-sm">
                <span className="text-gray-300 truncate">업로드 완료</span>
                <button onClick={clearImage} className="text-gray-500 hover:text-gray-300 ml-2">×</button>
              </div>
            ) : (
              <UploadZone onFile={onFile} />
            )}
          </section>

          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">프레임</h2>
            <FramePicker selectedId={selectedFrame?.id ?? null} onSelect={handleFrameSelect} />
          </section>

          {image && selectedFrame && (
            <section>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">이미지 조정</h2>
              <ImageAdjust
                scale={transform.scale}
                onScaleChange={setScale}
                onReset={resetTransform}
              />
            </section>
          )}

          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">그림자</h2>
            <ShadowControls value={shadow} onChange={setShadow} />
          </section>

          <section className="mt-auto">
            <ExportControls
              onExport={handleExport}
              disabled={!image || !selectedFrame}
            />
          </section>
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
