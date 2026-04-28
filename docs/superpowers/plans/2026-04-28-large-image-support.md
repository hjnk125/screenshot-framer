# 대형 이미지 지원 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**목표:** 이미지 업로드 제한을 4,000px → 8,000px으로 상향하고, 가로형 프레임의 export 배율 캡을 2.0x로 올리며, export 크기가 업로드 이미지보다 작을 때 리사이즈 안내 메시지를 표시한다.

**아키텍처:** 세 가지 독립적인 변경. (1) 업로드 제한 상수 변경 + UI 텍스트 수정, (2) `computeEffectiveScale`의 maxScale을 프레임 방향에 따라 분기, (3) 출력 크기가 업로드 이미지보다 작을 때 `ExportControls`에 리사이즈 안내 표시.

**기술 스택:** TypeScript, React 19, HTML Canvas 2D API, Tailwind CSS, Vitest

---

## 파일 맵

| 파일 | 변경 내용 |
|---|---|
| `src/hooks/useImageUpload.ts` | `MAX_DIMENSION` 4000 → 8000, 에러 메시지 |
| `src/components/UploadZone.tsx` | UI 텍스트 "max 4,000px" → "max 8,000px" |
| `src/utils/compositor.ts` | `computeEffectiveScale()` — aspectRatio 기반 maxScale 분기 |
| `src/components/ExportControls.tsx` | `uploadSize` prop 추가, 리사이즈 안내 UI |
| `src/App.tsx` | `uploadSize`를 `ExportControls`에 전달 |
| `src/test/ExportControls.test.tsx` | 리사이즈 안내 테스트 |
| `src/test/compositor.test.ts` | 새 배율 캡 동작 테스트 |

---

## Task 1: 업로드 제한 상향

**파일:**
- 수정: `src/hooks/useImageUpload.ts:3`
- 수정: `src/components/UploadZone.tsx:41`

- [ ] **Step 1: `useImageUpload.ts`에서 MAX_DIMENSION 및 에러 메시지 변경**

3번째 줄과 에러 메시지를 아래와 같이 변경:

```typescript
// src/hooks/useImageUpload.ts
const MAX_DIMENSION = 8000;
```

38–46번째 줄 (에러 메시지 포함 전체 블록):

```typescript
        img.onload = () => {
          if (
            img.naturalWidth > MAX_DIMENSION ||
            img.naturalHeight > MAX_DIMENSION
          ) {
            setError(
              `Image too large. Maximum dimension is 8,000px. (Current: ${img.naturalWidth}×${img.naturalHeight}px)`,
            );
            setImage(null);
            setFileInfo(null);
          } else {
```

- [ ] **Step 2: `UploadZone.tsx` 텍스트 변경**

41번째 줄:
```tsx
      <p className="mt-1 text-[10px] text-muted">PNG · JPG · max 8,000px</p>
```

- [ ] **Step 3: 커밋**

```bash
git add src/hooks/useImageUpload.ts src/components/UploadZone.tsx
git commit -m "feat: 이미지 업로드 제한 4,000px → 8,000px 상향"
```

---

## Task 2: Export 배율 캡 변경

**파일:**
- 수정: `src/utils/compositor.ts:43-55`

현재 `computeEffectiveScale`은 최대값을 `1`로 하드코딩:
```typescript
return Math.min(Math.max(naturalScale, minScale), 1);
```

가로형/브라우저 프레임은 2.0x, 세로형(폰) 프레임은 1.0x로 분기.

- [ ] **Step 1: `compositor.ts`의 `computeEffectiveScale` 수정**

43–55번째 줄을 아래로 교체:

```typescript
export function computeEffectiveScale(
  screenshot: HTMLImageElement,
  frame: Frame,
  frameImg: HTMLImageElement,
): number {
  const screenW = frame.browserMeta
    ? frameImg.naturalWidth
    : frame.screenArea.width;
  const naturalScale = screenshot.naturalWidth / screenW;
  const minWidth = frame.aspectRatio < 1 ? 800 : 1500;
  const minScale = minWidth / frameImg.naturalWidth;
  const maxScale = frame.aspectRatio < 1 ? 1.0 : 2.0;
  return Math.min(Math.max(naturalScale, minScale), maxScale);
}
```

- [ ] **Step 2: 기존 테스트 통과 확인**

```bash
npm test -- --run
```

