# Screenshot Framer — Claude 가이드

## 앱 개요

스크린샷을 디바이스/브라우저 프레임으로 감싸 고품질 PNG로 export하는 웹 앱.  
URL: https://screenshot-framer.vercel.app/

상세 스펙은 아래 문서 참조:

- `docs/user-flow.md` — 전체 User Flow, 프레임 목록, Export 규칙
- `docs/rendering-pipeline.md` — 렌더링 파이프라인, effectiveScale 계산
- `src/data/frames.ts` — 프레임 정의 (screenArea 좌표, browserMeta 등)

## 컴포넌트 구조 규칙

`src/components/` 아래 카드 디렉토리는 다음 규칙을 따른다:

- `*Card/*Card.tsx` — wrapper 컴포넌트 (카드 전체 레이아웃, `export default`)
- `*Card/*Controls.tsx` — 내부 입력 전용 컴포넌트 (`export default`, 필요할 때만)
- 분리가 불필요한 경우 `*Controls.tsx` 없이 `*Card.tsx` 하나로 진행
- 모든 컴포넌트는 `export default function` 사용

```
BackgroundCard/
  BackgroundCard.tsx     ← wrapper
  BackgroundControls.tsx ← 내부 색상/이미지 입력

BrowserCard/
  BrowserCard.tsx        ← wrapper
  BrowserControls.tsx    ← URL·favicon 입력

ShadowCard/
  ShadowCard.tsx         ← wrapper (Controls 없이 단일 파일)
```

## 브랜치 전략

- 항상 `master`에서 새 브랜치를 따서 작업
- 브랜치명: `feat/기능명`, `fix/버그명` 등
- 작업 완료 후 `master`로 **`--no-ff` 머지 커밋**으로 머지 (fast-forward 금지)
- 머지 후 feature 브랜치 삭제

```bash
git merge --no-ff feat/기능명 -m "feat: 기능 설명"
git branch -d feat/기능명
```

## 커밋 메시지 규칙

- **prefix는 영어** (feat, fix, chore, docs, refactor, test 등)
- **내용은 한국어**
- 형식: `feat: 한국어로 작업 내용 설명`
- **`Co-Authored-By:` 줄을 절대 추가하지 않음**

### 예시

```
feat: useImageUpload 훅 추가 — 8,000px 초과 이미지 차단
fix: tsconfig 정리, 불필요한 파일 제거
feat: FramePicker 컴포넌트 추가 — 디바이스/브라우저 탭 선택
```
