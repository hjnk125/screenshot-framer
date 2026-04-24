import type { ShadowConfig } from '../types/frame'

type ShadowControlsProps = {
  value: ShadowConfig
  onChange: (config: ShadowConfig) => void
}

export function ShadowControls({ value, onChange }: ShadowControlsProps) {
  const update = (partial: Partial<ShadowConfig>) => onChange({ ...value, ...partial })
  const pct = value.opacity

  return (
    <div className="bg-card rounded-card-dense border border-black/[0.07] p-4 flex flex-col shrink-0">
      {/* Label + hint */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-soft uppercase tracking-[0.04em]">Shadow</span>
        <span className="text-[11px] text-muted font-mono">{value.enabled ? `${pct}%` : 'OFF'}</span>
      </div>

      {/* Toggle row */}
      <div className={`flex items-center gap-[10px] ${value.enabled ? 'mb-3' : ''}`}>
        <button
          onClick={() => update({ enabled: !value.enabled })}
          aria-label="Toggle shadow"
          aria-pressed={value.enabled}
          className={`relative w-[32px] h-[18px] rounded-full border-none cursor-pointer transition-colors shrink-0 ${
            value.enabled ? 'bg-ink' : 'bg-[#d5d5d3]'
          }`}
        >
          <div
            className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all ${
              value.enabled ? 'left-[16px]' : 'left-[2px]'
            }`}
          />
        </button>
        <span className={`text-[12px] font-medium transition-colors ${value.enabled ? 'text-ink' : 'text-muted'}`}>
          Shadow
        </span>
      </div>

      {/* Opacity slider (only when enabled) */}
      {value.enabled && (
        <div className="flex items-center gap-[10px]">
          <span className="text-[11px] font-semibold text-muted shrink-0">0</span>
          <div className="flex-1 relative h-4 flex items-center">
            <div className="w-full h-[4px] bg-card-inner rounded border border-black/[0.07]" />
            <div
              className="absolute left-0 h-[4px] bg-ink rounded"
              style={{ width: `${pct}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={pct}
              onChange={e => update({ opacity: Number(e.target.value) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute w-[14px] h-[14px] rounded-full bg-white border-2 border-ink shadow-[0_1px_3px_rgba(0,0,0,0.15)] pointer-events-none"
              style={{ left: `calc(${pct}% - 7px)` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-muted shrink-0 pl-[6px]">100</span>
        </div>
      )}
    </div>
  )
}
