// src/components/AppStoreTextCard/AppStoreTextCard.tsx
import type { UseAppStoreTextReturn } from "../../hooks/useAppStoreText";
import type { Frame } from "../../types/frame";
import AppStoreTextControls from "./AppStoreTextControls";

type Props = {
  frame: Frame;
  state: UseAppStoreTextReturn;
};

// frame is reserved for future per-frame coordinate/style customization
export default function AppStoreTextCard({ frame: _frame, state }: Props) {
  return (
    <div className="shrink-0 rounded-card-dense border border-black/[0.07] bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
          Text
        </span>
      </div>
      <AppStoreTextControls state={state} />
    </div>
  );
}
