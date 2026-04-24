# Handoff: Screenshot Framer 리디자인

## Overview

기존 Screenshot Framer 앱 (React + TypeScript + Vite + Tailwind) 의 UI를 **라이트 그레이 배경의 Bento Grid 레이아웃 + 라임 액센트**로 리디자인한 작업입니다.

기능·hook·컴포넌트 구조는 **전혀 건드리지 않고**, 레이아웃(섹션 → 카드 그룹) · 토큰(색/라운드/타이포) · 시각 위계만 바꾸는 작업이에요.

- 원본: 화이트 배경 + 검정 보더 (Neo-brutalist)
- 새 버전: 라이트 그레이 `#e8e8e6` 배경 + 오프화이트 카드 벤토 그리드 + 검정 히어로 블록(Export) + 라임(`#d7ff3a`) 포인트

## About the Design Files

이 폴더의 HTML 파일들은 **디자인 레퍼런스**입니다 — 의도한 모양과 동작을 보여주는 프로토타입이지 그대로 복사할 프로덕션 코드가 아니에요. 작업은 **이 HTML 디자인을 기존 React + TypeScript + Tailwind 코드베이스에 녹여내는 것**입니다. 기존 컴포넌트 구조(`src/components/*.tsx`, `src/hooks/*.ts`)는 유지하고, 스타일과 마크업만 교체하세요.

## Fidelity

**High-fidelity** — 색상·라운드·타이포·간격 모두 hex 값과 px 값까지 정해져 있습니다. 레이아웃/여백/토큰을 그대로 재현하세요.

## Layout Overview

```
┌─────────────────────────────────────────────────────┐
│  [아래 6개 카드가 좌측 사이드바]    [프리뷰 (우측)]  │
│  ┌──────────────────┐                               │
│  │ 1. Title (검정)   │                               │
│  ├──────────────────┤              ┌────────────┐   │
│  │ 2. File (컴팩트)  │              │  투명       │   │
│  ├──────────────────┤              │  체커보드    │   │
│  │ 3. Frame picker  │              │            │   │
│  ├──────────────────┤              │  (프레임+   │   │
│  │ 4. Image adjust  │              │   스샷)     │   │
│  ├──────────────────┤              │            │   │
│  │ 5. Shadow        │              │            │   │
│  ├──────────────────┤              │            │   │
│  │ 6. Export (검정)  │              └────────────┘   │
│  └──────────────────┘                               │
│  360px                 1fr                          │
└─────────────────────────────────────────────────────┘
padding: 14px    gap: 14px (root)    gap: 12px (sidebar)
```

- **Grid**: `grid-template-columns: 360px 1fr; gap: 14px; padding: 14px`
- **Sidebar**: 세로 flex, 카드 간격 `12px`
- **Preview**: 우측 전체 — 카드 하나로 체커보드 배경

## Design Tokens

```ts
// src/tokens.ts 또는 tailwind.config.js 에 추가
const tokens = {
  colors: {
    pageBg:     '#e8e8e6',  // 페이지 배경
    card:       '#fafaf9',  // 기본 카드
    cardDense:  '#f7f7f5',  // 컴팩트 카드 (B 스타일)
    cardInner:  '#ffffff',  // 카드 내부 중첩 표면 (input, 세그먼트 컨트롤)
    text:       '#17181a',  // 본문
    soft:       '#5a5a58',  // 서브
    muted:      '#8a8a88',  // 캡션 / 메타
    border:     'rgba(0,0,0,0.07)',
    accent:     '#d7ff3a',  // 라임 — 선택 상태 + Export CTA 에만
    accentDark: '#17181a',  // 검정 — 히어로 블록 (Title, Export), 토글 on, 세그먼트 활성
  },
  radius: {
    card:      20,   // Frame/Adjust/Shadow 카드
    cardDense: 14,   // Title/File/Export (B 스타일)
    inner:     10,   // input, 세그먼트
    button:    7,    // 작은 버튼
    pill:      9,    // PNG 저장 버튼
  },
  spacing: {
    rootGap:    14,
    rootPad:    14,
    sidebarGap: 12,
    cardPadA:   16,   // A 스타일 카드
    cardPadB:   10,   // B 스타일 (Title/File 등 컴팩트)
    cardPadExport: 12,
  },
  typography: {
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    mono:       'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    // 라벨 (카드 헤더)
    labelA:  '11px / 600 / uppercase / letter-spacing 0.04em / color: soft',
    labelB:  '9.5px / 700 / uppercase / letter-spacing 0.06em / color: soft',
    // 본문
    body:    '12px / 500 / text',
    caption: '10–11px / muted',
    // 숫자
    numeric: 'ui-monospace 11px / 600',
  },
};
```

