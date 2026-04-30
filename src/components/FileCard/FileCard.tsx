import FileControls from "./FileControls";

type FileCardProps = {
  image: HTMLImageElement | null;
  previewUrl: string | null;
  fileInfo: { name: string; size: number } | null;
  onFile: (file: File) => void;
  onClear: () => void;
};

export default function FileCard({ image, previewUrl, fileInfo, onFile, onClear }: FileCardProps) {
  return (
    <div className="shrink-0 rounded-card-dense border border-black/[0.07] bg-card-dense p-4">
      {image && fileInfo ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
              File
            </span>
            <span className="font-mono text-[10px] text-muted">
              {fileInfo.size >= 1024 * 1024
                ? `${(fileInfo.size / 1024 / 1024).toFixed(1)} MB`
                : `${(fileInfo.size / 1024).toFixed(0)} KB`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[8px] border border-black/[0.07] bg-[#f0f0ef]">
              <img
                src={previewUrl ?? undefined}
                alt="preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-ink">{fileInfo.name}</p>
              <p className="mt-[1px] font-mono text-[10px] text-muted">
                {image.naturalWidth} × {image.naturalHeight}
              </p>
            </div>
            <button
              onClick={onClear}
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] text-[14px] leading-none text-soft transition-colors hover:bg-red-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
              File
            </span>
          </div>
          <FileControls onFile={onFile} />
        </>
      )}
    </div>
  );
}
