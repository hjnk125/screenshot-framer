# 대형 이미지 지원 — 설계 스펙

**날짜:** 2026-04-28
**상태:** 승인

---

## 문제

현재 업로드 제한은 4,000px입니다. Retina/HiDPI 화면이나 iMac 디스플레이를 사용하는 유저가 차단됩니다. 이 제한은 Canvas 메모리 문제를 방지하기 위해 추가되었지만, 현대 데스크톱 브라우저는 한 변 8,000px까지 안전하게 처리할 수 있습니다.

---

## 목표

1. 업로드 제한을 4,000px → 8,000px으로 상향
2. 가로형 프레임(Desktop/Browser) export 배율 캡을 프레임 원본 해상도의 2배까지 허용
3. 세로형 프레임(iPhone)은 1.0x 캡 유지 — 프레임 PNG 업스케일 시 품질 저하가 심하기 때문
4. export 결과물이 업로드 이미지보다 작을 경우, 리사이즈 안내 메시지 표시

---

## 범위 외

- 타일링 / 청크 캔버스 렌더링
- AI 업스케일링
- @2x 프레임 PNG 에셋 추가
- 4,000px 이하 이미지의 동작 변경

---

## 설계

### 1. 업로드 제한 — `useImageUpload.ts`

`MAX_DIMENSION`을 `4000` → `8000`으로 변경.

에러 메시지도 새 제한값에 맞게 영어로 수정:
```
Image too large. Maximum dimension is 8,000px. (Current: Wpx × Hpx)
```

---

### 2. Export 배율 캡 — `compositor.ts`

**현재 동작:**
```
effectiveScale = clamp(naturalScale, minScale, 1.0)
```

**변경 후:**
```
maxScale = frame.aspectRatio >= 1 ? 2.0 : 1.0
effectiveScale = clamp(naturalScale, minScale, maxScale)
```

| 프레임 타입 | 조건 | 최대 export 배율 |
|---|---|---|
| Desktop (MacBook, iMac) | `aspectRatio >= 1` | 프레임 원본 해상도의 2.0배 |
| Browser (Chrome, Safari) | 항상 가로형 | 프레임 원본 해상도의 2.0배 |
| Phone (iPhone) | `aspectRatio < 1` | 프레임 원본 해상도의 1.0배 (업스케일 없음) |

`computeEffectiveScale()`은 이미 모든 호출부에서 `frame` 객체를 받으므로, 시그니처 변경 없이 `maxScale` 변수 추가만으로 구현 가능.

---

### 3. 리사이즈 안내 메시지 — `ExportControls.tsx`

`screenshot.naturalWidth > outputSize.width`일 때(즉, export가 업로드 이미지보다 작을 때), 출력 크기 표시 아래에 안내 문구를 표시:

```
Resized to 2,560 × 1,664 px
(your image is larger than this frame supports)
```

- output 너비가 업로드 이미지 너비보다 작을 때만 표시
- `getOutputSize()`로 이미 계산된 실제 출력 크기를 사용
- 노란색 계열의 muted 스타일 — 에러가 아닌 안내
- 이미지 없음 / 출력이 업로드보다 크거나 같으면 숨김

`ExportControls`에 새 prop `uploadSize: { width: number; height: number } | null`을 추가. 부모(`App.tsx`)에서 `{ width: image.naturalWidth, height: image.naturalHeight }`를 전달.

---

### 4. UI 텍스트 — `UploadZone.tsx`

변경: `"PNG · JPG · max 4,000px"` → `"PNG · JPG · max 8,000px"`

---

## 데이터 흐름

```
useImageUpload (제한: 8,000px)
    ↓ image (HTMLImageElement)
App.tsx
    ↓ uploadSize = { width: image.naturalWidth, height: image.naturalHeight }
ExportControls
    ← outputSize (getOutputSize()로 계산)
    → uploadSize.width > outputSize.width 이면 리사이즈 안내 표시
compositor.ts: computeEffectiveScale()
    ↓ maxScale = aspectRatio >= 1 ? 2.0 : 1.0
    → clamp(naturalScale, minScale, maxScale)
```

---

## 변경 파일

| 파일 | 변경 내용 |
|---|---|
| `src/hooks/useImageUpload.ts` | `MAX_DIMENSION` 4000 → 8000, 에러 메시지 수정 |
| `src/utils/compositor.ts` | `computeEffectiveScale()` — 프레임 방향에 따른 `maxScale` 분기 |
| `src/components/ExportControls.tsx` | `uploadSize` prop 추가, 리사이즈 안내 UI |
| `src/App.tsx` | `uploadSize`를 `ExportControls`에 전달 |
| `src/components/UploadZone.tsx` | UI 텍스트 수정 |

---

## 엣지 케이스

- **이미지가 정확히 8,000px:** 허용, 정상 처리.
- **Desktop 프레임 + 8,000px 이미지:** `effectiveScale = min(naturalScale, 2.0)`. 최대 출력 ≈ 프레임 원본 너비의 2배.
- **Phone 프레임 + 8,000px 이미지:** `effectiveScale = 1.0` 유지. 리사이즈 안내 표시.
- **Phone 프레임 + 3,000px 이미지:** `naturalScale ≈ 2.5`, 1.0으로 캡. 리사이즈 안내 표시 — 기존에도 발생하던 상황이지만 UI에 노출되지 않았음.
- **Shadow ON:** 80px 패딩은 출력 크기 위에 별도 추가. 패딩 로직 변경 없음.