## Tailwind Config 추가 제안

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'page':        '#e8e8e6',
        'card':        '#fafaf9',
        'card-dense':  '#f7f7f5',
        'card-inner':  '#ffffff',
        'ink':         '#17181a',
        'soft':        '#5a5a58',
        'muted':       '#8a8a88',
        'accent':      '#d7ff3a',
      },
      borderColor: {
        'soft':   'rgba(0,0,0,0.07)',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'card':       '20px',
        'card-dense': '14px',
      },
    },
  },
  plugins: [],
}
```

---

## 각 카드별 상세 (6개)

### 1. Title card — "Screenshot Framer" (B 스타일 · 검정)

**역할**: 앱 아이덴티티 + 버전 표시. 원본 `<header>` 대체.

**레이아웃**:
- `background: #17181a` / `border-radius: 14` / `padding: 10px 12px`
- flex · `justify-content: space-between`
- 왼쪽: 아이콘 22×22 (라임 배경 `#d7ff3a`, radius 6, 검정 `▢` 기호) + 타이틀 텍스트
- 오른쪽: `v0.3` 버전 뱃지

**타이포**:
- 타이틀: `12px / 600 / #fff`
- 버전: `10px / ui-monospace / rgba(255,255,255,0.5)`

**적용 파일**: `src/App.tsx` 상단 `<header>` 블록을 이 카드로 교체.

---

### 2. File upload card (B 스타일 · 컴팩트)

**역할**: `UploadZone` 업로드 된 상태 + `UploadZone` 비어있는 상태 모두 이 카드 안에 들어감.

**레이아웃**:
- `background: #f7f7f5` / `border-radius: 14` / `padding: 10`
- 카드 헤더: `파일` 라벨 (9.5px/700 uppercase) + 파일 크기 (mono 10px)
- 본문: 44×44 썸네일 + 파일명/해상도 + ✕ 제거 버튼

**업로드 전 상태 (원본 UploadZone)**:
- 썸네일 자리에 드롭존 전체가 차지 — 대시드 보더 `rgba(0,0,0,0.15)`, 드래그 시 `#d7ff3a` 로 변경
- 텍스트 `"클릭하거나 드래그해서 스크린샷 업로드"` (12px/600) + `"PNG · JPG · 최대 8,000px"` (10px/muted)

**적용 파일**: `src/components/UploadZone.tsx` + `src/App.tsx` 업로드된 상태 블록.

---

### 3. Frame picker card (A 스타일)

**역할**: `src/components/FramePicker.tsx` 대체 스타일링.

**레이아웃**:
- `background: #fafaf9` / `border-radius: 20` / `padding: 16`
- 라벨 `프레임` (11px/600 uppercase soft)
- 세그먼트 컨트롤 (디바이스/브라우저):
  - 컨테이너: `background: #fff`, `padding: 3`, `border-radius: 10`, soft border
  - 버튼: `padding: 7px 0`, `font: 12/600`, radius 7
  - 활성: `background: #17181a`, `color: #fff`
  - 비활성: `background: transparent`, `color: #5a5a58`
- 프레임 그리드: `grid-cols-2 gap-6`, 최대 높이 130px + 스크롤
  - 버튼: radius 10, `padding: 10`, min-height 36
  - 활성: `background: #d7ff3a` + 1px `#d7ff3a` 보더 + 우측에 체크 아이콘
  - 비활성: `background: #fff` + 1px soft border

**적용 파일**: `src/components/FramePicker.tsx` 마크업/클래스 교체.

---

### 4. Image adjust card (A 스타일)

**역할**: `src/components/ImageAdjust.tsx` 대체.

**레이아웃**:
- `background: #fafaf9` / `border-radius: 20` / `padding: 16`
- 라벨 `이미지 조정` + 우측 hint `{scale.toFixed(2)}×` (11px/muted)
- 슬라이더 행: 돋보기 아이콘 14px + 슬라이더 (flex-1)
- 하단 행: `"드래그로 위치 조절"` (10.5px/muted) + 초기화 텍스트 버튼

**슬라이더 스타일 (공통 · 4번·5번 동일)**:
- 트랙: 4px 높이, `background: #fff`, soft border, radius 4
- 채워진 부분: `background: #17181a`
- 썸: 14px 원, 흰 배경, 2px 검정 보더, `box-shadow: 0 1px 3px rgba(0,0,0,0.15)`
- native input 투명 오버레이로 상호작용

**적용 파일**: `src/components/ImageAdjust.tsx`.

---

### 5. Shadow card (A 스타일)

**역할**: `src/components/ShadowControls.tsx` 대체.

**레이아웃**:
- `background: #fafaf9` / `border-radius: 20` / `padding: 16`
- 라벨 `그림자` + hint `{opacity}%` 또는 `OFF`
- 토글 스위치 (32×18, 라임 대신 검정 on): 체크박스 → 스위치로 교체
  - ON: `background: #17181a`, 원 흰색 (14×14, top: 2, left: 16)
  - OFF: `background: #d5d5d3`, 원 흰색 (left: 2)
- 슬라이더는 4번과 동일 스타일, 불투명도 표시 숫자는 우측에 32px 너비로 고정

**적용 파일**: `src/components/ShadowControls.tsx`.

---

