# Screenshot Framer — User Flow

## 앱 개요

스크린샷에 디바이스/브라우저 프레임을 씌워 고품질 PNG로 내보내는 도구.  
사이드바(좌) + 프리뷰 캔버스(우) 레이아웃. 최대 너비 1440px, 넓은 화면에서 양옆 여백.

---

## 전체 흐름

```
1. 이미지 업로드
      ↓
2. 프레임 선택 (Device / Browser)
      ↓
3. 프레임별 세부 설정
   ├─ Device → 배경 선택
   └─ Browser → URL / 탭 타이틀 / Favicon 입력
      ↓
4. 이미지 위치·크기 조정
      ↓
5. 그림자 설정
      ↓
6. Export PNG
```

---

## 단계별 상세

### 1. 이미지 업로드

- 드래그 앤 드롭 또는 클릭으로 파일 선택
- 지원 형식: PNG, JPG
- 제한: 가로 또는 세로 **최대 4,000px**
- 업로드 후: 파일명 · 해상도 · 용량 카드 표시, X 버튼으로 제거

### 2. 프레임 선택

**Device 탭:**
| 프레임 | 에셋 크기 | 화면 영역 |
|---|---|---|
| MacBook Pro 16 | 4340×2860px | 3456×2250px |
| iPhone 15 | 1419×2796px | 1179×2556px |

**Browser 탭:**
| 프레임 | 에셋 너비 | 종류 |
|---|---|---|
| Chrome (Light / Dark) | 3840px | 탭바 + URL바 |
| Safari Big Sur (Light / Dark) | 3840px | URL바만 (중앙 정렬) |
| Safari Catalina (Light / Dark) | 3840px | URL바만 (중앙 정렬) |

프레임 선택 시 이미지 transform 초기화.

### 3-A. Device 설정 (Device 프레임 선택 시)

**Background** — 화면 영역 안쪽 배경:
- **None** (기본): 투명 (체커보드)
- **White**: 흰색 채움
- **Black**: 검정 채움
- **Image (+)**: 이미지 업로드 → cover 방식으로 화면 영역 채움 (screenArea 클리핑)

### 3-B. Browser 설정 (Browser 프레임 선택 시)

| 항목 | 설명 | 대상 |
|---|---|---|
| URL | 주소창에 표시될 텍스트 | 전체 브라우저 |
| Tab title | 탭에 표시될 제목 | Chrome만 |
| Favicon | 탭 파비콘 이미지 업로드 | Chrome만 |

Chrome 기본 파비콘: `/chrome-light-favicon.svg`, `/chrome-dark-favicon.svg`

### 4. 이미지 조정 (스크린샷 + 프레임 모두 선택 시 표시)

- **Scale 슬라이더**: 0.5× ~ 3.0× (기본 1.0×)
- **드래그 패닝**: 캔버스에서 직접 드래그
- **Reset**: transform 초기화

### 5. 그림자 설정

- **Toggle**: Shadow ON / OFF
- **Opacity 슬라이더**: 0 ~ 100% (ON일 때만 표시)
- Shadow OFF → export 시 프레임에 딱 맞는 크기로 출력 (여백 없음)
- Shadow ON → SHADOW_PADDING=80px 여백 포함

### 6. Export

- **Export PNG 버튼**: 비활성 조건 — 이미지 또는 프레임 미선택
- **출력 크기 표시**: `W × H px ∙ ~X MB` (버튼 아래, 가운데 정렬, 모노스페이스)
- 파일명: `framed-{frame.id}.png`

---

## Export 해상도 결정 규칙

```
effectiveScale = clamp(naturalScale, minScale, 1.0)

naturalScale = screenshot.naturalWidth / screenArea.width
minScale     = minWidth / frameImg.naturalWidth

minWidth:
  세로형 (iPhone 등, aspectRatio < 1) → 800px
  가로형 / 브라우저                   → 1500px
```

- 스크린샷이 크면 → naturalScale이 높아지며 scale=1.0에 수렴 (프레임 원본 해상도)
- 스크린샷이 작으면 → minScale로 하한 보정
- 프레임 에셋은 절대 업스케일하지 않음 (cap=1.0)

**Preview는 항상 scale=1** (사이드바 선택 즉시 전체 해상도 프리뷰).

---

## Browser 프레임 — Short Toolbar 자동 전환

스크린샷 가로 **800px 미만**이면 모든 브라우저 프레임이 자동으로 **2328px short 툴바**로 전환.

| 구분 | 일반 | Short |
|---|---|---|
| 너비 | 3840px | 2328px |
| 전환 조건 | screenshot.naturalWidth ≥ 800 | screenshot.naturalWidth < 800 |
| 좌표 방식 | 원본 좌표 | 좌측 기준점 동일, 우측만 짧게 |

**Chrome short toolbar 주요 좌표 (2328px 기준):**
- `tabArea`: x=234, width=640, faviconX=32, faviconSize=32, textOffsetX=78
- `urlBar`: x=328, width=1943

구현: `useCompositor.ts`의 `resolveFrame()` 함수에서 처리.

---

## 반응형 레이아웃

| 구간 | 레이아웃 |
|---|---|
| mobile / tablet (`< lg`) | 세로 스크롤, 사이드바 아이템 → 프리뷰 캔버스 → Export |
| desktop (`≥ lg`) | 좌: 사이드바 (360px, 독립 스크롤) / 우: 프리뷰 캔버스 (전체 높이) / 하단: Export |
| wide (`> 1440px`) | 1440px max-width, 양옆 여백 |
