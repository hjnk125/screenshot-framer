type ToastProps = {
  message: string | null;
  onClose: () => void;
};

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex items-center gap-3 rounded-card-dense border border-red-200 bg-red-50 px-5 py-3 text-[13px] text-red-600 shadow-[0_4px_24px_rgba(0,0,0,0.12)] sm:left-1/2 sm:right-auto sm:w-max sm:-translate-x-1/2">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-lg font-bold leading-none text-red-400 transition-colors hover:text-red-600"
      >
        ×
      </button>
    </div>
  );
}
