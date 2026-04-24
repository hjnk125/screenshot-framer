import { useState } from 'react'
import type { ExportScale } from '../types/frame'
import { Icon } from './Icon'

type ExportControlsProps = {
  onExport: (scale: ExportScale) => void
  disabled: boolean
}

const SCALES: ExportScale[] = [1, 2, 3]

export function ExportControls({ onExport, disabled }: ExportControlsProps) {
  const [scale, setScale] = useState<ExportScale>(1)

  return (
    <div className="bg-ink rounded-card-dense p-4 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[9.5px] font-bold text-white/60 uppercase tracking-[0.06em]">Export</span>
        <span className="text-[10px] text-white/40 font-mono">{scale}× scale</span>
      </div>

      {/* Scale buttons */}
      <div className="flex gap-1">
        {SCALES.map(s => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`flex-1 py-[6px] text-[11.5px] font-bold rounded-[7px] border transition-colors ${
              scale === s
                ? 'bg-accent text-ink border-accent'
                : 'bg-white/[0.06] text-white border-white/10 hover:bg-white/10'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Export button */}
      <button
        onClick={() => onExport(scale)}
        disabled={disabled}
        className="w-full py-[9px] px-3 rounded-[9px] bg-accent text-ink text-[12.5px] font-bold flex items-center justify-center gap-[6px] disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95 transition-all"
      >
        <Icon name="download" size={13} strokeWidth={2.2} />
        Export PNG
      </button>
    </div>
  )
}
