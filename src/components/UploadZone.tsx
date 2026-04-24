import { useRef, useState } from 'react'

type UploadZoneProps = {
  onFile: (file: File) => void
}

export function UploadZone({ onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed py-5 px-4 transition-colors ${
        dragging
          ? 'border-accent bg-accent/10'
          : 'border-black/[0.15] hover:border-accent hover:bg-accent/5'
      }`}
    >
      <p className="text-[12px] font-semibold text-ink text-center">클릭하거나 드래그해서 스크린샷 업로드</p>
      <p className="mt-1 text-[10px] text-muted">PNG · JPG · 최대 8,000px</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
