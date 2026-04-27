# Loading Spinner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preview canvas와 Export 버튼에 로딩 스피너를 추가해 렌더링/export 중 피드백을 제공한다.

**Architecture:** `useCompositor`에 `isRendering`, `isExporting` state를 추가하고, 재사용 가능한 `Spinner` 컴포넌트를 만들어 `PreviewCanvas`(overlay)와 `ExportControls`(버튼 내)에 적용한다. `App.tsx`에서 prop을 전달한다.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

| 파일 | 유형 | 역할 |
|------|------|------|
| `src/components/Spinner.tsx` | 신규 | 재사용 가능한 CSS 스피너 컴포넌트 |
| `src/hooks/useCompositor.ts` | 수정 | `isRendering`, `isExporting` state 추가 |
| `src/components/PreviewCanvas.tsx` | 수정 | `isRendering` prop + overlay 추가 |
| `src/components/ExportControls.tsx` | 수정 | `isExporting` prop + 버튼 내 스피너 |
| `src/App.tsx` | 수정 | 새 prop 전달 |
| `src/test/ExportControls.test.tsx` | 수정 | `isExporting` 관련 테스트 추가 |
| `src/test/PreviewCanvas.test.tsx` | 신규 | overlay 렌더 테스트 |

---

### Task 1: Spinner 컴포넌트 생성

**Files:**
- Create: `src/components/Spinner.tsx`
- Create: `src/test/Spinner.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/test/Spinner.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spinner } from "../components/Spinner";

describe("Spinner", () => {
  it("data-testid='spinner' 요소를 렌더링한다", () => {
    render(<Spinner />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("size prop이 width/height 스타일에 반영된다", () => {
    render(<Spinner size={24} />);
    const el = screen.getByTestId("spinner");
    expect(el).toHaveStyle({ width: "24px", height: "24px" });
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx vitest run src/test/Spinner.test.tsx
```
Expected: FAIL — "Cannot find module '../components/Spinner'"

- [ ] **Step 3: Spinner 컴포넌트 구현**

