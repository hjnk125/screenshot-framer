import { useRef } from 'react'
import type { Frame } from '../types/frame'
import type { UseBrowserStateReturn } from '../hooks/useBrowserState'

type BrowserControlsProps = {
  frame: Frame
  state: UseBrowserStateReturn
}

export function BrowserControls({ frame, state }: BrowserControlsProps) {
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const hasTabArea = !!frame.browserMeta?.tabArea

  return (
    <div className="space-y-3">
      {/* URL 입력 */}
      <div>
        <label className="block text-xs font-medium text-[#222] mb-1">주소</label>
        <input
          type="text"
          value={state.url}
          onChange={e => state.setUrl(e.target.value)}
          className="w-full rounded-lg border border-[#222] px-3 py-1.5 text-xs font-medium text-[#222] bg-white focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
          placeholder="https://example.com"
        />
      </div>

      {/* 탭 타이틀 (Chrome만) */}
      {hasTabArea && (
        <div>
          <label className="block text-xs font-medium text-[#222] mb-1">탭 제목</label>
          <input
            type="text"
            value={state.title}
            onChange={e => state.setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#222] px-3 py-1.5 text-xs font-medium text-[#222] bg-white focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
            placeholder="페이지 제목"
          />
        </div>
      )}

      {/* Favicon 업로드 (탭이 있는 브라우저만) */}
      {hasTabArea && (
        <div>
          <label className="block text-xs font-medium text-[#222] mb-1">Favicon</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => faviconInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-[#222] px-2.5 py-1.5 text-xs font-medium text-[#222] hover:bg-lime-50 transition-colors"
            >
              {state.favicon ? (
                <>
                  <img src={state.favicon.src} className="w-4 h-4 rounded-sm object-cover" />
                  <span>변경</span>
                </>
              ) : (
                <span>업로드</span>
              )}
            </button>
            {state.favicon && (
              <button
                onClick={state.clearFavicon}
                className="text-xs text-[#666] hover:text-[#222] font-medium"
              >
                제거
              </button>
            )}
          </div>
          <input
            ref={faviconInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) state.handleFavicon(file)
            }}
          />
        </div>
      )}
    </div>
  )
}
