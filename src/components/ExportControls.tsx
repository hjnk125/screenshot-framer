import type { CanvasSize } from "../utils/compositor";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

type ExportControlsProps = {
  onExport: () => void;
  disabled: boolean;
  isExporting?: boolean;
  getOutputSize?: () => CanvasSize | null;
  uploadSize?: { width: number; height: number } | null;
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `~${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `~${Math.round(bytes / 1024)} KB`;
}

export function ExportControls({
  onExport,
  disabled,
  isExporting = false,
  getOutputSize,
  uploadSize,
}: ExportControlsProps) {
  const outputSize = getOutputSize?.() ?? null;
  const estimatedBytes = outputSize
    ? (outputSize.width * outputSize.height * 4) / 3
    : null;

  const isResized =
    outputSize !== null &&
    uploadSize != null &&
    uploadSize.width > outputSize.width;

  return (
    <div className="flex flex-col gap-2 rounded-card-dense bg-ink p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-white/60">
          Export
        </span>
      </div>

      <button
        onClick={onExport}
        disabled={disabled || isExporting}
        className="flex w-full items-center justify-center gap-[6px] rounded-[9px] bg-accent px-3 py-[9px] text-[12.5px] font-bold text-ink transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {isExporting ? (
          <Spinner size={13} />
        ) : (
          <>
            <Icon name="download" size={13} strokeWidth={2.2} />
            Export PNG
          </>
        )}
      </button>

      {outputSize && estimatedBytes !== null && (
        <p className="text-center font-mono text-[10px] text-white/30">
          {outputSize.width.toLocaleString()} ×{" "}
          {outputSize.height.toLocaleString()} px ∙{" "}
          {formatFileSize(estimatedBytes)}
        </p>
      )}

      {isResized && outputSize && (
        <p className="text-center text-[10px] text-yellow-400/70">
          Resized to {outputSize.width.toLocaleString()} ×{" "}
          {outputSize.height.toLocaleString()} px
          <br />
          (your image is larger than this frame supports)
        </p>
      )}
    </div>
  );
}
