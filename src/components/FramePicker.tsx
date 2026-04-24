import { useState } from 'react'
import type { Frame, FrameCategory } from '../types/frame'
import { FRAMES } from '../data/frames'
import { Icon } from './Icon'

type FramePickerProps = {
  selectedId: string | null
  onSelect: (frame: Frame) => void
  showHint?: boolean
}

export function FramePicker({ selectedId, onSelect, showHint }: FramePickerProps) {
  const [tab, setTab] = useState<FrameCategory>('device')

  const filtered = FRAMES.filter(f => f.category === tab)

  return (
    <div className="bg-card rounded-card border border-black/[0.07] p-3 flex flex-col shrink-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-soft uppercase tracking-[0.04em]">Frame</span>
        {showHint && (
          <span className="flex items-center gap-[5px] text-[11px] font-semibold text-accent animate-bounce select-none">
            Pick a frame
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M7 2v10M7 12l-3-3M7 12l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
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
            {cat === 'device' ? 'Device' : 'Browser'}
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
