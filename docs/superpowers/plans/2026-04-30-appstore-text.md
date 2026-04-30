# App Store 텍스트 추가 기능 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App Store 프레임 선택 시 Title / Description 텍스트를 캔버스에 렌더링하고, 각각 색상 피커로 색상을 변경할 수 있는 UI를 추가한다.

**Architecture:** `AppStoreMeta.textConfig`에 프레임별 텍스트 위치·정렬을 정의하고, `useAppStoreText` 훅으로 상태를 관리하며, `drawAppStoreComposite`에서 텍스트 레이어를 마지막 단계로 렌더링한다. UI는 BrowserCard/BrowserControls 패턴을 그대로 따르는 `AppStoreTextCard`로 분리한다.

**Tech Stack:** React, TypeScript, Vitest, react-colorful (HexColorPicker), HTML Canvas 2D API

---

## 파일 맵

| 파일 | 작업 |
|---|---|
| `src/types/frame.ts` | `AppStoreMeta`에 `textConfig` 추가, `AppStoreTextState` 타입 추가 |
| `src/data/frames.ts` | 6개 appstore 프레임에 `textConfig` 좌표 추가 |
| `src/test/frames.test.ts` | appstore `textConfig` 검증 테스트 추가 |
| `src/hooks/useAppStoreText.ts` | 신규 훅 — title/description 상태 관리 |
| `src/utils/compositor.ts` | `DrawCompositeParams`에 `appStoreText` 추가, `drawAppStoreComposite`에 텍스트 렌더링 추가 |
| `src/hooks/useCompositor.ts` | `CompositorParams`에 `appStoreText` 추가, `drawComposite` 호출 시 전달 |
| `src/components/AppStoreTextCard/AppStoreTextCard.tsx` | 신규 — wrapper 카드 컴포넌트 |
| `src/components/AppStoreTextCard/AppStoreTextControls.tsx` | 신규 — Title/Description input + 색상 피커 |
| `src/App.tsx` | `useAppStoreText` 훅 추가, `AppStoreTextCard` 조건부 렌더, `useCompositor`에 전달 |

---

## Task 1: types/frame.ts — textConfig 타입 추가

**Files:**
- Modify: `src/types/frame.ts`

- [ ] **Step 1: `AppStoreMeta`에 `textConfig` 추가, `AppStoreTextState` 타입 추가**

```ts
// src/types/frame.ts — AppStoreMeta 교체
export type AppStoreMeta = {
  canvasWidth: number;
  canvasHeight: number;
  textConfig?: {
    x: number;       // left/right 정렬 기준점 x. center는 canvasWidth/2 사용
    y: number;       // title top y (px)
    align: "left" | "center" | "right";
  };
};

// 파일 맨 아래 추가
export type AppStoreTextState = {
  title: string;
  titleColor: string;        // hex, e.g. "#000000"
  description: string;
  descriptionColor: string;  // hex, e.g. "#000000"
};
```

- [ ] **Step 2: 빌드 확인**

```bash
cd /Users/gentlemonster/Desktop/screenshot-framer && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/types/frame.ts
git commit -m "feat: AppStoreMeta에 textConfig 추가, AppStoreTextState 타입 정의"
```

---

## Task 2: data/frames.ts — appstore 프레임 textConfig 추가

**Files:**
- Modify: `src/data/frames.ts`
- Modify: `src/test/frames.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/test/frames.test.ts`의 `"App Store 프레임"` describe 블록 안에 추가:

```ts
it("모든 appstore 프레임에 textConfig가 정의되어 있다", () => {
  appstoreFrames.forEach((f) => {
    expect(f.appstoreMeta?.textConfig).toBeDefined();
    expect(f.appstoreMeta?.textConfig?.align).toMatch(/^(left|center|right)$/);
    expect(typeof f.appstoreMeta?.textConfig?.y).toBe("number");
  });
});

it("appstore 프레임 textConfig 정렬이 올바르다", () => {
  const expected: Record<string, "left" | "center" | "right"> = {
    "appstore-67-full": "center",
    "appstore-67-offset": "center",
    "appstore-67-tilt-a1": "left",
    "appstore-67-tilt-a2": "right",
    "appstore-67-tilt-b1": "left",
    "appstore-67-tilt-b2": "right",
  };
  appstoreFrames.forEach((f) => {
    expect(f.appstoreMeta?.textConfig?.align).toBe(expected[f.id]);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd /Users/gentlemonster/Desktop/screenshot-framer && npx vitest run src/test/frames.test.ts
```

