import { useEffect, useRef, useCallback } from 'react'
import type { Frame, ShadowConfig, ImageTransform } from '../types/frame'
import { useCompositor } from '../hooks/useCompositor'

type PreviewCanvasProps = {
  screenshot: HTMLImageElement | null
  frame: Frame | null
  transform: ImageTransform
  shadow: ShadowConfig
  onPan: (dx: number, dy: number) => void
}

export function PreviewCanvas({ screenshot, frame, transform, shadow, onPan }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { renderToCanvas } = useCompositor({ screenshot, frame, transform, shadow })
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    renderToCanvas(canvasRef.current, 1)
  }, [renderToCanvas])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    dragStart.current = { x: e.clientX, y: e.clientY }
    onPan(dx, dy)
  }, [onPan])

  const handleMouseUp = useCallback(() => {
    dragStart.current = null
  }, [])

  if (!screenshot || !frame) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-[#222] bg-[#fafafa]">
        <p className="text-[#888] text-sm font-medium">프레임과 스크린샷을 선택하면 미리보기가 나타납니다</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center rounded-2xl border-2 border-[#222] bg-[url('/checkerboard.svg')] bg-repeat p-4 overflow-auto">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}
