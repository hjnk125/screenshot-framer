type ImageAdjustProps = {
  scale: number
  onScaleChange: (scale: number) => void
  onReset: () => void
}

export function ImageAdjust({ scale, onScaleChange, onReset }: ImageAdjustProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="w-10 text-xs text-gray-400">크기</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={scale}
          onChange={e => onScaleChange(Number(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <span className="w-10 text-right text-xs text-gray-500">{scale.toFixed(2)}x</span>
      </div>
      <p className="text-xs text-gray-600">미리보기 위에서 드래그해 위치를 조절할 수 있어요</p>
      <button
        onClick={onReset}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        초기화
      </button>
    </div>
  )
}
