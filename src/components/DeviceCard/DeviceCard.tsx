import type { Frame } from "../../types/frame";
import type { UseDeviceBgReturn } from "../../hooks/useDeviceBg";
import { BackgroundColorControls } from "./DeviceControls";

type DeviceCardProps = {
  frame: Frame;
  state: UseDeviceBgReturn;
};

export function DeviceCard({ frame, state }: DeviceCardProps) {
  return (
    <div className="shrink-0 rounded-card-dense border border-black/[0.07] bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
          {frame.category === "appstore" ? "Background" : "Device"}
        </span>
      </div>
      <BackgroundColorControls state={state} hideTransparent={frame.category === "appstore"} />
    </div>
  );
}