Expected: FAIL — "textConfig가 정의되어 있다" 실패

- [ ] **Step 3: frames.ts에 textConfig 추가**

`src/data/frames.ts`에서 각 appstore 프레임의 `appstoreMeta`를 아래와 같이 교체:

```ts
// appstore-67-full
appstoreMeta: {
  canvasWidth: 1290,
  canvasHeight: 2796,
  textConfig: { x: 645, y: 192, align: "center" },
},

// appstore-67-offset
appstoreMeta: {
  canvasWidth: 1290,
  canvasHeight: 2796,
  textConfig: { x: 645, y: 311, align: "center" },
},

// appstore-67-tilt-a1
appstoreMeta: {
  canvasWidth: 1290,
  canvasHeight: 2796,
  textConfig: { x: 108, y: 2349, align: "left" },
},

// appstore-67-tilt-a2
appstoreMeta: {
  canvasWidth: 1290,
  canvasHeight: 2796,
  textConfig: { x: 1182, y: 180, align: "right" },
},

// appstore-67-tilt-b1
appstoreMeta: {
  canvasWidth: 1290,
  canvasHeight: 2796,
  textConfig: { x: 108, y: 180, align: "left" },
},

// appstore-67-tilt-b2
appstoreMeta: {
  canvasWidth: 1290,
  canvasHeight: 2796,
  textConfig: { x: 1182, y: 2349, align: "right" },
},
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx vitest run src/test/frames.test.ts
```

Expected: PASS (기존 테스트 포함 전체 통과)

- [ ] **Step 5: 커밋**

```bash
git add src/data/frames.ts src/test/frames.test.ts
git commit -m "feat: appstore 프레임에 textConfig 좌표 추가"
```

---

## Task 3: useAppStoreText 훅 생성

**Files:**
- Create: `src/hooks/useAppStoreText.ts`

- [ ] **Step 1: 훅 생성**

```ts
// src/hooks/useAppStoreText.ts
import { useState } from "react";
import type { AppStoreTextState } from "../types/frame";

export type UseAppStoreTextReturn = AppStoreTextState & {
  setTitle: (v: string) => void;
  setTitleColor: (v: string) => void;
  setDescription: (v: string) => void;
  setDescriptionColor: (v: string) => void;
};

export function useAppStoreText(): UseAppStoreTextReturn {
  const [title, setTitle] = useState("");
  const [titleColor, setTitleColor] = useState("#000000");
  const [description, setDescription] = useState("");
  const [descriptionColor, setDescriptionColor] = useState("#000000");

  return {
    title,
    setTitle,
    titleColor,
    setTitleColor,
    description,
    setDescription,
    descriptionColor,
    setDescriptionColor,
  };
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/hooks/useAppStoreText.ts
git commit -m "feat: useAppStoreText 훅 추가"
```

---

## Task 4: compositor.ts — 텍스트 렌더링 추가

**Files:**
- Modify: `src/utils/compositor.ts`

- [ ] **Step 1: `DrawCompositeParams`에 `appStoreText` 추가**

`src/utils/compositor.ts`에서 `DrawCompositeParams` 타입에 필드 추가:

```ts
export type DrawCompositeParams = {
  canvas: HTMLCanvasElement;
  screenshot: HTMLImageElement;
  frameImg: HTMLImageElement;
  frame: Frame;
  transform: ImageTransform;
  shadow: ShadowConfig;
  scale: number;
  browserState?: BrowserState;
  defaultFavicon?: HTMLImageElement | null;
  background?: BackgroundConfig;
  appStoreText?: AppStoreTextState;  // ← 추가
};
```

`AppStoreTextState` import도 추가:

```ts
import type {
  Frame,
  ShadowConfig,
  ImageTransform,
  ExportScale,
  BrowserState,
  ScreenArea,
  BackgroundConfig,
  AppStoreTextState,  // ← 추가
} from "../types/frame";
```

- [ ] **Step 2: `drawAppStoreComposite`에 텍스트 렌더링 추가**

`drawAppStoreComposite` 함수 시그니처에서 `appStoreText`를 구조분해하고, step 4 (프레임 오버레이) 이후에 텍스트 레이어 추가:

