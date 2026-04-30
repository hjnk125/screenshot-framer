import { useState } from "react";
import { HelpModal } from "./HelpModal";

export function HelpButton() {
  const [showHelp, setShowHelp] = useState(
    () => !localStorage.getItem("help-seen"),
  );

  const closeHelp = () => {
    localStorage.setItem("help-seen", "1");
    setShowHelp(false);
  };

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="fixed right-5 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[16px] font-extrabold text-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-colors hover:text-white"
        style={{ bottom: "max(20px, calc(20px + env(safe-area-inset-bottom)))" }}
        aria-label="Help"
      >
        ?
      </button>

      {showHelp && <HelpModal onClose={closeHelp} />}
    </>
  );
}
