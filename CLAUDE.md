# Screenshot Framer — Claude 가이드

## 앱 개요

스크린샷을 디바이스/브라우저 프레임으로 감싸 고품질 PNG로 export하는 웹 앱.  
URL: https://screenshot-framer.vercel.app/

## User Flow

```
1. 이미지 업로드 (PNG·JPG, 최대 4000px)
2. 프레임 선택 (Device 또는 Browser)
3. 프레임별 설정
   ├─ Device  → 배경 선택 (None / White / Black / Image)
   └─ Browser → URL · 탭 타이틀 · Favicon
4. 이미지 스케일(0.5×–3.0×) + 드래그 패닝
5. 그림자 toggle + 불투명도
6. Export PNG (파일명: framed-{frame-id}.png)
```

## 프레임 목록

**Device**

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

**Browser** (모두 3840px 너비)

| 프레임 | 특징 |
|---|---|
| Chrome Light / Dark | 탭바 + URL바 |
| Safari Big Sur Light / Dark | URL바, 중앙 정렬 |
| Safari Catalina Light / Dark | URL바, 중앙 정렬 |

## Export 해상도 규칙

```
effectiveScale = clamp(naturalScale, minScale, 1.0)

naturalScale = screenshot.naturalWidth / screenArea.width
minScale     = minWidth / frameImg.naturalWidth

minWidth:
  세로형 Portrait (iPhone 등, aspectRatio < 1) → 800px
  가로형 Landscape + Browser                   → 1500px
```

- 프레임 에셋은 절대 업스케일하지 않음 (cap = 1.0)
- Preview는 항상 scale=1 (전체 해상도)
- Shadow OFF → 프레임에 딱 맞는 크기 export (여백 없음)
- Shadow ON → 프레임 주변 80px 여백

**Browser — Short Toolbar 자동 전환**

스크린샷 가로 800px 미만이면 모든 브라우저 프레임이 자동으로 2328px short 툴바로 전환.

## 브랜치 전략

- **항상 `master`에서 브랜치를 따서 작업**
- 브랜치명: `feat/기능명`, `fix/버그명` 등
- 작업 완료 후 `master`로 머지

## 커밋 메시지 규칙

- **prefix는 영어** (feat, fix, chore, docs, refactor, test 등)
- **내용은 한국어**
- 형식: `feat: 한국어로 작업 내용 설명`

### 예시
```
feat: useImageUpload 훅 추가 — 8,000px 초과 이미지 차단
fix: tsconfig 정리, 불필요한 파일 제거
feat: FramePicker 컴포넌트 추가 — 디바이스/브라우저 탭 선택
```
