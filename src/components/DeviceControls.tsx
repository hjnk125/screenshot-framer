import { useRef } from "react";
import type { DeviceBgType } from "../types/frame";
import type { UseDeviceBgReturn } from "../hooks/useDeviceBg";

type DeviceControlsProps = {
  state: UseDeviceBgReturn;
  hideTransparent?: boolean;
};

const PRESETS: { type: DeviceBgType; label: string }[] = [
  { type: "transparent", label: "None" },
  { type: "white", label: "White" },
  { type: "black", label: "Black" },
];

const CHECKER =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23ccc'/%3E%3C/svg%3E\")";

export function DeviceControls({ state, hideTransparent = false }: DeviceControlsProps) {
  const { deviceBg, setType, handleImage, clearImage } = state;
  const presets = hideTransparent ? PRESETS.filter((p) => p.type !== "transparent") : PRESETS;
  const inputRef = useRef<HTMLInputElement>(null);

  const swatchBase =
    "h-7 w-7 shrink-0 rounded-[7px] border-2 transition-all cursor-pointer";
  const ring = "border-accent ring-2 ring-accent ring-offset-1 ring-offset-card";
  const noRing = "border-black/[0.10] hover:border-black/25";

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-2 block text-[11px] font-semibold text-soft">
          Background
        </label>

        <div className="flex items-center gap-2">
          {/* Preset swatches */}
          {presets.map(({ type, label }) => (
            <button
              key={type}
              title={label}
              aria-label={label}
              aria-pressed={deviceBg.type === type}
              onClick={() => setType(type)}
              className={`${swatchBase} ${deviceBg.type === type ? ring : noRing}`}
              style={
                type === "transparent"
                  ? { backgroundImage: CHECKER, backgroundSize: "8px 8px" }
                  : { backgroundColor: type === "white" ? "#ffffff" : "#000000" }
              }
            />
          ))}

          {/* Image upload swatch / thumbnail */}
          {deviceBg.type === "image" && deviceBg.image ? (
            <div className="flex items-center gap-2">
              <button
                title="Change image"
                onClick={() => inputRef.current?.click()}
                className={`${swatchBase} overflow-hidden ${ring}`}
              >
                <img
                  src={deviceBg.image.src}
                  className="h-full w-full object-cover"
                />
              </button>
              <button
                onClick={clearImage}
                className="text-[11.5px] font-medium text-muted transition-colors hover:text-ink"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              aria-label="Upload background image"
              onClick={() => {
                setType("image");
                inputRef.current?.click();
              }}
              className={`${swatchBase} flex items-center justify-center text-[13px] text-muted ${
                deviceBg.type === "image" ? ring : noRing
              } hover:border-black/25`}
            >
              +
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImage(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
