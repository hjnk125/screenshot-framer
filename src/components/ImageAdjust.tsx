import { Icon } from './Icon'

type ImageAdjustProps = {
  scale: number
  onScaleChange: (scale: number) => void
  onReset: () => void
}

export function ImageAdjust({ scale, onScaleChange, onReset }: ImageAdjustProps) {
  const pct = ((scale - 0.5) / 2.5) * 100

  return (
    <div className="bg-card rounded-card-dense border border-black/[0.07] p-4 flex flex-col shrink-0">
      {/* Label + hint */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-soft uppercase tracking-[0.04em]">Image</span>
        <span className="text-[11px] text-muted font-mono">{scale.toFixed(2)}×</span>
      </div>

      {/* Slider row */}
      <div className="flex items-center gap-[10px]">
        <Icon name="zoom" size={14} className="text-muted shrink-0" />
        <div className="flex-1 relative h-4 flex items-center">
          <div className="w-full h-[4px] bg-card-inner rounded border border-black/[0.07]" />
          <div
            className="absolute left-0 h-[4px] bg-ink rounded"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.01}
            value={scale}
            onChange={e => onScaleChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute w-[14px] h-[14px] rounded-full bg-white border-2 border-ink shadow-[0_1px_3px_rgba(0,0,0,0.15)] pointer-events-none"
            style={{ left: `calc(${pct}% - 7px)` }}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-[10px]">
        <span className="text-[10.5px] text-muted">Drag to reposition</span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-semibold text-soft bg-transparent border-none cursor-pointer hover:text-ink transition-colors"
        >
          <Icon name="reset" size={11} /> Reset
        </button>
      </div>
    </div>
  )
}
