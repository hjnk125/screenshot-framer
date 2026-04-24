type ToastProps = {
  message: string | null
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-[#222] bg-white px-5 py-3 text-sm text-[#222] shadow-[4px_4px_0px_#222]">
      <span>{message}</span>
      <button onClick={onClose} className="text-[#666] hover:text-[#222] text-lg leading-none font-bold">
        ×
      </button>
    </div>
  )
}