예상 결과: 전체 테스트 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/utils/compositor.ts
git commit -m "feat: 가로형 프레임 export 배율 캡 1.0x → 2.0x 상향"
```

---

## Task 3: 배율 캡 동작 테스트 추가

**파일:**
- 수정: `src/test/compositor.test.ts` (없으면 새로 생성)

- [ ] **Step 1: 테스트 파일 존재 여부 확인**

```bash
ls src/test/
```

`compositor.test.ts`가 없으면 새로 생성. 있으면 기존 파일에 추가.

- [ ] **Step 2: `computeEffectiveScale` 테스트 작성**

`src/test/compositor.test.ts`에 추가:

```typescript
import { describe, it, expect } from "vitest";
import { computeEffectiveScale } from "../utils/compositor";
import type { Frame } from "../types/frame";

function makeScreenshot(w: number, h: number): HTMLImageElement {
  return { naturalWidth: w, naturalHeight: h } as HTMLImageElement;
}

function makeFrameImg(w: number, h: number): HTMLImageElement {
  return { naturalWidth: w, naturalHeight: h } as HTMLImageElement;
}

function makeFrame(overrides: Partial<Frame>): Frame {
  return {
    id: "test",
    label: "Test",
    category: "device",
    assetPath: "/test.png",
    screenArea: { x: 0, y: 0, width: 2560, height: 1664, radius: 0 },
    aspectRatio: 2560 / 1664, // 가로형
    ...overrides,
  } as Frame;
}

describe("computeEffectiveScale", () => {
  it("가로형 프레임: 스크린샷이 화면 영역보다 훨씬 클 때 2.0으로 캡", () => {
    // MacBook류 프레임: 화면 영역 2560px, 프레임 에셋 3200px
    const frame = makeFrame({ aspectRatio: 2560 / 1664 });
    const frameImg = makeFrameImg(3200, 2000);
    const screenshot = makeScreenshot(8000, 5000);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 8000/2560 = 3.125 → 2.0으로 캡
    expect(scale).toBeCloseTo(2.0);
  });

  it("가로형 프레임: 스크린샷이 작을 때 캡 없이 자연 배율 사용", () => {
    const frame = makeFrame({ aspectRatio: 2560 / 1664 });
    const frameImg = makeFrameImg(3200, 2000);
    const screenshot = makeScreenshot(2560, 1664);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 2560/2560 = 1.0
    expect(scale).toBeCloseTo(1.0);
  });

  it("세로형(폰) 프레임: 큰 스크린샷이어도 1.0으로 캡", () => {
    // iPhone류 프레임: 화면 영역 1206px, 프레임 에셋 1300px
    const frame = makeFrame({
      aspectRatio: 1206 / 2622, // 세로형
      screenArea: { x: 0, y: 0, width: 1206, height: 2622, radius: 0 },
    });
    const frameImg = makeFrameImg(1300, 2800);
    const screenshot = makeScreenshot(8000, 17000);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 8000/1206 ≈ 6.6 → 1.0으로 캡
    expect(scale).toBeCloseTo(1.0);
  });

  it("세로형 프레임: minScale 하한 적용 확인", () => {
    const frame = makeFrame({
      aspectRatio: 1206 / 2622,
      screenArea: { x: 0, y: 0, width: 1206, height: 2622, radius: 0 },
    });
    const frameImg = makeFrameImg(1300, 2800);
    const screenshot = makeScreenshot(100, 200); // 매우 작은 스크린샷
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 100/1206 ≈ 0.083 → minScale = 800/1300 ≈ 0.615 로 올라감
    const minScale = 800 / 1300;
    expect(scale).toBeCloseTo(minScale);
  });
});
```

- [ ] **Step 3: 테스트 실행**

```bash
npm test -- --run
```

예상 결과: 새 테스트 포함 전체 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/test/compositor.test.ts
git commit -m "test: computeEffectiveScale 배율 캡 동작 테스트 추가"
```

---

## Task 4: 리사이즈 안내 UI 추가

업로드 이미지보다 export 출력이 작을 때 아래 문구 표시:
```
Resized to 2,560 × 1,664 px
(your image is larger than this frame supports)
```

**판단 로직:** `screenshot.naturalWidth > outputSize.width`

**파일:**
- 수정: `src/components/ExportControls.tsx`
- 수정: `src/App.tsx`

- [ ] **Step 1: `ExportControls.tsx`에 `uploadSize` prop 추가 및 리사이즈 안내 UI 구현**

`ExportControls.tsx` 전체를 아래로 교체:

