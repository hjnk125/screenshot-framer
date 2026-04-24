import { useState } from 'react'
import type { Frame, FrameCategory } from '../types/frame'
import { FRAMES } from '../data/frames'
import { Icon } from './Icon'

type FramePickerProps = {
  selectedId: string | null
  onSelect: (frame: Frame) => void
}

export function FramePicker({ selectedId, onSelect }: FramePickerProps) {
  const [tab, setTab] = useState<FrameCategory>('device')

  const filtered = FRAMES.filter(f => f.category === tab)

  return (
    <div className="bg-card rounded-card border border-black/[0.07] p-4 flex flex-col shrink-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-soft uppercase tracking-[0.04em]">프레임</span>
      </div>

      {/* Segment control */}
      <div className="flex bg-card-inner p-[3px] rounded-[10px] border border-black/[0.07] mb-[10px]">
        {(['device', 'browser'] as FrameCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setTab(cat)}
            className={`flex-1 py-[7px] text-[12px] font-semibold rounded-[7px] transition-colors ${
              tab === cat
                ? 'bg-ink text-white'
                : 'bg-transparent text-soft hover:text-ink'
            }`}
          >
            {cat === 'device' ? '디바이스' : '브라우저'}
          </button>
        ))}
      </div>

      {/* Frame grid */}
      <div className="grid grid-cols-2 gap-[6px] max-h-[130px] overflow-y-auto">
        {filtered.map(frame => {
          const active = selectedId === frame.id
          return (
            <button
              key={frame.id}
              onClick={() => onSelect(frame)}
              className={`rounded-[10px] border px-[10px] py-[10px] text-[11.5px] font-semibold text-left text-ink cursor-pointer flex items-center justify-between gap-1 min-h-[36px] transition-colors ${
                active
                  ? 'bg-accent border-accent'
                  : 'bg-card-inner border-black/[0.07] hover:border-black/20'
              }`}
            >
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{frame.label}</span>
              {active && <Icon name="check" size={12} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