### 6. Export card (B 스타일 · 검정 히어로)

**역할**: `src/components/ExportControls.tsx` 대체. 사이드바 맨 아래 `margin-top: auto` 로 밀어냄.

**레이아웃**:
- `background: #17181a` / `border-radius: 14` / `padding: 12`
- 헤더: `내보내기` 라벨 (9.5/700 uppercase, `rgba(255,255,255,0.6)`) + `{scale}× scale` mono 10px
- 스케일 선택 (1×/2×/3×): flex, gap 4
  - 비활성: `background: rgba(255,255,255,0.06)`, `border: 1px rgba(255,255,255,0.1)`, `color: #fff`
  - 활성: `background: #d7ff3a`, `color: #17181a`
  - 크기: padding 6px 0, font 11.5/700, radius 7
- PNG 저장 버튼:
  - `background: #d7ff3a`, `color: #17181a`
  - padding 9px 12, radius 9, font 12.5/700
  - 아이콘 `download` 13px + 텍스트

**적용 파일**: `src/components/ExportControls.tsx`.

---

## 프리뷰 영역 (우측)

**역할**: `src/components/PreviewCanvas.tsx` — **원래 동작 그대로 유지**. 스타일만 새 토큰으로.

**레이아웃**:
- `border-radius: 20` / `border: 1px solid rgba(0,0,0,0.07)`
- `background: url(/checkerboard.svg) repeat` (현재 그대로)
- `padding: 40`
- `display: flex; align-items: center; justify-content: center`
- 캔버스는 중앙 정렬, `max-width: 100%`, `max-height: 100%`, `object-contain`
- **툴바/상태 스트립 없음** — 체커보드 + 프레임된 스샷만.

## 아이콘

```
zoom · download · check · reset · shadow
```

간단한 24×24 stroke SVG (stroke-width 1.6, stroke-linecap/join round). `lucide-react` 같은 라이브러리 이미 있으면 그걸 쓰는 게 편해요. 없으면 `Screenshot Framer Final.html` 의 `variations/shared-mocks.jsx` 에 있는 `Icon` 컴포넌트 참고.

## 폰트

Pretendard 이미 `src/index.css` 에 로드되어 있음. 그대로 유지. 숫자·치수 표시에는 `ui-monospace` 시스템 모노스페이스 사용.

## 변경하지 않는 것

- ✅ **기능/동작** — `useImageUpload`, `useImageTransform`, `useCompositor`, `useBrowserState` 그대로
- ✅ **compositor** — `src/utils/compositor.ts`, canvas 렌더링 로직 그대로
- ✅ **types** — `src/types/frame.ts`, `src/data/frames.ts` 그대로
- ✅ **파일 구조** — 컴포넌트 파일명과 export signature 그대로
- ✅ **테스트** — 기능 테스트는 그대로 통과해야 함. 스냅샷/DOM 쿼리 테스트는 새 마크업으로 업데이트 필요할 수 있음.

## 변경되는 것

- 🎨 모든 컴포넌트의 JSX 마크업과 Tailwind 클래스
- 🎨 `src/App.tsx` 레이아웃 셸 (header → Title card + 전체 카드 기반 사이드바로)
- 🎨 `tailwind.config.js` 에 새 토큰 추가
- 🎨 `src/index.css` body background `#e8e8e6` 로 변경

## Commit Convention

CLAUDE.md 기준:
```
feat: Screenshot Framer 벤토 그리드 리디자인 적용
refactor: FramePicker 스타일 새 토큰으로 교체
feat: Tailwind에 bento 디자인 토큰 추가
```

## Files in This Bundle

- `Screenshot Framer Final.html` — **선택된 조합** · 구현 참고용 최종 디자인
- `Screenshot Framer Redesign.html` — 3가지 방향 비교 (A/B/C) + 디자인 시스템 문서
- `variations/` — A/B/C 각 방향의 React 컴포넌트 소스
- `assets/checkerboard.svg` — 프리뷰 배경 (원본 프로젝트 것 그대로)

---

## Implementation Order (제안)

1. `tailwind.config.js` 에 새 토큰 추가, `src/index.css` body 배경 변경
2. `src/App.tsx` 레이아웃 셸 교체 (grid 360px + 1fr, 사이드바 카드 스택)
3. Title card · File card · Export card (B 스타일 3개) 구현 — 새로운 컴포넌트이거나 App 내 인라인
4. `FramePicker.tsx` 스타일 교체
5. `ImageAdjust.tsx` 스타일 교체 (슬라이더 커스텀 · 공통 컴포넌트로 추출 고려 → `src/components/Slider.tsx`)
6. `ShadowControls.tsx` 스타일 교체 (체크박스 → 토글 스위치, 슬라이더 공통 컴포넌트 재사용)
7. `ExportControls.tsx` 스타일 교체
8. `PreviewCanvas.tsx` 스타일 교체 (padding·border-radius·border만)
9. 테스트 업데이트 (DOM 쿼리 · 클래스 셀렉터 깨지는 것들)
