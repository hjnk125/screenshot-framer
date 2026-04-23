import { useState } from 'react'

const MAX_DIMENSION = 8000

export type ImageUploadState = {
  image: HTMLImageElement | null
  dataUrl: string | null
  error: string | null
  handleFile: (file: File) => Promise<void>
  clearImage: () => void
}

export function useImageUpload(): ImageUploadState {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File): Promise<void> => {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => {
        const url = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
            setError(
              `이미지 크기가 너무 큽니다. 한 변이 8,000px를 초과할 수 없습니다. (현재: ${img.naturalWidth}×${img.naturalHeight}px)`
            )
            setImage(null)
            setDataUrl(null)
          } else {
            setError(null)
            setImage(img)
            setDataUrl(url)
          }
          resolve()
        }
        img.src = url
      }
      reader.readAsDataURL(file)
    })
  }

  const clearImage = () => {
    setImage(null)
    setDataUrl(null)
    setError(null)
  }

  return { image, dataUrl, error, handleFile, clearImage }
}
