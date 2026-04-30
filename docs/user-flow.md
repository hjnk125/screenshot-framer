# Screenshot Framer — User Flow

## 앱 개요

스크린샷에 디바이스/브라우저 프레임을 씌워 고품질 PNG로 내보내는 도구.  
사이드바(좌) + 프리뷰 캔버스(우) 레이아웃. 최대 너비 1440px, 넓은 화면에서 양옆 여백.

---

## 전체 흐름

```
1. 이미지 업로드
      ↓
2. 프레임 선택 (Device / Browser / App Store)
      ↓
3. 프레임별 세부 설정
   ├─ Device   → 배경 선택 (None / White / Black / Color / Image)
   ├─ Browser  → URL / 탭 타이틀 / Favicon 입력
   └─ App Store→ 배경 선택 (White / Black / Color / Image, None 숨김)
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
- 제한: 가로 또는 세로 **최대 8,000px**
- 업로드 후: 파일명 · 해상도 · 용량 카드 표시, X 버튼으로 제거

### 2. 프레임 선택

**Device 탭:**
| 프레임 | 화면 영역 |
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

프레임 에셋은 AVIF 포맷, Mac/iMac은 @2x 에셋 자동 선택 지원.

**Browser 탭:** (모두 3840px 너비)
| 프레임 | 종류 |
|---|---|
| Chrome (Light / Dark) | 탭바 + URL바 |
| Safari Big Sur (Light / Dark) | URL바만 (중앙 정렬) |
| Safari Catalina (Light / Dark) | URL바만 (중앙 정렬) |

**App Store 탭:** (모두 1290×2796)
| 프레임 ID | 레이아웃 |
|---|---|
| appstore-67-full | 정면 전체 — 폰이 캔버스 대부분 차지 |
| appstore-67-offset | 정면 오프셋 — 폰이 아래쪽, 위에 여백 |
| appstore-67-tilt-a1 | 기울어짐 A, 오른쪽 방향 |
| appstore-67-tilt-a2 | 기울어짐 A, 왼쪽 방향 |
| appstore-67-tilt-b1 | 기울어짐 B, 오른쪽 방향 |
| appstore-67-tilt-b2 | 기울어짐 B, 왼쪽 방향 |

에셋 위치: `/public/frames/appstore/`, PNG 포맷. 기울어진 프레임은 `screenArea.rotation` 필드로 회전 클리핑 처리.

프레임 선택 시 이미지 transform 초기화.

### 3-A. Device 설정 (Device 프레임 선택 시)

**Background** — 화면 영역 안쪽 배경:

- **None** (기본): 투명 (체커보드)
- **White**: 흰색 채움
- **Black**: 검정 채움
- **Color (스포이드)**: HexColorPicker 팝오버로 임의 hex 색상 선택 → screenArea 내부 채움
- **Image**: 이미지 업로드 → cover 방식으로 화면 영역 채움 (screenArea 클리핑)

### 3-C. App Store 설정 (App Store 프레임 선택 시)

**Background** — 캔버스 전체 배경 (Device와 동일한 컨트롤, None 스와치 숨김):

- **White** (기본): 흰색 채움
- **Black**: 검정 채움
- **Color (스포이드)**: HexColorPicker 팝오버로 임의 hex 색상 선택 → 캔버스 전체 채움
- **Image**: 이미지 업로드 → cover 방식으로 캔버스 전체 채움

### 3-B. Browser 설정 (Browser 프레임 선택 시)

| 항목      | 설명                    | 대상          |
| --------- | ----------------------- | ------------- |
| URL       | 주소창에 표시될 텍스트  | 전체 브라우저 |
| Tab title | 탭에 표시될 제목        | Chrome만      |
| Favicon   | 탭 파비콘 이미지 업로드 | Chrome만      |

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
Device (noUpscale: true, iPhone 등):
  effectiveScale = min(naturalScale, 1.0)

Device (noUpscale 없음, MacBook·iMac):
  effectiveScale = naturalScale  (상한 없음, 스크린샷 비례)

Browser:
  effectiveScale = naturalScale  (상한 없음, 스크린샷 비례)

App Store:
  출력 캔버스 = appstoreMeta.canvasWidth × canvasHeight (1290×2796 고정)
  effectiveScale = 1.0 고정 (noUpscale: true 처리)

naturalScale:
  Device  → screenshot.naturalWidth / screenArea.width
  Browser → screenshot.naturalWidth / frameImg.naturalWidth
```

- noUpscale 프레임(iPhone)은 프레임 에셋을 절대 업스케일하지 않음 (cap=1.0)
- Mac/Browser 프레임은 스크린샷 크기에 비례하여 export (상한 없음)
- App Store 프레임은 항상 1290×2796 고정 출력
- export 크기가 업로드 이미지보다 작을 때 리사이즈 안내 메시지 표시

**Preview는 항상 scale=1** (사이드바 선택 즉시 전체 해상도 프리뷰).

---

## Browser 프레임 — Short Toolbar 자동 전환

스크린샷 가로 **800px 미만**이면 모든 브라우저 프레임이 자동으로 **2328px short 툴바**로 전환.

| 구분      | 일반                          | Short                         |
| --------- | ----------------------------- | ----------------------------- |
| 너비      | 3840px                        | 2328px                        |
| 전환 조건 | screenshot.naturalWidth ≥ 800 | screenshot.naturalWidth < 800 |
| 좌표 방식 | 원본 좌표                     | 좌측 기준점 동일, 우측만 짧게 |

**Chrome short toolbar 주요 좌표 (2328px 기준):**

- `tabArea`: x=234, width=640, faviconX=32, faviconSize=34, textOffsetX=82, textOffsetY=1
- `urlBar`: x=328, width=1943

구현: `useCompositor.ts`의 `resolveFrame()` 함수에서 처리.

---

## 반응형 레이아웃

| 구간                     | 레이아웃                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- |
| mobile / tablet (`< lg`) | 세로 스크롤, 사이드바 아이템 → 프리뷰 캔버스 → Export                            |
| desktop (`≥ lg`)         | 좌: 사이드바 (360px, 독립 스크롤) / 우: 프리뷰 캔버스 (전체 높이) / 하단: Export |
| wide (`> 1440px`)        | 1440px max-width, 양옆 여백                                                      |
