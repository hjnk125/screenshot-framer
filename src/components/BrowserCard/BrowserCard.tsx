import type { Frame } from "../../types/frame";
import type { UseBrowserStateReturn } from "../../hooks/useBrowserState";
import BrowserControls from "./BrowserControls";

type BrowserCardProps = {
  frame: Frame;
  state: UseBrowserStateReturn;
};

export default function BrowserCard({ frame, state }: BrowserCardProps) {
  return (
    <div className="shrink-0 rounded-card-dense border border-black/[0.07] bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
          Browser
        </span>
      </div>
      <BrowserControls frame={frame} state={state} />
    </div>
  );
}
