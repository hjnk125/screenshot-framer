# 렌더링 파이프라인 — 품질 설계 원칙

## 전체 흐름

```
스크린샷(HTMLImageElement)
    │
    ▼
[offscreen canvas] ← 프레임 에셋 원본 크기로 생성
    │  drawScreenshot()  — imageSmoothingQuality: high
    │  drawDeviceBg()    — 디바이스 배경색/이미지 (screenArea 클리핑)
    │  drawImage(frameImg) — 프레임 오버레이 (1:1, 품질 손실 없음)
    │
    ▼
applyToMainCanvas(effectiveScale)
    │  stepDown()        — 2배씩 단계적 축소 (한 번에 >2:1 축소 방지)
    │  shadow canvas     — 그림자 레이어
    │
    ▼
최종 export canvas (PNG 다운로드)
```

---

## effectiveScale 계산

```
effectiveScale = clamp(naturalScale, minScale, 1.0)

naturalScale = screenshot.naturalWidth / screenArea.width
minScale     = minWidth / frameImg.naturalWidth
minWidth     = aspectRatio < 1 (세로형) ? 800 : 1500  (px)
```

### 왜 `screenArea.width`를 쓰는가

프레임 에셋 전체 폭(`frameImg.naturalWidth`)을 분모로 쓰면 베젤 영역이 scale에 영향을 준다.

예: MacBook Pro 16
- `frameImg.naturalWidth` = **4340px** (베젤 포함)
- `screenArea.width` = **3456px** (실제 화면 영역)

3456px 스크린샷 기준:
| 분모 | naturalScale | 출력 내 스크린샷 영역 |
|---|---|---|
| `frameImg.naturalWidth` (4340) | 0.796 | ~2751px ← 원본 대비 20% 손실 |
| `screenArea.width` (3456) | **1.0** | **3456px ← 1:1 완벽** |

### 왜 cap = 1.0인가

`naturalScale > 1.0` (스크린샷이 screenArea보다 넓은 경우) 이면 프레임 에셋을 원본보다 크게 업스케일해야 한다. 래스터 이미지를 업스케일하면 프레임 자체가 뭉개지므로 상한을 1.0으로 고정한다.

4000px 스크린샷 + MacBook 프레임(screenArea=3456):
→ `naturalScale = 4000/3456 = 1.157` → cap → `effectiveScale = 1.0`
→ 프레임 선명, 스크린샷은 cover 모드로 3456px에 맞춰 단일 패스 고품질 축소

### 최소 크기 보장

스크린샷이 매우 작을 때 출력물이 너무 작아지지 않도록 minScale로 하한 보정.

| 프레임 종류 | 최소 출력 폭 |
|---|---|
| 세로형 (iPhone 등, aspectRatio < 1) | 800px |
| 가로형 / 브라우저 | 1500px |

---

## Preview vs Export

| | Preview (`renderToCanvas`) | Export (`exportPng`) |
|---|---|---|
| scale | 항상 `1.0` | `effectiveScale` |
| 목적 | 프레임 원본 해상도로 선명한 미리보기 | 스크린샷 픽셀 기준 적절한 출력 크기 |

---

## 품질 설정 체크리스트

- `drawScreenshot` — `ctx.imageSmoothingQuality = "high"` ✓
- `applyToMainCanvas` — `ctx.imageSmoothingQuality = "high"` ✓
- `stepDown()` — 각 패스 `imageSmoothingQuality = "high"` ✓
- `drawDeviceBg` — 배경 이미지는 cover 스케일, screenArea 클리핑 ✓

## stepDown 동작 조건

`applyToMainCanvas`에서 offscreen → 출력 크기 비율이 2:1 초과일 때 동작.

```
4340px → 1500px (비율 2.89) → stepDown 2회:
  4340 → 2170 → 1500
```

비율 < 2:1이면 단일 패스 bilinear (충분한 품질).
