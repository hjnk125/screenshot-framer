type ToastProps = {
  message: string | null
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3 text-sm text-white shadow-xl">
      <span>{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white text-lg leading-none">
        ×
      </button>
    </div>
  )
}
