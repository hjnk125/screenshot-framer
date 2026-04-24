import type { CanvasSize } from "../utils/compositor";
import { Icon } from "./Icon";

type ExportControlsProps = {
  onExport: () => void;
  disabled: boolean;
  getOutputSize?: () => CanvasSize | null;
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `~${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `~${Math.round(bytes / 1024)} KB`;
}

export function ExportControls({
  onExport,
  disabled,
  getOutputSize,
}: ExportControlsProps) {
  const outputSize = getOutputSize?.() ?? null;
  const estimatedBytes = outputSize
    ? (outputSize.width * outputSize.height * 4) / 3
    : null;

  return (
    <div className="flex flex-col gap-2 rounded-card-dense bg-ink p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-white/60">
          Export
        </span>
      </div>

      <button
        onClick={onExport}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-[6px] rounded-[9px] bg-accent px-3 py-[9px] text-[12.5px] font-bold text-ink transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Icon name="download" size={13} strokeWidth={2.2} />
        Export PNG
      </button>

      {outputSize && estimatedBytes !== null && (
        <p className="text-center font-mono text-[10px] text-white/30">
          {outputSize.width.toLocaleString()} ×{" "}
          {outputSize.height.toLocaleString()} px ∙{" "}
          {formatFileSize(estimatedBytes)}
        </p>
      )}
    </div>
  );
}
