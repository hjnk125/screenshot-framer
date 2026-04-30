import { Icon } from "../Icon";

type ImageScaleCardProps = {
  scale: number;
  onScaleChange: (scale: number) => void;
  onReset: () => void;
};

export default function ImageScaleCard({
  scale,
  onScaleChange,
  onReset,
}: ImageScaleCardProps) {
  const pct = ((scale - 0.5) / 2.5) * 100;

  return (
    <div className="flex shrink-0 flex-col rounded-card-dense border border-black/[0.07] bg-card p-4">
      {/* Label + hint */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
          Image
        </span>
        <span className="font-mono text-[10px] text-muted">
          {scale.toFixed(2)}×
        </span>
      </div>

      {/* Slider row */}
      <div className="flex items-center gap-3">
        <Icon name="zoom" size={14} className="shrink-0 text-muted" />
        <div className="relative flex h-4 flex-1 items-center">
          <div className="h-[4px] w-full rounded border border-black/[0.07] bg-card-inner" />
          <div
            className="absolute left-0 h-[4px] rounded bg-ink"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.01}
            value={scale}
            onChange={(e) => onScaleChange(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
          <div
            className="pointer-events-none absolute h-[14px] w-[14px] rounded-full border-2 border-ink bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
            style={{ left: `calc(${pct}% - 7px)` }}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted">Drag to reposition</span>
        <button
          onClick={onReset}
          className="flex cursor-pointer items-center gap-1 border-none bg-transparent text-[11px] font-semibold text-soft transition-colors hover:text-ink"
        >
          <Icon name="reset" size={11} /> Reset
        </button>
      </div>
    </div>
  );
}
