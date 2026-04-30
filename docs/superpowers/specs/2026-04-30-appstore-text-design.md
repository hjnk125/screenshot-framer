# App Store 텍스트 추가 기능 설계

## 개요

App Store 프레임 선택 시 캔버스에 Title / Description 텍스트를 렌더링하는 기능.  
각 줄은 독립적인 색상 피커를 가지며, 글자 크기·굵기는 고정값.

---

## 상태 구조

```ts
// src/hooks/useAppStoreText.ts
type AppStoreTextState = {
  title: string;
  titleColor: string;         // hex, 기본 "#000000"
  description: string;
  descriptionColor: string;   // hex, 기본 "#000000"
}
```

훅은 상태와 setter를 반환. `App.tsx`에서 관리.

---

## 프레임 메타데이터 (types/frame.ts)

`AppStoreMeta`에 `textConfig` 추가 — `browserMeta.urlBar` 패턴과 동일:

```ts
export type AppStoreMeta = {
  canvasWidth: number;
  canvasHeight: number;
  textConfig?: {
    x: number;       // left/right 정렬 기준점 x. center는 canvasWidth/2 사용
    y: number;       // title top y (px)
    align: "left" | "center" | "right";
  };
};
```

`frames.ts`에서 각 appstore 프레임에 좌표 직접 지정:

| 프레임 ID | align | x | y |
|---|---|---|---|
| appstore-67-full | center | — | 192 |
| appstore-67-offset | center | — | 311 |
| appstore-67-tilt-a1 | left | 108 | 2349 |
| appstore-67-tilt-a2 | right | 1182 | 180 |
| appstore-67-tilt-b1 | left | 108 | 180 |
| appstore-67-tilt-b2 | right | 1182 | 2349 |

> right 정렬의 x = 1290 - 108 = 1182 (108px 우측 패딩).  
> tilt-b는 tilt-a와 좌우 대칭 반대편.  
> 좌표는 초기값이며 사용자가 프레임별로 조정할 예정.

---

## 컴포넌트 구조

BrowserCard / BrowserControls 패턴을 그대로 따름.

```
src/components/AppStoreTextCard/
  AppStoreTextCard.tsx      ← wrapper, 카드 레이아웃, export default
  AppStoreTextControls.tsx  ← Title/Description input + 색상 피커, export default
```

### AppStoreTextCard

- `frame: Frame`, `state: UseAppStoreTextReturn` props
- 카드 헤더: "Text" 라벨
- `AppStoreTextControls` 렌더

### AppStoreTextControls

- **Title** 라벨 + text input + HexColorPicker 팝오버 (색상 스와치 버튼)
- **Description** 라벨 + text input + HexColorPicker 팝오버
- 색상 피커는 기존 `BackgroundControls`와 동일한 팝오버 패턴

---

## App.tsx 통합

```tsx
{/* App Store text controls — appstore 프레임 선택 시 */}
{selectedFrame?.category === "appstore" && (
  <AppStoreTextCard frame={selectedFrame} state={appStoreText} />
)}
```

BackgroundCard 바로 아래 위치.  
`useAppStoreText()` 훅 인스턴스를 App.tsx에서 생성하여 전달.

---

## 렌더링 (compositor)

### DrawCompositeParams 확장

```ts
appStoreText?: AppStoreTextState;
```

### drawAppStoreComposite 텍스트 레이어

프레임 오버레이(step 4) 이후 마지막 단계로 추가.  
`frame.appstoreMeta.textConfig`가 없거나 텍스트가 모두 빈 값이면 생략.

- **Title**: Pretendard `semibold 92px`, line-height 1.2, `titleColor`
- **Description**: Pretendard `medium 56px`, `descriptionColor`, Title 아래 `+(92 * 1.2 + 24) = 134px`
- 빈 문자열이면 해당 줄 렌더링 생략
- `ctx.textBaseline = "top"`
- 정렬:
  - `center` → `ctx.textAlign = "center"`, `x = canvasWidth / 2`
  - `left` → `ctx.textAlign = "left"`, `x = textConfig.x`
  - `right` → `ctx.textAlign = "right"`, `x = textConfig.x`

### useCompositor.ts 전달

`drawComposite` 호출 시 `appStoreText` 파라미터 포함.

---

## 미결 사항

- 프레임별 `textConfig` 좌표값은 초기 추정치. 사용자가 실제 프레임 에셋을 확인하며 직접 조정할 예정.
