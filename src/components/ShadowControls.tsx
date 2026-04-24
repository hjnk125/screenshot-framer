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
          className="rounded"
        />
        <span className="text-sm text-gray-300">그림자</span>
      </label>

      <div className={`space-y-3 ${value.enabled ? '' : 'opacity-40 pointer-events-none'}`}>
        <SliderRow
          label="강도"
          value={value.intensity}
          min={0} max={100}
          disabled={!value.enabled}
          onChange={v => update({ intensity: v })}
        />
        <SliderRow
          label="블러"
          value={value.blur}
          min={0} max={100}
          disabled={!value.enabled}
          onChange={v => update({ blur: v })}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">색상</span>
          <input
            type="color"
            value={value.color}
            disabled={!value.enabled}
            onChange={e => update({ color: e.target.value })}
            className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}

function SliderRow(props: {
  label: string
  value: number
  min: number
  max: number
  disabled: boolean
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs text-gray-400">{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        disabled={props.disabled}
        onChange={e => props.onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="w-8 text-right text-xs text-gray-500">{props.value}</span>
    </div>
  )
}