```tsx
import type { CanvasSize } from "../utils/compositor";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

type ExportControlsProps = {
  onExport: () => void;
  disabled: boolean;
  isExporting?: boolean;
  getOutputSize?: () => CanvasSize | null;
  uploadSize?: { width: number; height: number } | null;
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
  uploadSize,
}: ExportControlsProps) {
  const outputSize = getOutputSize?.() ?? null;
  const estimatedBytes = outputSize
    ? (outputSize.width * outputSize.height * 4) / 3
    : null;

  const isResized =
    outputSize !== null &&
    uploadSize != null &&
    uploadSize.width > outputSize.width;

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

      {isResized && outputSize && (
        <p className="text-center text-[10px] text-yellow-400/70">
          Resized to {outputSize.width.toLocaleString()} ×{" "}
          {outputSize.height.toLocaleString()} px
          <br />
          (your image is larger than this frame supports)
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `App.tsx`에서 `uploadSize` prop 전달**

`App.tsx`의 `<ExportControls` (~245번째 줄)에 prop 추가:

```tsx
<ExportControls
  onExport={exportPng}
  disabled={!image || !selectedFrame}
  isExporting={isExporting}
  getOutputSize={getOutputSize}
  uploadSize={image ? { width: image.naturalWidth, height: image.naturalHeight } : null}
/>
```

- [ ] **Step 3: 동작 확인**

```bash
npm run dev
```

확인 사항:
- 폰 프레임 + 출력보다 큰 이미지 → 노란색 리사이즈 안내 표시
- 노트북 프레임 + 출력보다 작은 이미지 → 안내 없음
- 이미지 없음 → 안내 없음

- [ ] **Step 4: 커밋**

```bash
git add src/components/ExportControls.tsx src/App.tsx
git commit -m "feat: export 크기가 원본보다 작을 때 리사이즈 안내 표시"
```

---

## Task 5: 리사이즈 안내 테스트 추가

**파일:**
- 수정: `src/test/ExportControls.test.tsx`

- [ ] **Step 1: 리사이즈 안내 테스트 추가**

`src/test/ExportControls.test.tsx`에 추가:

```tsx
  it("outputSize가 uploadSize보다 작으면 리사이즈 안내 표시", () => {
    render(
      <ExportControls
        onExport={() => {}}
        disabled={false}
        getOutputSize={() => ({ width: 1300, height: 2800 })}
        uploadSize={{ width: 8000, height: 17000 }}
      />,
    );
    expect(screen.getByText(/Resized to/i)).toBeInTheDocument();
    expect(screen.getByText(/1,300/)).toBeInTheDocument();
  });

  it("outputSize가 uploadSize와 같으면 리사이즈 안내 미표시", () => {
    render(
      <ExportControls
        onExport={() => {}}
        disabled={false}
        getOutputSize={() => ({ width: 2560, height: 1664 })}
        uploadSize={{ width: 2560, height: 1664 }}
      />,
    );
    expect(screen.queryByText(/Resized to/i)).not.toBeInTheDocument();
  });

  it("uploadSize 없으면 리사이즈 안내 미표시", () => {
    render(
      <ExportControls
        onExport={() => {}}
        disabled={false}
        getOutputSize={() => ({ width: 1300, height: 2800 })}
      />,
    );
    expect(screen.queryByText(/Resized to/i)).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: 전체 테스트 실행**

```bash
npm test -- --run
```

예상 결과: 전체 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/test/ExportControls.test.tsx
git commit -m "test: ExportControls 리사이즈 안내 표시 테스트 추가"
```

---

## 셀프 리뷰

- [x] **스펙 커버리지:**
  - 업로드 제한 4000 → 8000 ✓ (Task 1)
  - 가로형/브라우저 프레임 maxScale 2.0x ✓ (Task 2)
  - 세로형(폰) 프레임 maxScale 1.0x 유지 ✓ (Task 2)
  - 리사이즈 안내 메시지 UI ✓ (Task 4)
  - UI 텍스트 수정 ✓ (Task 1)

- [x] **플레이스홀더 없음:** 모든 스텝에 완전한 코드 포함.

- [x] **타입 일관성:**
  - `uploadSize: { width: number; height: number } | null` — Task 4, 5에서 동일하게 사용.
  - `computeEffectiveScale(screenshot, frame, frameImg)` 시그니처 변경 없음 — `useCompositor.ts:123` 및 `calculateOutputSize` 호출부와 호환.
