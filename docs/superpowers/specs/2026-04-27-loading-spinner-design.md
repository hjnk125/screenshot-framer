# Loading Spinner — Design Spec

**Date:** 2026-04-27  
**Scope:** Preview 영역 overlay spinner + Export 버튼 내 spinner

---

## 배경

모바일(및 데스크탑)에서 preview 렌더링과 PNG export 시 잠깐의 로딩 지연이 있음. 현재 UI에는 진행 상태 피드백이 없어 사용자가 앱이 멈춘 것처럼 느낄 수 있음.

---

## 목표

- preview canvas가 렌더링 중일 때 overlay spinner 표시 (모바일/데스크탑 동일)
- Export PNG 버튼이 export 중일 때 버튼 텍스트/아이콘 대신 spinner 표시
- 중복 클릭 방지 (export 중 버튼 disabled)

---

## 아키텍처

### 1. `useCompositor` — loading state 추가

`isRendering`, `isExporting` boolean state를 훅 내부에서 관리하고 반환.

```ts
// 반환 타입 추가
return { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting };
```

**`renderToCanvas` 변경:**
```ts
setIsRendering(true);
try {
  // 기존 로직 (loadFrameImage → drawComposite)
} finally {
  setIsRendering(false);
}
```

**`exportPng` 변경:**
```ts
setIsExporting(true);
// ... 기존 로직 ...
canvas.toBlob((blob) => {
  // ... download 처리 ...
  setIsExporting(false);
}, "image/png");
```

> `toBlob` 에러 케이스(blob이 null)에서도 `isExporting = false`가 되도록 처리.

---

### 2. `Spinner` 컴포넌트 — 신규 추가

`src/components/Spinner.tsx`로 분리하여 preview와 export 버튼 양쪽에서 재사용.

```tsx
// size prop으로 크기 조절 가능
export function Spinner({ size = 16 }: { size?: number }) { ... }
```

구현: CSS `border` 기반 원형 스피너, `animate-spin` 적용.  
색상: 검정(`border-ink/30`, active side `border-ink`) — 배경이 밝은 checkerboard와 accent 버튼 모두에서 가독성 확보.

---

### 3. `PreviewCanvas` — overlay spinner

`isRendering: boolean` prop 추가.

canvas가 있는 wrapper `div`에 `relative` 추가. `isRendering`이 true일 때 `absolute inset-0` overlay 표시:

```tsx
{isRendering && (
  <div className="absolute inset-0 flex items-center justify-center rounded-card-dense bg-black/10">
    <Spinner size={24} />
  </div>
)}
```

- 빈 상태(`!screenshot || !frame`)일 때는 overlay 불필요 — 해당 분기에는 canvas가 없으므로 `isRendering`이 올라올 일 없음
- 모바일(260px 영역)과 데스크탑(row-span-2 영역) 모두 동일한 `PreviewCanvas` 컴포넌트를 공유하므로 별도 처리 불필요

---

### 4. `ExportControls` — 버튼 내 spinner

`isExporting: boolean` prop 추가.

```tsx
<button
  onClick={onExport}
  disabled={disabled || isExporting}
  ...
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
```

- export 중 `disabled` 처리로 중복 클릭 방지
- 버튼 크기는 유지 (`py-[9px]`)되므로 layout shift 없음

---

### 5. `App.tsx` — prop 전달

`useCompositor` 반환값에서 `isRendering`, `isExporting` 받아서 각 컴포넌트에 전달:

```tsx
const { renderToCanvas, exportPng, getOutputSize, isRendering, isExporting } = useCompositor(...);

// PreviewCanvas (모바일/데스크탑 둘 다)
<PreviewCanvas ... isRendering={isRendering} />

// ExportControls
<ExportControls ... isExporting={isExporting} />
```

---

## 변경 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/hooks/useCompositor.ts` | 수정 — isRendering, isExporting state 추가 |
| `src/components/Spinner.tsx` | 신규 — 재사용 가능한 spinner 컴포넌트 |
| `src/components/PreviewCanvas.tsx` | 수정 — isRendering prop + overlay |
| `src/components/ExportControls.tsx` | 수정 — isExporting prop + 버튼 내 spinner |
| `src/App.tsx` | 수정 — prop 전달 |

---

## 테스트 고려사항

- `ExportControls.test.tsx`: `isExporting=true` 일 때 버튼에 spinner가 렌더되고 텍스트가 없는지 확인
- `PreviewCanvas.test.tsx`: `isRendering=true` 일 때 overlay가 렌더되는지 확인
- `useCompositor.ts`: 기존 테스트가 새 반환값과 호환되는지 확인
