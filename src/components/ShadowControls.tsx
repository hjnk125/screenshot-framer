import type { ShadowConfig } from '../types/frame'

type ShadowControlsProps = {
  value: ShadowConfig
  onChange: (config: ShadowConfig) => void
}

export function ShadowControls({ value, onChange }: ShadowControlsProps) {
  const update = (partial: Partial<ShadowConfig>) => onChange({ ...value, ...partial })

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={e => update({ enabled: e.target.checked })}
          className="rounded accent-lime-500 w-4 h-4"
        />
        <span className="text-sm font-medium text-[#222]">그림자</span>
      </label>

      <div className={`${value.enabled ? '' : 'opacity-30 pointer-events-none'}`}>
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs font-medium text-[#222]">불투명도</span>
          <input
            type="range"
            min={0}
            max={100}
            value={value.opacity}
            disabled={!value.enabled}
            onChange={e => update({ opacity: Number(e.target.value) })}
            className="flex-1 accent-lime-500"
          />
          <span className="w-8 text-right text-xs font-medium text-[#222]">{value.opacity}</span>
        </div>
      </div>
    </div>
  )
}