`src/components/Spinner.tsx`:
```tsx
type SpinnerProps = {
  size?: number;
};

export function Spinner({ size = 16 }: SpinnerProps) {
  return (
    <div
      data-testid="spinner"
      style={{ width: size, height: size }}
      className="animate-spin rounded-full border-2 border-ink/20 border-t-ink"
    />
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx vitest run src/test/Spinner.test.tsx
```
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/components/Spinner.tsx src/test/Spinner.test.tsx
git commit -m "feat: Spinner 컴포넌트 추가"
```

---

### Task 2: useCompositor에 loading state 추가

**Files:**
- Modify: `src/hooks/useCompositor.ts`

- [ ] **Step 1: `isRendering`, `isExporting` state 추가**

`src/hooks/useCompositor.ts` 상단 import에 `useState` 추가 (이미 있으면 그대로):
```ts
import { useCallback, useRef, useState } from "react";
```

`useCompositor` 함수 내부 — `frameImgCache` 선언 바로 아래에 추가:
```ts
const [isRendering, setIsRendering] = useState(false);
const [isExporting, setIsExporting] = useState(false);
```

- [ ] **Step 2: `renderToCanvas`에 loading state 적용**

기존 `renderToCanvas` 콜백 전체를 아래로 교체:
```ts
const renderToCanvas = useCallback(
  async (canvas: HTMLCanvasElement): Promise<void> => {
    if (!screenshot || !frame) return;
    setIsRendering(true);
    try {
      const active = resolveFrame(frame, screenshot);
      if (!active) return;
      const frameImg = await loadFrameImage(active.assetPath);
      drawComposite({
        canvas,
        screenshot,
        frameImg,
        frame: active,
        transform,
        shadow,
        scale: 1,
        browserState,
        defaultFavicon,
        deviceBg,
      });
    } finally {
      setIsRendering(false);
    }
  },
  [
    screenshot,
    frame,
    transform,
    shadow,
    browserState,
    defaultFavicon,
    deviceBg,
    loadFrameImage,
  ],
);
```

- [ ] **Step 3: `exportPng`에 loading state 적용**

기존 `exportPng` 콜백 전체를 아래로 교체:
```ts
const exportPng = useCallback(async (): Promise<void> => {
  if (!screenshot || !frame) return;
  setIsExporting(true);

  const active = resolveFrame(frame, screenshot);
  if (!active) {
    setIsExporting(false);
    return;
  }

  const canvas = document.createElement("canvas");
  const frameImg = await loadFrameImage(active.assetPath);
  const scale = computeEffectiveScale(screenshot, active, frameImg);
  drawComposite({
    canvas,
    screenshot,
    frameImg,
    frame: active,
    transform,
    shadow,
    scale,
    browserState,
    defaultFavicon,
    deviceBg,
  });

  canvas.toBlob((blob) => {
    if (!blob) {
      setIsExporting(false);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `framed-${frame.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  }, "image/png");
}, [
  screenshot,
  frame,
  transform,
  shadow,
  browserState,
  defaultFavicon,
  deviceBg,
  loadFrameImage,
]);
```

- [ ] **Step 4: 반환값에 `isRendering`, `isExporting` 추가**

기존:
```ts
return { renderToCanvas, exportPng, getOutputSize };
```
변경:
```ts
return { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting };
```

- [ ] **Step 5: 전체 테스트 실행 — 기존 테스트 깨지지 않는지 확인**

```bash
npx vitest run
```
Expected: 모든 기존 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add src/hooks/useCompositor.ts
git commit -m "feat: useCompositor에 isRendering, isExporting 상태 추가"
```

---

### Task 3: PreviewCanvas에 overlay spinner 추가

**Files:**
- Modify: `src/components/PreviewCanvas.tsx`
- Create: `src/test/PreviewCanvas.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/test/PreviewCanvas.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PreviewCanvas } from "../components/PreviewCanvas";

const mockImage = { src: "test.png" } as HTMLImageElement;
const mockFrame = { id: "frame-1" } as any;
const renderToCanvas = vi.fn().mockResolvedValue(undefined);

describe("PreviewCanvas", () => {
  it("screenshot와 frame이 없으면 안내 문구를 표시한다", () => {
    render(
      <PreviewCanvas
        screenshot={null}
        frame={null}
        onPan={() => {}}
        renderToCanvas={renderToCanvas}
        isRendering={false}
      />,
    );
    expect(
      screen.getByText(/select a frame and screenshot/i),
    ).toBeInTheDocument();
  });

  it("isRendering=true이면 spinner overlay를 표시한다", () => {
    render(
      <PreviewCanvas
        screenshot={mockImage}
        frame={mockFrame}
        onPan={() => {}}
        renderToCanvas={renderToCanvas}
        isRendering={true}
      />,
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("isRendering=false이면 spinner overlay를 표시하지 않는다", () => {
    render(
      <PreviewCanvas
        screenshot={mockImage}
        frame={mockFrame}
        onPan={() => {}}
        renderToCanvas={renderToCanvas}
        isRendering={false}
      />,
    );
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx vitest run src/test/PreviewCanvas.test.tsx
```
Expected: FAIL — "isRendering" prop 없어서 타입 에러 또는 spinner 없음

- [ ] **Step 3: PreviewCanvas 컴포넌트 수정**

`src/components/PreviewCanvas.tsx`:

`PreviewCanvasProps` 타입에 `isRendering` 추가:
```ts
type PreviewCanvasProps = {
  screenshot: HTMLImageElement | null;
  frame: Frame | null;
  onPan: (dx: number, dy: number) => void;
  renderToCanvas: (canvas: HTMLCanvasElement) => Promise<void>;
  isRendering: boolean;
};
```

함수 시그니처에 `isRendering` 추가:
```ts
export function PreviewCanvas({
  screenshot,
  frame,
  onPan,
  renderToCanvas,
  isRendering,
}: PreviewCanvasProps) {
```

파일 상단 import에 `Spinner` 추가:
```ts
import { Spinner } from "./Spinner";
```

canvas가 있는 반환 JSX(`return` 아래 `<div className="flex h-full ...">`) 전체를 아래로 교체:
```tsx
return (
  <div className="relative flex h-full items-center justify-center overflow-hidden rounded-card-dense border border-black/[0.07] bg-[url('/checkerboard.svg')] bg-repeat p-10">
    <canvas
      ref={canvasRef}
      className="max-h-full max-w-full cursor-grab touch-none object-contain active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
    {isRendering && (
      <div className="absolute inset-0 flex items-center justify-center rounded-card-dense bg-black/10">
        <Spinner size={24} />
      </div>
    )}
  </div>
);
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx vitest run src/test/PreviewCanvas.test.tsx
```
Expected: PASS (3 tests)

- [ ] **Step 5: 전체 테스트 실행 — 기존 테스트 깨지지 않는지 확인**

```bash
npx vitest run
```
Expected: 모든 테스트 PASS (App.tsx에서 isRendering prop 미전달로 타입 에러가 나면 Task 5 먼저 수행)

- [ ] **Step 6: 커밋**

```bash
git add src/components/PreviewCanvas.tsx src/test/PreviewCanvas.test.tsx
git commit -m "feat: PreviewCanvas에 isRendering overlay spinner 추가"
```

---

### Task 4: ExportControls에 버튼 내 spinner 추가

**Files:**
- Modify: `src/components/ExportControls.tsx`
- Modify: `src/test/ExportControls.test.tsx`

- [ ] **Step 1: 실패하는 테스트 추가**

`src/test/ExportControls.test.tsx`에 아래 테스트를 기존 `describe` 블록 내부에 추가 (기존 테스트는 그대로 유지):
```tsx
// describe 블록 내부에 추가 (spinner는 data-testid로 확인하므로 별도 import 불필요)
it("isExporting=true이면 버튼에 spinner가 표시되고 텍스트가 없다", () => {
  render(<ExportControls onExport={() => {}} disabled={false} isExporting={true} />);
  expect(screen.getByTestId("spinner")).toBeInTheDocument();
  expect(screen.queryByText(/export png/i)).not.toBeInTheDocument();
});

it("isExporting=true이면 버튼이 비활성화된다", () => {
  render(<ExportControls onExport={() => {}} disabled={false} isExporting={true} />);
  expect(screen.getByRole("button")).toBeDisabled();
});

it("isExporting=false이면 Export PNG 텍스트가 표시된다", () => {
  render(<ExportControls onExport={() => {}} disabled={false} isExporting={false} />);
  expect(screen.getByRole("button", { name: /export png/i })).toBeInTheDocument();
});
```

> 참고: 기존 테스트(`isExporting` prop 없이 렌더)는 기본값 `false`로 동작하므로 그대로 통과해야 함.

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx vitest run src/test/ExportControls.test.tsx
```
Expected: FAIL — 새로 추가한 3개 테스트 실패

- [ ] **Step 3: ExportControls 컴포넌트 수정**

`src/components/ExportControls.tsx` 전체를 아래로 교체:
```tsx
import type { CanvasSize } from "../utils/compositor";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

type ExportControlsProps = {
  onExport: () => void;
  disabled: boolean;
  isExporting?: boolean;
  getOutputSize?: () => CanvasSize | null;
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `~${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `~${Math.round(bytes / 1024)} KB`;
}

export function ExportControls({
  onExport,
  disabled,
  isExporting = false,
  getOutputSize,
}: ExportControlsProps) {
  const outputSize = getOutputSize?.() ?? null;
  const estimatedBytes = outputSize
    ? (outputSize.width * outputSize.height * 4) / 3
    : null;

  return (
    <div className="flex flex-col gap-2 rounded-card-dense bg-ink p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-white/60">
          Export
        </span>
      </div>

      <button
        onClick={onExport}
        disabled={disabled || isExporting}
        className="flex w-full items-center justify-center gap-[6px] rounded-[9px] bg-accent px-3 py-[9px] text-[12.5px] font-bold text-ink transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {isExporting ? (
          <Spinner size={13} />
        ) : (
          <>
            <Icon name="download" size={13} strokeWidth={2.2} />
            Export PNG
          </>
        )}
      </button>

      {outputSize && estimatedBytes !== null && (
        <p className="text-center font-mono text-[10px] text-white/30">
          {outputSize.width.toLocaleString()} ×{" "}
          {outputSize.height.toLocaleString()} px ∙{" "}
          {formatFileSize(estimatedBytes)}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx vitest run src/test/ExportControls.test.tsx
```
Expected: PASS (6 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/components/ExportControls.tsx src/test/ExportControls.test.tsx
git commit -m "feat: ExportControls 버튼에 isExporting spinner 추가"
```

---

### Task 5: App.tsx에 새 prop 연결

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: useCompositor 반환값에서 `isRendering`, `isExporting` 구조분해**

기존:
```ts
const { renderToCanvas, exportPng, getOutputSize } = useCompositor({
```
변경:
```ts
const { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting } = useCompositor({
```

- [ ] **Step 2: 모바일 PreviewCanvas에 `isRendering` 전달**

기존 (App.tsx 약 196번째 줄):
```tsx
{/* Mobile/tablet preview — between Frame and ImageAdjust */}
<div className="h-[260px] shrink-0 lg:hidden">
  <PreviewCanvas
    screenshot={image}
    frame={selectedFrame}
    onPan={pan}
    renderToCanvas={renderToCanvas}
  />
</div>
```
변경:
```tsx
{/* Mobile/tablet preview — between Frame and ImageAdjust */}
<div className="h-[260px] shrink-0 lg:hidden">
  <PreviewCanvas
    screenshot={image}
    frame={selectedFrame}
    onPan={pan}
    renderToCanvas={renderToCanvas}
    isRendering={isRendering}
  />
</div>
```

- [ ] **Step 3: 데스크탑 PreviewCanvas에 `isRendering` 전달**

기존 (App.tsx 약 224번째 줄):
```tsx
{/* Desktop-only preview */}
<div className="hidden lg:row-span-2 lg:block lg:min-h-0 lg:overflow-hidden">
  <PreviewCanvas
    screenshot={image}
    frame={selectedFrame}
    onPan={pan}
    renderToCanvas={renderToCanvas}
  />
</div>
```
변경:
```tsx
{/* Desktop-only preview */}
<div className="hidden lg:row-span-2 lg:block lg:min-h-0 lg:overflow-hidden">
  <PreviewCanvas
    screenshot={image}
    frame={selectedFrame}
    onPan={pan}
    renderToCanvas={renderToCanvas}
    isRendering={isRendering}
  />
</div>
```

- [ ] **Step 4: ExportControls에 `isExporting` 전달**

기존:
```tsx
<ExportControls
  onExport={exportPng}
  disabled={!image || !selectedFrame}
  getOutputSize={getOutputSize}
/>
```
변경:
```tsx
<ExportControls
  onExport={exportPng}
  disabled={!image || !selectedFrame}
  isExporting={isExporting}
  getOutputSize={getOutputSize}
/>
```

- [ ] **Step 5: 전체 테스트 실행 — 모든 테스트 통과 확인**

```bash
npx vitest run
```
Expected: 모든 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add src/App.tsx
git commit -m "feat: App.tsx에 isRendering, isExporting prop 연결"
```