```ts
function drawAppStoreComposite(params: DrawCompositeParams): void {
  const { canvas, screenshot, frameImg, frame, transform, shadow, background, appStoreText } = params;
  // ... 기존 코드 ...

  // 4. Frame overlay at 1:1 (same size as canvas)
  ctx.drawImage(frameImg, 0, 0, w, h);

  // 5. Text overlay — title + description
  const { textConfig } = appstoreMeta;
  if (textConfig && appStoreText) {
    const { x, y, align } = textConfig;
    ctx.save();
    ctx.textBaseline = "top";

    const textX =
      align === "center" ? w / 2 : x;
    ctx.textAlign = align;

    if (appStoreText.title) {
      ctx.font = "600 92px 'Pretendard', sans-serif";
      ctx.fillStyle = appStoreText.titleColor;
      ctx.fillText(appStoreText.title, textX, y);
    }

    if (appStoreText.description) {
      const descY = y + Math.round(92 * 1.2) + 24;
      ctx.font = "500 56px 'Pretendard', sans-serif";
      ctx.fillStyle = appStoreText.descriptionColor;
      ctx.fillText(appStoreText.description, textX, descY);
    }

    ctx.restore();
  }
}
```

- [ ] **Step 3: 빌드 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 4: 기존 테스트 통과 확인**

```bash
npx vitest run src/test/compositor.test.ts
```

Expected: PASS (기존 테스트 모두 통과)

- [ ] **Step 5: 커밋**

```bash
git add src/utils/compositor.ts
git commit -m "feat: drawAppStoreComposite에 텍스트 레이어 추가"
```

---

## Task 5: useCompositor + App.tsx 연결

**Files:**
- Modify: `src/hooks/useCompositor.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: useCompositor에 appStoreText 추가**

`src/hooks/useCompositor.ts`의 `CompositorParams` 타입에 추가:

```ts
import type {
  Frame,
  ShadowConfig,
  ImageTransform,
  BrowserState,
  BackgroundConfig,
  AppStoreTextState,  // ← 추가
} from "../types/frame";

