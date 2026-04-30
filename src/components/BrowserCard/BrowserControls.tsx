import { useRef } from "react";
import type { Frame } from "../../types/frame";
import type { UseBrowserStateReturn } from "../../hooks/useBrowserState";

type BrowserControlsProps = {
  frame: Frame;
  state: UseBrowserStateReturn;
};

export function BrowserControls({ frame, state }: BrowserControlsProps) {
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const hasTabArea = !!frame.browserMeta?.tabArea;

  return (
    <div className="space-y-3">
      {/* URL 입력 */}
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-soft">
          URL
        </label>
        <input
          type="text"
          value={state.url}
          onChange={(e) => state.setUrl(e.target.value)}
          className="w-full rounded-[10px] border border-black/[0.07] bg-card-inner px-3 py-1.5 text-[12px] font-medium text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="https://example.com"
        />
      </div>

      {/* 탭 타이틀 (Chrome만) */}
      {hasTabArea && (
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-soft">
            Tab title
          </label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => state.setTitle(e.target.value)}
            className="w-full rounded-[10px] border border-black/[0.07] bg-card-inner px-3 py-1.5 text-[12px] font-medium text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Page title"
          />
        </div>
      )}

      {/* Favicon 업로드 (탭이 있는 브라우저만) */}
      {hasTabArea && (
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-soft">
            Favicon
          </label>
          <div className="flex items-center gap-2">
            {(state.favicon || frame.browserMeta?.defaultFaviconPath) && (
              <img
                src={
                  state.favicon?.src ?? frame.browserMeta?.defaultFaviconPath
                }
                className="aspect-square h-[30px] rounded-[7px] border border-black/[0.07] object-cover"
              />
            )}
            <button
              onClick={() => faviconInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-[7px] border border-black/[0.07] bg-card-inner px-2.5 py-1.5 text-[11.5px] font-semibold text-ink transition-colors hover:border-black/20"
            >
              <span>{state.favicon ? "Change" : "Upload"}</span>
            </button>
            {state.favicon && (
              <button
                onClick={state.clearFavicon}
                className="text-[11.5px] font-medium text-muted transition-colors hover:text-ink"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={faviconInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) state.handleFavicon(file);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
