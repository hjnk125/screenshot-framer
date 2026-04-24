import { useState, useCallback } from 'react'
import type { BrowserState } from '../types/frame'

export type UseBrowserStateReturn = BrowserState & {
  setUrl: (url: string) => void
  setTitle: (title: string) => void
  handleFavicon: (file: File) => void
  clearFavicon: () => void
}

const DEFAULT_URL = 'https://www.example.com'
const DEFAULT_TITLE = 'New Tab'

export function useBrowserState(): UseBrowserStateReturn {
  const [url, setUrl] = useState(DEFAULT_URL)
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [favicon, setFavicon] = useState<HTMLImageElement | null>(null)

  const handleFavicon = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onerror = () => { /* silent: favicon upload is non-critical */ }
    reader.onload = e => {
      const src = e.target?.result as string
      const img = new Image()
      img.onerror = () => { /* silent: invalid image just keeps previous favicon */ }
      img.onload = () => setFavicon(img)
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const clearFavicon = useCallback(() => setFavicon(null), [])

  return { url, setUrl, title, setTitle, favicon, handleFavicon, clearFavicon }
}
