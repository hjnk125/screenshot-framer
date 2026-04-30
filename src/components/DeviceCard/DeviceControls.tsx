import { useRef, useState, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import type { DeviceBgType } from "../../types/frame";
import type { UseDeviceBgReturn } from "../../hooks/useDeviceBg";
import { Icon } from "../Icon";

type BackgroundColorControlsProps = {
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

export function BackgroundColorControls({ state, hideTransparent = false }: BackgroundColorControlsProps) {
  const { deviceBg, setType, setColor, handleImage, clearImage } = state;
  const presets = hideTransparent ? PRESETS.filter((p) => p.type !== "transparent") : PRESETS;
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const [hexInput, setHexInput] = useState(deviceBg.color?.replace("#", "") ?? "ffffff");

  // 팝오버 외부 클릭 시 닫힘
  useEffect(() => {
    if (!pickerOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        swatchRef.current &&
        !swatchRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [pickerOpen]);

  const handleColorChange = useCallback(
    (hex: string) => {
      setColor(hex);
      setHexInput(hex.replace("#", ""));
    },
    [setColor]
  );

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
      setHexInput(val);
      if (val.length === 6) {
        setColor(`#${val}`);
      }
    },
    [setColor]
  );

  const swatchBase =
    "h-7 w-7 shrink-0 rounded-[7px] border-2 transition-all cursor-pointer";
  const ring = "border-accent ring-2 ring-accent ring-offset-1 ring-offset-card";
  const noRing = "border-black/[0.10] hover:border-black/25";

  const customColor = deviceBg.color ?? "#ffffff";
  const hasCustomColor = !!deviceBg.color;
  const isCustomActive = deviceBg.type === "color";

  return (
    <div className="space-y-3">
      <div>
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

          {/* Custom color swatch (eyedropper) */}
          <div className="relative">
            <button
              ref={swatchRef}
              title="Custom color"
              aria-label="Custom color"
              aria-pressed={isCustomActive}
              onClick={() => {
                if (!isCustomActive) setColor(customColor);
                setPickerOpen((v) => !v);
              }}
              className={`${swatchBase} flex items-center justify-center overflow-hidden ${
                isCustomActive ? ring : noRing
              }`}
              style={hasCustomColor ? { backgroundColor: customColor } : undefined}
            >
              {!hasCustomColor && (
                <Icon name="eyedropper" size={13} className="text-muted" />
              )}
            </button>

            {/* Color picker popover */}
            {pickerOpen && (
              <div
                ref={pickerRef}
                className="absolute left-0 top-full z-50 mt-2 rounded-[12px] border border-black/[0.08] bg-card p-3 shadow-lg"
                style={{ width: 200 }}
              >
                <HexColorPicker
                  color={customColor}
                  onChange={handleColorChange}
                  style={{ width: "100%", height: 140 }}
                />
                <div className="mt-2 flex items-center gap-1.5 rounded-[8px] border border-black/[0.08] bg-card-inner px-2 py-1.5">
                  <span className="text-[11px] font-medium text-muted">#</span>
                  <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexInput}
                    maxLength={6}
                    placeholder="ffffff"
                    className="w-full bg-transparent text-[12px] font-medium uppercase text-ink outline-none"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image upload swatch */}
          {deviceBg.image ? (
            <div className="flex items-center gap-2">
              <button
                title={deviceBg.type === "image" ? "Change image" : "Restore image"}
                onClick={() => {
                  setType("image");
                  if (deviceBg.type === "image") inputRef.current?.click();
                }}
                className={`${swatchBase} overflow-hidden ${
                  deviceBg.type === "image" ? ring : noRing
                }`}
              >
                <img
                  src={deviceBg.image.src}
                  className="h-full w-full object-cover"
                />
              </button>
              {deviceBg.type === "image" && (
                <button
                  onClick={clearImage}
                  className="text-[11.5px] font-medium text-muted transition-colors hover:text-ink"
                >
                  Remove
                </button>
              )}
            </div>
          ) : (
            <button
              aria-label="Upload background image"
              onClick={() => {
                setType("image");
                inputRef.current?.click();
              }}
              className={`${swatchBase} flex items-center justify-center ${noRing} hover:border-black/25`}
            >
              <Icon name="image" size={13} className="text-muted" />
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
