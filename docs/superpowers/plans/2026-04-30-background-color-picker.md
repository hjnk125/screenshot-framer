# Background 색상 피커 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Device / App Store Background 컨트롤에 커스텀 hex 색상 피커를 추가하고, 이미지 업로드 버튼 아이콘을 교체한다.

**Architecture:** `DeviceBgType`에 `"color"` 추가, `DeviceBgConfig`에 `color?` 필드 추가. `useDeviceBg`에 `setColor` 추가. `DeviceControls`에 스포이드 스와치 + `react-colorful` 팝오버 추가. compositor의 `drawDeviceBg` / `drawAppStoreBg` 모두 `"color"` 분기 추가.

**Tech Stack:** TypeScript, React, react-colorful, Canvas 2D API, Vitest

---

## 파일 구조

| 파일 | 변경 종류 | 내용 |
|---|---|---|
| `src/types/frame.ts` | Modify | `DeviceBgType`에 `"color"` 추가, `DeviceBgConfig`에 `color?` 추가 |
| `src/hooks/useDeviceBg.ts` | Modify | `setColor` 함수 추가, `UseDeviceBgReturn` 업데이트 |
| `src/components/DeviceControls.tsx` | Modify | 스포이드 스와치, `HexColorPicker` 팝오버, 이미지 버튼 아이콘 교체 |
| `src/utils/compositor.ts` | Modify | `drawDeviceBg` / `drawAppStoreBg`에 `"color"` 분기 추가 |
| `src/test/compositor.test.ts` | Modify | `"color"` 배경 렌더링 테스트 추가 |

---

## Task 1: 타입 + useDeviceBg

**Files:**
- Modify: `src/types/frame.ts`
- Modify: `src/hooks/useDeviceBg.ts`

- [ ] **Step 1: `DeviceBgType`에 `"color"` 추가, `DeviceBgConfig`에 `color?` 추가**

`src/types/frame.ts`에서:

```typescript
export type DeviceBgType = "transparent" | "white" | "black" | "color" | "image";

export type DeviceBgConfig = {
  type: DeviceBgType;
  color?: string; // hex, e.g. "#ff6b6b". type === "color" 일 때만 유효
  image: HTMLImageElement | null;
};
```

- [ ] **Step 2: `useDeviceBg`에 `setColor` 추가**

`src/hooks/useDeviceBg.ts` 전체를 아래로 교체:

```typescript
import { useCallback, useState } from "react";
import type { DeviceBgConfig, DeviceBgType } from "../types/frame";

export type UseDeviceBgReturn = {
  deviceBg: DeviceBgConfig;
  setType: (type: DeviceBgType) => void;
  setColor: (hex: string) => void;
  handleImage: (file: File) => void;
  clearImage: () => void;
};

const DEFAULT: DeviceBgConfig = { type: "transparent", image: null };

export function useDeviceBg(): UseDeviceBgReturn {
  const [deviceBg, setDeviceBg] = useState<DeviceBgConfig>(DEFAULT);

  const setType = useCallback((type: DeviceBgType) => {
    setDeviceBg((prev) => ({
      ...prev,
      type,
      image: type === "image" ? prev.image : null,
    }));
  }, []);

  const setColor = useCallback((hex: string) => {
    setDeviceBg({ type: "color", color: hex, image: null });
  }, []);

  const handleImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () => setDeviceBg({ type: "image", image: img });
      img.onerror = () => setDeviceBg(DEFAULT);
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => setDeviceBg(DEFAULT), []);

  return { deviceBg, setType, setColor, handleImage, clearImage };
}
```

- [ ] **Step 3: 타입 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 4: 기존 테스트 통과 확인**

```bash
npm run test
```

Expected: All pass

- [ ] **Step 5: 커밋**

```bash
git add src/types/frame.ts src/hooks/useDeviceBg.ts
git commit -m "feat: DeviceBgType에 color 추가, useDeviceBg에 setColor 추가"
```

---

## Task 2: compositor — "color" 분기 추가

**Files:**
- Modify: `src/utils/compositor.ts`
- Modify: `src/test/compositor.test.ts`

- [ ] **Step 1: compositor.test.ts에 실패 테스트 작성**

`src/test/compositor.test.ts` 맨 아래에 추가 (기존 import에 `DeviceBgConfig` 타입도 추가):

기존 import 줄을 아래로 교체:

```typescript
import { calculateCanvasSize, computeEffectiveScale, calculateOutputSize } from "../utils/compositor";
import type { Frame, ShadowConfig, DeviceBgConfig } from "../types/frame";
```

그리고 파일 맨 아래에 추가:

```typescript
describe("drawDeviceBg — color 타입", () => {
  it("DeviceBgConfig type='color'가 타입 오류 없이 생성된다", () => {
    const bg: DeviceBgConfig = { type: "color", color: "#ff6b6b", image: null };
    expect(bg.type).toBe("color");
    expect(bg.color).toBe("#ff6b6b");
  });

  it("DeviceBgConfig color 필드가 undefined여도 타입이 유효하다", () => {
    const bg: DeviceBgConfig = { type: "transparent", image: null };
    expect(bg.color).toBeUndefined();
  });
});
```

