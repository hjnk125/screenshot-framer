import { useState } from "react";
import type { ExportScale } from "../types/frame";
import { Icon } from "./Icon";

type ExportControlsProps = {
  onExport: (scale: ExportScale) => void;
  disabled: boolean;
};

const SCALES: ExportScale[] = [1, 2, 3];

export function ExportControls({ onExport, disabled }: ExportControlsProps) {
  const [scale, setScale] = useState<ExportScale>(1);

  return (
    <div className="flex flex-col gap-2 rounded-card-dense bg-ink p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-white/60">
          Export
        </span>
        <span className="font-mono text-[10px] text-white/40">
          {scale}× scale
        </span>
      </div>

      {/* Scale buttons */}
      <div className="flex gap-1">
        {SCALES.map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`flex-1 rounded-[7px] border py-[6px] text-[11.5px] font-bold transition-colors ${
              scale === s
                ? "border-accent bg-accent text-ink"
                : "border-white/10 bg-white/[0.06] text-white hover:bg-white/10"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Export button */}
      <button
        onClick={() => onExport(scale)}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-[6px] rounded-[9px] bg-accent px-3 py-[9px] text-[12.5px] font-bold text-ink transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Icon name="download" size={13} strokeWidth={2.2} />
        Export PNG
      </button>
    </div>
  );
}
