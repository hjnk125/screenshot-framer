import { useState } from 'react'
import type { ExportScale } from '../types/frame'

type ExportControlsProps = {
  onExport: (scale: ExportScale) => void
  disabled: boolean
}

const SCALES: ExportScale[] = [1, 2, 3]

export function ExportControls({ onExport, disabled }: ExportControlsProps) {
  const [scale, setScale] = useState<ExportScale>(2)

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 rounded-lg bg-gray-900 p-1">
        {SCALES.map(s => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              scale === s ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
      <button
        onClick={() => onExport(scale)}
        disabled={disabled}
        className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        PNG 저장
      </button>
    </div>
  )
}
