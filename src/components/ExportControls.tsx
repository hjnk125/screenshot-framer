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
      <div className="flex gap-0 rounded-lg border border-[#222] overflow-hidden">
        {SCALES.map((s, i) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              i > 0 ? 'border-l border-[#222]' : ''
            } ${
              scale === s
                ? 'bg-[#222] text-white'
                : 'bg-white text-[#222] hover:bg-lime-50'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
      <button
        onClick={() => onExport(scale)}
        disabled={disabled}
        className="flex-1 rounded-lg bg-lime-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-lime-400 disabled:opacity-30 disabled:cursor-not-allowed border border-lime-500 hover:border-lime-400"
      >
        PNG 저장
      </button>
    </div>
  )
}
