import { useEffect, useRef, useCallback } from 'react'
import type { Frame, ExportScale } from '../types/frame'

type PreviewCanvasProps = {
  screenshot: HTMLImageElement | null
  frame: Frame | null
  onPan: (dx: number, dy: number) => void
  renderToCanvas: (canvas: HTMLCanvasElement, scale: ExportScale) => Promise<void>
}

export function PreviewCanvas({ screenshot, frame, onPan, renderToCanvas }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    renderToCanvas(canvasRef.current, 1)
  }, [renderToCanvas])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = rect.width > 0 ? canvasRef.current.width / rect.width : 1
    const scaleY = rect.height > 0 ? canvasRef.current.height / rect.height : 1
    const dx = (e.clientX - dragStart.current.x) * scaleX
    const dy = (e.clientY - dragStart.current.y) * scaleY
    dragStart.current = { x: e.clientX, y: e.clientY }
    onPan(dx, dy)
  }, [onPan])

  const handleMouseUp = useCallback(() => {
    dragStart.current = null
  }, [])

  if (!screenshot || !frame) {
    return (
      <div className="flex h-full items-center justify-center rounded-card border border-black/[0.07] bg-[url('/checkerboard.svg')] bg-repeat">
        <p className="text-muted text-[13px] font-medium">Select a frame and screenshot to preview</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center rounded-card border border-black/[0.07] bg-[url('/checkerboard.svg')] bg-repeat p-10 overflow-hidden">
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
