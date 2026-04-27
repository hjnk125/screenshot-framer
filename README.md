# Screenshot Framer

스크린샷을 디바이스 또는 브라우저 프레임으로 감싸 고품질 PNG로 export하는 웹 앱.  
A web app that wraps screenshots in device or browser frames and exports them as high-quality PNGs.

## 기능 / Features

- **디바이스 프레임 / Device frames** — MacBook Air/Pro, MacBook Neo, iMac 24, iPhone 15/16/17/Air
- **브라우저 프레임 / Browser frames** — Chrome (light/dark), Safari Big Sur/Catalina (light/dark)
- **이미지 조정 / Image adjustment** — 스케일, 패닝, 디바이스 배경색/이미지 / Scale, pan, device background color or image
- **브라우저 커스텀 / Browser customization** — URL, 탭 타이틀, Favicon 업로드 / URL, tab title, favicon upload
- **Shadow** — 불투명도 조절, 비활성 시 여백 없이 export / Opacity control, no padding when disabled
- **고품질 렌더링 / High-quality rendering** — 단계적 다운스케일링으로 bilinear 열화 방지 / Step-wise downscaling to prevent bilinear degradation

---

## User Flow

```
1. 이미지 업로드 / Upload image
         ↓
2. 프레임 선택 / Pick a frame  (Device or Browser)
         ↓
3. 프레임별 설정 / Frame settings
   ├─ Device  → 배경 선택 / Background (None / White / Black / Image)
   └─ Browser → URL · 탭 타이틀 · Favicon / URL · Tab title · Favicon
         ↓
4. 이미지 위치·크기 조정 / Adjust image (scale + pan)
         ↓
5. 그림자 설정 / Shadow (toggle + opacity)
         ↓
6. Export PNG
```

### 1. 이미지 업로드 / Upload

- 드래그 앤 드롭 또는 클릭으로 파일 선택 / Drag & drop or click to select
- 지원 형식 / Supported formats: PNG, JPG
- 제한 / Limit: 가로 또는 세로 최대 4,000px / Max 4,000px on either side

### 2. 프레임 선택 / Frame Selection

**Device**

| 프레임 / Frame | 화면 영역 / Screen area |
|---|---|
| MacBook Air 13 | 2560 × 1664 |
| MacBook Air 15 | 2880 × 1864 |
| MacBook Pro 14 | 3024 × 1964 |
| MacBook Pro 16 | 3456 × 2235 |
| MacBook Neo | 2408 × 1506 |
| iMac 24 | 4480 × 2520 |
| iPhone 17 / 17 Pro / 17 Pro Max | 1206 × 2622 / 1320 × 2868 |
| iPhone Air | 1260 × 2736 |
| iPhone 16 / 16 Plus / 16 Pro / 16 Pro Max | — |
| iPhone 15 / 15 Plus / 15 Pro / 15 Pro Max | — |

**Browser** (모두 3840px 너비 / all 3840px wide)

| 프레임 / Frame | 특징 / Notes |
|---|---|
| Chrome Light / Dark | 탭바 + URL바 / Tab bar + URL bar |
| Safari Big Sur Light / Dark | URL바, 중앙 정렬 / URL bar, center-aligned |
| Safari Catalina Light / Dark | URL바, 중앙 정렬 / URL bar, center-aligned |

### 3. 프레임 설정 / Frame Settings

**Device — Background**

| 옵션 / Option | 설명 / Description |
|---|---|
| None | 투명 (체커보드) / Transparent (checkerboard) |
| White | 흰색 채움 / White fill |
| Black | 검정 채움 / Black fill |
| Image | 업로드 이미지, cover 방식 / Uploaded image, cover fit |

**Browser**

| 항목 / Field | 대상 / Target |
|---|---|
| URL | 전체 브라우저 / All browsers |
| Tab title | Chrome만 / Chrome only |
| Favicon | Chrome만 / Chrome only |

### 4. 이미지 조정 / Image Adjustment

- **Scale**: 0.5× ~ 3.0× (기본 1.0× / default 1.0×)
- **Pan**: 캔버스에서 직접 드래그 / Drag directly on canvas
- **Reset**: transform 초기화 / Reset transform

### 5. 그림자 / Shadow

- **Toggle** ON/OFF
- **Opacity**: 0 ~ 100% (ON일 때만 / only when ON)
- Shadow OFF → export 시 프레임에 딱 맞는 크기 / Shadow OFF → output fits frame exactly (no padding)
- Shadow ON → 프레임 주변 80px 여백 / Shadow ON → 80px padding around frame

### 6. Export

- 이미지와 프레임이 모두 선택된 경우에만 활성화 / Active only when both image and frame are selected
- 버튼 아래에 출력 크기 표시 `W × H px ∙ ~X MB` / Output size shown below button
- 파일명 / Filename: `framed-{frame-id}.png`

---

## Export 해상도 규칙 / Export Resolution

```
effectiveScale = clamp(naturalScale, minScale, 1.0)

naturalScale = screenshot.naturalWidth / screenArea.width
minScale     = minWidth / frameImg.naturalWidth

minWidth:
  세로형 / Portrait  (iPhone 등, aspectRatio < 1) → 800px
  가로형 / Landscape + 브라우저 / Browser         → 1500px
```

- 프레임 에셋은 절대 업스케일하지 않음 (cap = 1.0) / Frame asset is never upscaled
- Preview는 항상 scale=1 (전체 해상도) / Preview always renders at scale=1

**Browser — Short Toolbar 자동 전환 / Auto Short Toolbar**

스크린샷 가로 800px 미만이면 모든 브라우저 프레임이 자동으로 2328px short 툴바로 전환.  
When screenshot width < 800px, all browser frames automatically switch to the 2328px short toolbar.

---

## 시작하기 / Getting Started

```bash
npm install
npm run dev
```

## 스크립트 / Scripts

| 명령어 / Command | 설명 / Description |
|---|---|
| `npm run dev` | 개발 서버 실행 / Start dev server |
| `npm run build` | 프로덕션 빌드 / Production build |
| `npm run preview` | 빌드 결과 미리보기 / Preview build output |
| `npm test` | 테스트 실행 / Run tests |
| `npm run test:watch` | 테스트 감시 모드 / Watch mode |
| `npm run lint` | ESLint 실행 / Run ESLint |

## 기술 스택 / Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Vitest + Testing Library
