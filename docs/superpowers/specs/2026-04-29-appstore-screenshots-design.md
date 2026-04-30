# App Store 스크린샷 기능 — 디자인 스펙

## 개요

앱스토어 제출용 스크린샷(6.7형, 1290×2796)을 생성하는 새 카테고리 추가.
기존 Device / Browser 탭에 더해 **App Store** 탭이 추가된다.

---

## 프레임 에셋

`/public/frames/appstore/` 디렉토리에 6개 PNG (1290×2796, RGBA):

| 파일 | 레이아웃 | rotation |
|---|---|---|
| appstore-67-full.png | 정면 전체 — 폰이 캔버스 대부분 차지 | 0° |
| appstore-67-offset.png | 정면 오프셋 — 폰이 아래쪽, 위에 여백 | 0° |
| appstore-67-tilt-a1.png | 기울어짐 A (우측) | -30° |
| appstore-67-tilt-a2.png | 기울어짐 A (좌측) | -30° |
| appstore-67-tilt-b1.png | 기울어짐 B (우측) | 30° |
| appstore-67-tilt-b2.png | 기울어짐 B (좌측) | 30° |

> c1/c2, d1/d2는 동일한 각도의 폰이 캔버스에 의해 크롭된 쌍이다.

---

## 타입 변경

### `FrameCategory`

```typescript
type FrameCategory = "device" | "browser" | "appstore";
```

### `ScreenArea` — `rotation` 필드 추가

```typescript
type ScreenArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  roundCorners: "TOP" | "BOTTOM" | "ALL";
  rotation?: number; // 도(degrees), 생략 시 0 — 기울어진 appstore 프레임에 사용
};
```

기존 device/browser 프레임은 `rotation` 없이 그대로 동작 (undefined = 0).

### `AppStoreMeta` (신규)

```typescript
type AppStoreMeta = {
  canvasWidth: number;   // 1242
  canvasHeight: number;  // 2688
};
```

### `Frame` — `appstoreMeta` 필드 추가

```typescript
type Frame = {
  // ... 기존 필드 유지
  appstoreMeta?: AppStoreMeta;
};
```

---

## frames.ts — 새 엔트리 (6개)

각 엔트리:
- `category: "appstore"`
- `appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 }`
- `screenArea`: 구현 시 픽셀 좌표 측정하여 하드코딩. rotation 필드 포함.
- `aspectRatio`: 1290 / 2796

> `noUpscale` 불필요. appstore 카테고리는 effectiveScale 계산 자체를 bypass하고 출력 캔버스를 항상 `appstoreMeta.canvasWidth × canvasHeight`로 고정한다.

---

## 렌더링 — Device와의 차이점

| 항목 | Device | AppStore |
|---|---|---|
| 캔버스 크기 | 프레임 에셋 크기 | **1242×2688 고정** |
| 배경 범위 | screenArea 내부 | **캔버스 전체** |
| effectiveScale | noUpscale 규칙 적용 | **항상 1.0** |
| 그림자 | 캔버스 확장 +80px | **캔버스 내부 (크기 불변)** |

| 스크린샷 clip | 직사각형 (radius 적용) | **rotation 있으면 캔버스 회전 후 clip** |

### AppStore 렌더링 순서

1. `fillRect(0, 0, 1290, 2796)` — 배경색 (DeviceBgConfig: transparent/white/black/image)
2. 스크린샷 렌더 — `rotation !== 0`이면 pivot 기준 canvas rotate 적용 후 clip & drawImage
3. 그림자 (enabled 시) — 프레임 바운드 기준, 캔버스 내부에 soft shadow 레이어
4. `drawImage(frameImg, 0, 0, 1242, 2688)` — 프레임 오버레이

### rotation이 있는 경우 스크린샷 렌더링

```
pivot = { x: screenArea.x + screenArea.width / 2,
          y: screenArea.y + screenArea.height / 2 }

ctx.save()
ctx.translate(pivot.x, pivot.y)
ctx.rotate(rotation * Math.PI / 180)
ctx.translate(-screenArea.width / 2, -screenArea.height / 2)
// roundedRect clip 적용
// drawImage(screenshot, ...) with user transform
ctx.restore()
```

---

## 배경 (Background)

`DeviceBgConfig` 타입 재사용 (None / White / Black / Image).

- Device: screenArea 클리핑 내부만 채움
- AppStore: 캔버스 전체 (`0, 0, 1242, 2688`) 채움

---

## 그림자

- Device/Browser: SHADOW_PADDING=80px 추가해 캔버스 확장
- AppStore: 캔버스 크기 고정 (1242×2688 유지 필수). 프레임 이미지를 `drawImage` 하기 전 `ctx.shadowBlur` / `ctx.shadowColor` / `ctx.shadowOffsetY` 설정 → 브라우저가 캔버스 경계 내에서 자동 클리핑하여 그림자 렌더링.

---

## UI — FramePicker

FramePicker에 "App Store" 탭 추가 (Device / Browser / App Store).

App Store 탭 선택 시:
- 사이드바: Background 컨트롤 표시 (DeviceControls 재사용)
- Browser 전용 컨트롤(URL/탭 타이틀/Favicon) 미표시

---

## Export

- 출력: 항상 1290×2796 PNG
- 파일명: `framed-{frame.id}.png` (기존 규칙 유지)
- effectiveScale: 1.0 고정 (noUpscale: true로 보장)
- 출력 크기 표시: `1290 × 2796 px`

---

## 범위 외 (이번 구현에서 제외)

- 텍스트(헤드카피/서브카피) — 추후 추가
- 6.7형 (iPhone 16 Pro Max 캔버스) — 추후 추가
- 5.5형 (iPhone 8 스타일) — 추후 추가