- [ ] **Step 2: 테스트 실행 — PASS 확인 (타입 테스트라 이미 pass)**

```bash
npm run test
```

Expected: All pass

- [ ] **Step 3: `drawDeviceBg`에 `"color"` 분기 추가**

`src/utils/compositor.ts`의 `drawDeviceBg` 함수에서 아래 부분을 찾아:

```typescript
  if (bg.type === "white" || bg.type === "black") {
    ctx.fillStyle = bg.type === "white" ? "#ffffff" : "#000000";
    ctx.fillRect(x, y, w, h);
  } else if (bg.type === "image" && bg.image) {
```

아래로 교체:

```typescript
  if (bg.type === "white" || bg.type === "black") {
    ctx.fillStyle = bg.type === "white" ? "#ffffff" : "#000000";
    ctx.fillRect(x, y, w, h);
  } else if (bg.type === "color" && bg.color) {
    ctx.fillStyle = bg.color;
    ctx.fillRect(x, y, w, h);
  } else if (bg.type === "image" && bg.image) {
```

- [ ] **Step 4: `drawAppStoreBg`에 `"color"` 분기 추가**

`src/utils/compositor.ts`의 `drawAppStoreBg` 함수에서 아래 부분을 찾아:

```typescript
  if (bg.type === "transparent") return;
  if (bg.type === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "image" && bg.image) {
```

아래로 교체:

```typescript
  if (bg.type === "transparent") return;
  if (bg.type === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "color" && bg.color) {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "image" && bg.image) {
```

- [ ] **Step 5: 컴파일 + 테스트 확인**

```bash
npx tsc --noEmit && npm run test
```

Expected: All pass

- [ ] **Step 6: 커밋**

```bash
git add src/utils/compositor.ts src/test/compositor.test.ts
git commit -m "feat: compositor drawDeviceBg / drawAppStoreBg에 color 배경 분기 추가"
```

---

## Task 3: DeviceControls — 스포이드 스와치 + 팝오버 + 이미지 아이콘

**Files:**
- Modify: `src/components/DeviceControls.tsx`

- [ ] **Step 1: react-colorful 설치**

```bash
npm install react-colorful
```

Expected: `package.json`에 `"react-colorful"` 추가됨

- [ ] **Step 2: `DeviceControls.tsx` 전체 교체**

`src/components/DeviceControls.tsx` 전체를 아래로 교체:

```tsx
import { useRef, useState, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import type { DeviceBgType } from "../types/frame";
import type { UseDeviceBgReturn } from "../hooks/useDeviceBg";
import { Icon } from "./Icon";

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
  const { deviceBg, setType, setColor, handleImage, clearImage } = state;
  const presets = hideTransparent ? PRESETS.filter((p) => p.type !== "transparent") : PRESETS;
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const [hexInput, setHexInput] = useState(
    deviceBg.type === "color" && deviceBg.color ? deviceBg.color.replace("#", "") : "ffffff"
  );

  // hex input을 deviceBg.color와 동기화
  useEffect(() => {
    if (deviceBg.type === "color" && deviceBg.color) {
      setHexInput(deviceBg.color.replace("#", ""));
    }
  }, [deviceBg]);

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

  const customColor =
    deviceBg.type === "color" && deviceBg.color ? deviceBg.color : "#ffffff";
  const isCustomActive = deviceBg.type === "color";

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
              style={isCustomActive ? { backgroundColor: customColor } : undefined}
            >
              {!isCustomActive && (
                <Icon name="sparkle" size={13} className="text-muted" />
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
                  onChange={setColor}
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
              className={`${swatchBase} flex items-center justify-center ${
                deviceBg.type === "image" ? ring : noRing
              } hover:border-black/25`}
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
```

- [ ] **Step 3: 개발 서버에서 육안 확인**

`npm run dev` 실행 후:
1. Device 프레임 선택 → Background 섹션에 스포이드 아이콘 스와치 확인
2. 스포이드 스와치 클릭 → 팝오버 (color wheel + hex 입력) 열림
3. 색상 변경 → 프리뷰 배경색 바뀜
4. 팝오버 외부 클릭 → 닫힘
5. 이미지 버튼이 이미지 아이콘으로 표시됨
6. App Store 프레임 선택 → None 스와치 없고, 같은 color 피커 동작

- [ ] **Step 4: 컴파일 + 테스트 확인**

```bash
npx tsc --noEmit && npm run test
```

Expected: All pass

- [ ] **Step 5: 커밋**

```bash
git add src/components/DeviceControls.tsx package.json package-lock.json
git commit -m "feat: Background 색상 피커 추가 — 스포이드 스와치, HexColorPicker 팝오버, 이미지 아이콘 교체"
```

---

## 완료 체크리스트

- [ ] `npx tsc --noEmit` — 에러 없음
- [ ] `npm run test` — All pass
- [ ] Device / App Store 모두 커스텀 색상 적용됨
- [ ] hex 6자리 입력 시 색상 반영됨
- [ ] color wheel 드래그 시 hex 입력란 동기화됨
- [ ] 팝오버 외부 클릭 시 닫힘
- [ ] Export PNG에 커스텀 색상 배경 반영됨
- [ ] 이미지 업로드 버튼이 이미지 아이콘으로 표시됨
