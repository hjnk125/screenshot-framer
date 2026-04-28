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
Device (noUpscale: true, iPhone 등):
  effectiveScale = min(naturalScale, 1.0)

Device (noUpscale 없음, MacBook·iMac):
  effectiveScale = naturalScale  (상한 없음)

Browser:
  effectiveScale = naturalScale  (상한 없음)

naturalScale:
  Device  → screenshot.naturalWidth / screenArea.width
  Browser → screenshot.naturalWidth / frameImg.naturalWidth
```

### 왜 Device에서 `screenArea.width`를 쓰는가

프레임 에셋 전체 폭(`frameImg.naturalWidth`)을 분모로 쓰면 베젤 영역이 scale에 영향을 준다.

예: MacBook Pro 16
- `frameImg.naturalWidth` = **4340px** (베젤 포함)
- `screenArea.width` = **3456px** (실제 화면 영역)

3456px 스크린샷 기준:
| 분모 | naturalScale | 출력 내 스크린샷 영역 |
|---|---|---|
| `frameImg.naturalWidth` (4340) | 0.796 | ~2751px ← 원본 대비 20% 손실 |
| `screenArea.width` (3456) | **1.0** | **3456px ← 1:1 완벽** |

### noUpscale 프레임의 cap = 1.0

iPhone 등 `noUpscale: true` 프레임은 래스터 에셋을 업스케일하면 품질이 저하되므로 상한을 1.0으로 고정한다.

### Mac/Browser 프레임은 상한 없음

Mac·iMac·Browser 프레임은 @2x AVIF 에셋이 존재하거나 스크린샷 비례 출력이 유리하므로, naturalScale을 그대로 사용한다. 8,000px 스크린샷 + MacBook 프레임(screenArea=3456)이면 `effectiveScale ≈ 2.31`이 되어 프레임 에셋 너비의 약 2.3배로 export된다.

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
