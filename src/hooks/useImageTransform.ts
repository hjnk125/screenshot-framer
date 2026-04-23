import { useState, useCallback } from 'react'
import type { ImageTransform } from '../types/frame'

const INITIAL: ImageTransform = { scale: 1, offsetX: 0, offsetY: 0 }

export function useImageTransform() {
  const [transform, setTransform] = useState<ImageTransform>(INITIAL)

  const setScale = useCallback((scale: number) => {
    setTransform(prev => ({ ...prev, scale }))
  }, [])

  const pan = useCallback((dx: number, dy: number) => {
    setTransform(prev => ({
      ...prev,
      offsetX: prev.offsetX + dx,
      offsetY: prev.offsetY + dy,
    }))
  }, [])

  const reset = useCallback(() => setTransform(INITIAL), [])

  return { transform, setScale, pan, reset }
}
