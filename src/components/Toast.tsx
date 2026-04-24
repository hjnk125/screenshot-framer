type ToastProps = {
  message: string | null
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-card-dense border border-black/[0.07] bg-card px-5 py-3 text-[13px] text-ink shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
      <span>{message}</span>
      <button onClick={onClose} className="text-muted hover:text-ink text-lg leading-none font-bold transition-colors">
        ×
      </button>
    </div>
  )
}
