type ImageAdjustProps = {
  scale: number
  onScaleChange: (scale: number) => void
  onReset: () => void
}

export function ImageAdjust({ scale, onScaleChange, onReset }: ImageAdjustProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="w-10 text-xs font-medium text-[#222]">크기</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={scale}
          onChange={e => onScaleChange(Number(e.target.value))}
          className="flex-1 accent-lime-500"
        />
        <span className="w-10 text-right text-xs font-medium text-[#222]">{scale.toFixed(2)}x</span>
      </div>
      <p className="text-xs text-[#666]">미리보기 위에서 드래그해 위치를 조절할 수 있어요</p>
      <button
        onClick={onReset}
        className="text-xs font-medium text-[#222] border border-[#222] rounded px-2 py-0.5 hover:bg-[#222] hover:text-white transition-colors"
      >
        초기화
      </button>
    </div>
  )
}
