import type { ShadowConfig } from "../types/frame";

type ShadowControlsProps = {
  value: ShadowConfig;
  onChange: (config: ShadowConfig) => void;
};

export function ShadowControls({ value, onChange }: ShadowControlsProps) {
  const update = (partial: Partial<ShadowConfig>) =>
    onChange({ ...value, ...partial });
  const pct = value.opacity;

  return (
    <div className="flex shrink-0 flex-col rounded-card-dense border border-black/[0.07] bg-card p-4">
      {/* Label + hint */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
          Shadow
        </span>
        <span className="font-mono text-[10px] text-muted">
          {value.enabled ? `${pct}%` : "OFF"}
        </span>
      </div>

      {/* Toggle row */}
      <div className={`flex items-center gap-3 ${value.enabled ? "mb-3" : ""}`}>
        <button
          onClick={() => update({ enabled: !value.enabled })}
          aria-label="Toggle shadow"
          aria-pressed={value.enabled}
          className={`relative h-[18px] w-[32px] shrink-0 cursor-pointer rounded-full border-none transition-colors ${
            value.enabled ? "bg-ink" : "bg-[#d5d5d3]"
          }`}
        >
          <div
            className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-all ${
              value.enabled ? "left-[16px]" : "left-[2px]"
            }`}
          />
        </button>
        <span
          className={`text-[12px] font-medium transition-colors ${value.enabled ? "text-ink" : "text-muted"}`}
        >
          Shadow
        </span>
      </div>

      {/* Opacity slider (only when enabled) */}
      {value.enabled && (
        <div className="flex items-center gap-3">
          <span className="shrink-0 font-mono text-[11px] text-muted">0</span>
          <div className="relative flex h-4 flex-1 items-center">
            <div className="h-[4px] w-full rounded border border-black/[0.07] bg-card-inner" />
            <div
              className="absolute left-0 h-[4px] rounded bg-ink"
              style={{ width: `${pct}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={pct}
              onChange={(e) => update({ opacity: Number(e.target.value) })}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
            <div
              className="pointer-events-none absolute h-[14px] w-[14px] rounded-full border-2 border-ink bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
              style={{ left: `calc(${pct}% - 7px)` }}
            />
          </div>
          <span className="shrink-0 pl-[6px] font-mono text-[11px] text-muted">
            100
          </span>
        </div>
      )}
    </div>
  );
}
