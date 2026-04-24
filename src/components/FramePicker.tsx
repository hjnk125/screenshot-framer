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
      <div className="flex gap-1 rounded-lg bg-gray-900 p-1 mb-3">
        {(['device', 'browser'] as FrameCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setTab(cat)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
              tab === cat ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
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
            className={`rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
              selectedId === frame.id
                ? 'border-blue-500 bg-blue-950/40 text-white'
                : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
            }`}
          >
            {frame.label}
          </button>
        ))}
      </div>
    </div>
  )
}
