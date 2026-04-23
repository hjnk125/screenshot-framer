import { useCallback, useRef } from 'react'
import type { Frame, ShadowConfig, ImageTransform, ExportScale } from '../types/frame'
import { drawComposite } from '../utils/compositor'

export type CompositorParams = {
  screenshot: HTMLImageElement | null
  frame: Frame | null
  transform: ImageTransform
  shadow: ShadowConfig
}

export function useCompositor(params: CompositorParams) {
  const frameImgCache = useRef<Map<string, HTMLImageElement>>(new Map())

  const loadFrameImage = useCallback((assetPath: string): Promise<HTMLImageElement> => {
    const cached = frameImgCache.current.get(assetPath)
    if (cached) return Promise.resolve(cached)

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        frameImgCache.current.set(assetPath, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = assetPath
    })
  }, [])

  const renderToCanvas = useCallback(
    async (canvas: HTMLCanvasElement, scale: ExportScale = 1): Promise<void> => {
      const { screenshot, frame, transform, shadow } = params
      if (!screenshot || !frame) return

      const frameImg = await loadFrameImage(frame.assetPath)
      drawComposite({ canvas, screenshot, frameImg, frame, transform, shadow, scale })
    },
    [params, loadFrameImage]
  )

  const exportPng = useCallback(
    async (scale: ExportScale): Promise<void> => {
      const { screenshot, frame, transform, shadow } = params
      if (!screenshot || !frame) return

      const canvas = document.createElement('canvas')
      const frameImg = await loadFrameImage(frame.assetPath)
      drawComposite({ canvas, screenshot, frameImg, frame, transform, shadow, scale })

      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `framed-${frame.id}-${scale}x.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    },
    [params, loadFrameImage]
  )

  return { renderToCanvas, exportPng }
}
