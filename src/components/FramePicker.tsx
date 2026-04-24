import { useState } from 'react'
import type { Frame, FrameCategory } from '../types/frame'
import { FRAMES } from '../data/frames'

type FramePickerProps = {
  selectedId: string | null
  onSelect: (frame: Frame) => void
}

export function FramePicker({ selectedId, onSelect }: FramePickerProps) {
  const [tab, setTab] = useState<FrameCategory>('device')

  const filtered = FRAMES.filter(f => f.category === tab)

  return (
    <div>
      <div className="flex gap-0 rounded-lg border-2 border-[#222] overflow-hidden mb-3">
        {(['device', 'browser'] as FrameCategory[]).map((cat, i) => (
          <button
            key={cat}
            onClick={() => setTab(cat)}
            className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
              i > 0 ? 'border-l-2 border-[#222]' : ''
            } ${
              tab === cat
                ? 'bg-[#222] text-white'
                : 'bg-white text-[#222] hover:bg-lime-50'
            }`}
          >
            {cat === 'device' ? '디바이스' : '브라우저'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filtered.map(frame => (
          <button
            key={frame.id}
            onClick={() => onSelect(frame)}
            className={`rounded-lg border-2 px-3 py-2 text-sm text-left font-medium transition-colors ${
              selectedId === frame.id
                ? 'border-lime-500 bg-lime-500 text-white'
                : 'border-[#222] text-[#222] hover:border-lime-500 hover:bg-lime-50'
            }`}
          >
            {frame.label}
          </button>
        ))}
      </div>
    </div>
  )
}
