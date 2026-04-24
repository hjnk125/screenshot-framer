import { useState, useCallback } from 'react'
import type { BrowserState } from '../types/frame'

export type UseBrowserStateReturn = BrowserState & {
  setUrl: (url: string) => void
  handleFavicon: (file: File) => void
  clearFavicon: () => void
}

const DEFAULT_URL = 'https://figma.com'

export function useBrowserState(): UseBrowserStateReturn {
  const [url, setUrl] = useState(DEFAULT_URL)
  const [favicon, setFavicon] = useState<HTMLImageElement | null>(null)

  const handleFavicon = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      const img = new Image()
      img.onload = () => setFavicon(img)
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const clearFavicon = useCallback(() => setFavicon(null), [])

  return { url, setUrl, favicon, handleFavicon, clearFavicon }
}
