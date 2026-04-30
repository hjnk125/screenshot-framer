# Background 색상 피커 — 디자인 스펙

## 개요

Device / App Store 카테고리의 Background 컨트롤에 커스텀 색상 피커를 추가한다.
기존 White / Black 스와치는 유지하고, 스포이드 아이콘 스와치를 통해 임의 hex 색상을 선택할 수 있다.
이미지 업로드(`+`) 버튼은 이미지 아이콘으로 교체한다.

---

## 스와치 행 구성

```
[None] [White] [Black] [스포이드/커스텀색] [이미지]
```

- **None (transparent)**: 체커보드 패턴, App Store 카테고리에서는 숨김 (기존 동작 유지)
- **White / Black**: 기존과 동일
- **스포이드 스와치**: 커스텀 색상 미선택 시 스포이드 아이콘 표시, 선택 후엔 해당 색상으로 채워짐
- **이미지 스와치**: 기존 `+` → 이미지 아이콘으로 교체, 동작 동일

---

## 타입 변경

### `DeviceBgType`

```typescript
type DeviceBgType = "transparent" | "white" | "black" | "color" | "image";
```

### `DeviceBgConfig`

```typescript
type DeviceBgConfig = {
  type: DeviceBgType;
  color?: string;  // hex 문자열, e.g. "#ff6b6b". type === "color" 일 때만 유효
  image: HTMLImageElement | null;
};
```

---

## useDeviceBg 변경

`setColor(hex: string)` 함수 추가:

```typescript
const setColor = useCallback((hex: string) => {
  setDeviceBg({ type: "color", color: hex, image: null });
}, []);
```

`UseDeviceBgReturn`에 `setColor` 추가.

---

## DeviceControls 변경

### 스포이드 스와치

- `deviceBg.type === "color"` 이면 스와치 배경색 = `deviceBg.color`, ring 표시
- 그 외엔 스포이드 아이콘 (기존 스와치와 동일한 크기/테두리)
- 클릭 시 팝오버 열림/닫힘 토글

### 팝오버

- 스와치 바로 아래에 절대위치로 표시
- `react-colorful`의 `HexColorPicker` 컴포넌트
- hex 텍스트 인풋 (6자리 hex, `#` 제외 입력, 유효한 hex일 때만 반영)
- 팝오버 외부 클릭 시 닫힘 (`mousedown` 이벤트로 처리)

### 이미지 스와치

- 기존 `+` 텍스트 → `<Icon name="image" size={14} />` 로 교체

---

## compositor 변경

### `drawDeviceBg` (device 프레임용)

```typescript
} else if (bg.type === "color" && bg.color) {
  ctx.fillStyle = bg.color;
  ctx.fillRect(x, y, w, h);  // screenArea 내부만 채움
}
```

### `drawAppStoreBg` (appstore 프레임용)

```typescript
} else if (bg.type === "color" && bg.color) {
  ctx.fillStyle = bg.color;
  ctx.fillRect(0, 0, w, h);  // 캔버스 전체 채움
}
```

---

## 라이브러리

```bash
npm install react-colorful
```

- `HexColorPicker`: color wheel + hex 입력 올인원
- 번들 ~2.8kb (gzip)
- TypeScript 지원

---

## 범위 외

- 최근 사용 색상 히스토리 — 추후
- 투명도(alpha) 지원 — 추후
- Device 카테고리의 None 동작 변경 없음