export type CompositorParams = {
  screenshot: HTMLImageElement | null;
  frame: Frame | null;
  transform: ImageTransform;
  shadow: ShadowConfig;
  browserState?: BrowserState;
  defaultFavicon?: HTMLImageElement | null;
  background?: BackgroundConfig;
  appStoreText?: AppStoreTextState;  // ← 추가
};
```

`useCompositor` 함수 파라미터 구조분해에 `appStoreText` 추가:

```ts
export function useCompositor({
  screenshot,
  frame,
  transform,
  shadow,
  browserState,
  defaultFavicon,
  background,
  appStoreText,  // ← 추가
}: CompositorParams) {
```

`renderToCanvas`와 `exportPng` 내부의 `drawComposite` 호출 양쪽에 `appStoreText` 전달:

```ts
drawComposite({
  canvas,
  screenshot,
  frameImg,
  frame: scaledFrame,
  transform,
  shadow,
  scale: 1,
  browserState,
  defaultFavicon,
  background,
  appStoreText,  // ← 추가
});
```

`renderToCanvas`와 `exportPng`의 의존성 배열에도 `appStoreText` 추가.

- [ ] **Step 2: App.tsx 업데이트**

`src/App.tsx`에서 `useAppStoreText` import 추가:

```ts
import { useAppStoreText } from "./hooks/useAppStoreText";
import AppStoreTextCard from "./components/AppStoreTextCard/AppStoreTextCard";
```

`App()` 함수 안에 훅 추가 (기존 훅들 아래):

```ts
const appStoreText = useAppStoreText();
const isAppStore = selectedFrame?.category === "appstore";
```

`useCompositor` 호출에 `appStoreText` 전달:

```ts
const { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting } =
  useCompositor({
    screenshot: image,
    frame: selectedFrame,
    transform,
    shadow,
    browserState: isBrowser ? browserState : undefined,
    defaultFavicon: isBrowser ? defaultFavicon : null,
    background: !isBrowser ? background.background : undefined,
    appStoreText: isAppStore ? appStoreText : undefined,  // ← 추가
  });
```

사이드바에서 BackgroundCard 아래에 `AppStoreTextCard` 조건부 렌더 추가:

```tsx
{/* 4b. Device/AppStore controls — conditional */}
{!isBrowser && selectedFrame && (
  <BackgroundCard frame={selectedFrame} state={background} />
)}

{/* 4c. App Store text controls — conditional */}
{isAppStore && selectedFrame && (
  <AppStoreTextCard frame={selectedFrame} state={appStoreText} />
)}
```

- [ ] **Step 3: 빌드 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음 (AppStoreTextCard 파일은 다음 Task에서 생성 — 이 단계에서는 import 추가를 Task 6 이후로 미뤄도 됨)

> Note: App.tsx import를 Task 6 이후에 추가해도 됨.

- [ ] **Step 4: 커밋**

```bash
git add src/hooks/useCompositor.ts
git commit -m "feat: useCompositor에 appStoreText 파라미터 전달"
```

---

## Task 6: AppStoreTextCard + AppStoreTextControls 컴포넌트 생성

**Files:**
- Create: `src/components/AppStoreTextCard/AppStoreTextCard.tsx`
- Create: `src/components/AppStoreTextCard/AppStoreTextControls.tsx`
- Modify: `src/App.tsx` (import 추가)

- [ ] **Step 1: AppStoreTextControls 생성**

```tsx
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
```

- [ ] **Step 2: AppStoreTextCard 생성**

```tsx
// src/components/AppStoreTextCard/AppStoreTextCard.tsx
import type { UseAppStoreTextReturn } from "../../hooks/useAppStoreText";
import type { Frame } from "../../types/frame";
import AppStoreTextControls from "./AppStoreTextControls";

type Props = {
  frame: Frame;
  state: UseAppStoreTextReturn;
};

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
```

- [ ] **Step 3: App.tsx import 추가**

`src/App.tsx` 상단 import에 추가:

```ts
import { useAppStoreText } from "./hooks/useAppStoreText";
import AppStoreTextCard from "./components/AppStoreTextCard/AppStoreTextCard";
```

App.tsx 함수 내부에 추가 (기존 `const background = useBackground();` 아래):

```ts
const appStoreText = useAppStoreText();
const isAppStore = selectedFrame?.category === "appstore";
```

`useCompositor` 호출 수정:

```ts
const { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting } =
  useCompositor({
    screenshot: image,
    frame: selectedFrame,
    transform,
    shadow,
    browserState: isBrowser ? browserState : undefined,
    defaultFavicon: isBrowser ? defaultFavicon : null,
    background: !isBrowser ? background.background : undefined,
    appStoreText: isAppStore ? appStoreText : undefined,
  });
```

사이드바에 `AppStoreTextCard` 추가 (BackgroundCard 조건문 아래):

```tsx
{/* 4c. App Store text controls */}
{isAppStore && selectedFrame && (
  <AppStoreTextCard frame={selectedFrame} state={appStoreText} />
)}
```

- [ ] **Step 4: 빌드 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 5: 전체 테스트 통과 확인**

```bash
npx vitest run
```

Expected: 전체 PASS

- [ ] **Step 6: 커밋**

```bash
git add src/components/AppStoreTextCard/AppStoreTextCard.tsx \
        src/components/AppStoreTextCard/AppStoreTextControls.tsx \
        src/hooks/useAppStoreText.ts \
        src/App.tsx
git commit -m "feat: AppStoreTextCard 컴포넌트 및 App.tsx 연결"
```

---

## 자체 검토

**스펙 커버리지:**
- [x] Title / Description 각각 input — Task 6 (AppStoreTextControls)
- [x] 각각 독립 색상 피커 — Task 6 (ColorField)
- [x] 기본색 #000000 — Task 3 (useAppStoreText)
- [x] 프레임별 textConfig (align, x, y) — Task 1, 2
- [x] drawAppStoreComposite 텍스트 레이어 — Task 4
- [x] App.tsx 연결 — Task 5, 6
- [x] 빈 값이면 렌더링 생략 — Task 4 (`if (appStoreText.title)` 조건)

**타입 일관성:**
- `AppStoreTextState` — Task 1에서 정의, Task 3·4·5에서 참조
- `UseAppStoreTextReturn` — Task 3에서 정의, Task 5·6에서 참조
- `appStoreText` 파라미터명 — DrawCompositeParams·CompositorParams·App.tsx 모두 동일
