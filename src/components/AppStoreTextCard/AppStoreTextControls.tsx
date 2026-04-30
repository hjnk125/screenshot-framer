// src/components/AppStoreTextCard/AppStoreTextControls.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import type { UseAppStoreTextReturn } from "../../hooks/useAppStoreText";

type Props = {
  state: UseAppStoreTextReturn;
};

type ColorFieldProps = {
  label: string;
  value: string;
  color: string;
  onChangeValue: (v: string) => void;
  onChangeColor: (v: string) => void;
  placeholder?: string;
};

function ColorField({
  label,
  value,
  color,
  onChangeValue,
  onChangeColor,
  placeholder,
}: ColorFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const [hexInput, setHexInput] = useState(color.replace("#", ""));

  const [prevColor, setPrevColor] = useState(color);
  if (prevColor !== color) {
    setPrevColor(color);
    setHexInput(color.replace("#", ""));
  }

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
      onChangeColor(hex);
      setHexInput(hex.replace("#", ""));
    },
    [onChangeColor],
  );

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
      setHexInput(val);
      if (val.length === 6) onChangeColor(`#${val}`);
    },
    [onChangeColor],
  );

  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-soft">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-[10px] border border-black/[0.07] bg-card-inner px-3 py-1.5 text-[12px] font-medium text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="relative shrink-0">
          <button
            ref={swatchRef}
            title="Text color"
            aria-label="Text color"
            onClick={() => setPickerOpen((v) => !v)}
            className="h-7 w-7 rounded-[7px] border-2 border-black/[0.10] transition-all hover:border-black/25"
            style={{ backgroundColor: color }}
          />
          {pickerOpen && (
            <div
              ref={pickerRef}
              className="absolute right-0 top-full z-50 mt-2 rounded-[12px] border border-black/[0.08] bg-card p-3 shadow-lg"
              style={{ width: 200 }}
            >
              <HexColorPicker
                color={color}
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
                  placeholder="000000"
                  className="w-full bg-transparent text-[12px] font-medium uppercase text-ink outline-none"
                  spellCheck={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppStoreTextControls({ state }: Props) {
  return (
    <div className="space-y-3">
      <ColorField
        label="Title"
        value={state.title}
        color={state.titleColor}
        onChangeValue={state.setTitle}
        onChangeColor={state.setTitleColor}
        placeholder="Title"
      />
      <ColorField
        label="Description"
        value={state.description}
        color={state.descriptionColor}
        onChangeValue={state.setDescription}
        onChangeColor={state.setDescriptionColor}
        placeholder="Description"
      />
    </div>
  );
}
