# Screenshot Framer — Design Spec
Date: 2026-04-23

## Overview
브라우저에서 동작하는 스크린샷 프레임 합성 도구. 사용자가 스크린샷 이미지를 업로드하면 디바이스/브라우저 프레임에 합성하여 PNG로 저장한다. 백엔드 없이 모든 처리는 클라이언트에서 수행.

## Tech Stack
- React + TypeScript + Tailwind CSS
- Vite (빌드)
- Canvas API (합성 및 내보내기)

## 지원 프레임
- **디바이스 (v1):** MacBook Pro 16, iPhone 15
- **브라우저 (Mac용):** Chrome, Safari
- 프레임 에셋은 PNG 파일로 직접 제공

## 핵심 기능

### 1. 이미지 업로드
- 드래그앤드롭 + 파일 선택 지원
- 업로드 즉시 `Image` 객체로 width/height 검사
- 한 변이 **8,000px 초과** 시 에러 표시 및 업로드 차단 (진행 불가)

### 2. 프레임 선택
- 탭 구분: `디바이스` / `브라우저`
- 선택 시 미리보기 즉시 반영

### 3. 이미지 조정 (프레임 선택 후)
```ts
type ImageTransform = {
  scale: number    // 1.0 = screenArea에 꽉 차게 fit, 그 이상은 zoom in
  offsetX: number  // screenArea 내 x 이동 (px, 1x 기준)
  offsetY: number  // screenArea 내 y 이동 (px, 1x 기준)
}
```
- **Scale:** 슬라이더로 조절 (비율 고정). 최솟값은 screenArea에 이미지 전체가 보이는 fit 크기.
- **크롭/패닝:** 미리보기 위에서 드래그하여 이동. screenArea 밖으로는 클리핑됨.
- 합성 시 `screenArea`를 클리핑 마스크로 사용, 그 안에 transform 적용하여 drawImage.

### 4. 그림자
```ts
type ShadowConfig = {
  enabled: boolean
  color: string      // hex
  blur: number       // 0–100
  intensity: number  // 0–100 → ctx.shadowOffset 으로 변환
}
```
- **스크린샷 + 프레임 전체 합성물**에 그림자 적용.
- 구현: 오프스크린 캔버스에 스크린샷 + 프레임을 먼저 합성 → 메인 캔버스에 shadow 설정 후 오프스크린 캔버스를 `drawImage`로 전사.

### 4. 내보내기
- 해상도 선택: 1x / 2x / 3x
- 오프스크린 캔버스에 동일 compositor 함수로 렌더링
- `canvas.toBlob('image/png')` → 자동 다운로드
- 배경: 투명 (PNG alpha)

### 5. 중첩 합성
별도 레이어 UI 없음. 사용자가 1차 결과물을 저장 후 재업로드하여 2차 합성하는 방식.

## 아키텍처

```
src/
  assets/frames/        # 디바이스/브라우저 프레임 PNG 에셋
  components/
    UploadZone          # 드래그앤드롭 + 파일 선택 + 해상도 검증
    FramePicker         # 프레임 선택 UI (디바이스 / 브라우저 탭)
    ImageAdjust         # scale 슬라이더 + 드래그 패닝 UI
    ShadowControls      # 강도 + 블러 + 색상 슬라이더
    ExportControls      # 1x/2x/3x 선택 + 저장 버튼
    PreviewCanvas       # 실시간 미리보기 (Canvas, 드래그 패닝 인터랙션 포함)
  hooks/
    useCompositor       # Canvas 합성 로직 (핵심)
    useImageUpload      # 업로드 + 해상도 체크
    useImageTransform   # scale/offset 상태 + 드래그 핸들러
  types/
    frame.ts            # 프레임 메타데이터 타입
```

## 프레임 메타데이터 타입

```ts
type Frame = {
  id: string
  label: string
  category: 'device' | 'browser'
  assetPath: string
  screenArea: {        // 스크린샷이 배치될 영역 (px, 에셋 1x 기준)
    x: number
    y: number
    width: number
    height: number
  }
  aspectRatio: number  // width/height 비율 (스크린샷 검증용)
}
```

## 데이터 흐름

```
useImageUpload    →  업로드된 이미지 + 에러 상태
FramePicker       →  선택된 Frame 객체
useImageTransform →  ImageTransform { scale, offsetX, offsetY }
ShadowControls    →  ShadowConfig 객체
                           ↓
                     useCompositor
                           ↓
               PreviewCanvas (실시간 렌더, 드래그 패닝)
               ExportControls → 고해상도 PNG 저장
```

## 제약 및 결정사항
- Canvas 최대 안전 크기: 16,384px (Chrome/Safari 기준), 3x 출력도 안전 범위 내
- 해상도 제한: 8,000px (한 변 기준, 초과 시 업로드 차단)
- 배경색 기능은 현재 스코프 외 (투명 고정, 추후 확장 가능)
