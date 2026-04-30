type HelpModalProps = {
  onClose: () => void;
};

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        style={{ animation: "fade-in 0.15s ease-out both" }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-card-dense bg-ink p-6 text-white shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        style={{ animation: "modal-in 0.2s ease-out both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-white/50">
            Screenshot Framer
          </span>
          <button
            onClick={onClose}
            className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-[16px] leading-none text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Privacy notice */}
        <div className="mb-5 rounded-[10px] bg-accent/15 px-4 py-3">
          <p className="text-[13px] font-semibold leading-snug text-accent">
            Your images are never uploaded to any server. Everything runs locally in your browser.
          </p>
        </div>

        {/* How to use */}
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">
          How to use
        </h2>
        <ol className="mb-6 flex flex-col gap-[10px]">
          {[
            "Upload a screenshot (PNG or JPG, up to 8,000 px)",
            "Pick a device or browser frame",
            "Adjust scale, pan, and shadow as needed",
            "Hit Export PNG to save",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] text-white/50">
                {i + 1}
              </span>
              <span className="text-[13px] leading-snug text-white/80">{step}</span>
            </li>
          ))}
        </ol>

        {/* Copyright */}
        <p className="text-center font-mono text-[10px] text-white/25">
          © {new Date().getFullYear()} Screenshot Framer
        </p>
      </div>
    </div>
  );
}
