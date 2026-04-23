# Screenshot Framer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스크린샷 이미지를 업로드하면 디바이스/브라우저 프레임에 합성해 PNG로 저장하는 브라우저 전용 웹 앱을 만든다.

**Architecture:** Canvas API 기반 클라이언트 전용 앱. 순수 함수 `compositor.ts`에서 캔버스 드로잉 로직을 담당하고, React hooks가 상태를 관리하며, 컴포넌트는 UI만 렌더링한다. 미리보기와 내보내기가 동일한 renderer를 공유한다.

**Tech Stack:** React 18 + TypeScript + Tailwind CSS v3 + Vite + Vitest + @testing-library/react

---

## File Map

| 파일 | 역할 |
|------|------|
| `src/types/frame.ts` | Frame, ShadowConfig, ImageTransform 타입 정의 |
| `src/data/frames.ts` | 프레임 메타데이터 배열 (id, label, screenArea 등) |
| `src/utils/compositor.ts` | 순수 Canvas 드로잉 함수 |
| `src/hooks/useImageUpload.ts` | 업로드 + 해상도 검증 로직 |
| `src/hooks/useImageTransform.ts` | scale/offset 상태 + 드래그 핸들러 + fit 계산 |
| `src/hooks/useCompositor.ts` | 상태 종합 → PreviewCanvas 렌더 트리거 |
| `src/components/UploadZone.tsx` | 드래그앤드롭 + 파일 선택 UI |
| `src/components/FramePicker.tsx` | 디바이스/브라우저 탭 + 프레임 선택 그리드 |
| `src/components/ImageAdjust.tsx` | scale 슬라이더 UI |
| `src/components/ShadowControls.tsx` | 그림자 enabled + color + blur + intensity 슬라이더 |
| `src/components/ExportControls.tsx` | 1x/2x/3x 선택 + 저장 버튼 |
| `src/components/PreviewCanvas.tsx` | `<canvas>` 렌더링 + 드래그 패닝 인터랙션 |
| `src/components/Toast.tsx` | 에러 토스트 UI |
| `src/App.tsx` | 전체 레이아웃 조합 |
| `public/frames/` | PNG 에셋 (사용자가 직접 배치) |

---

## Task 1: 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Vite 프로젝트 생성**

```bash
cd /Users/gentlemonster/Desktop/screenshot-editor
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: 의존성 설치**

```bash
npm install
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
npx tailwindcss init -p
```

- [ ] **Step 3: Tailwind 설정 (`tailwind.config.js`)**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 4: `src/index.css` Tailwind directives 추가**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: `vite.config.ts` 업데이트 (vitest 포함)**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 6: `src/test/setup.ts` 생성**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 7: `tsconfig.json` 업데이트 (vitest types 추가)**

`compilerOptions.types` 배열에 `"vitest/globals"` 추가.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 8: `src/App.tsx` 임시 내용으로 교체**

```tsx
export default function App() {
  return <div className="min-h-screen bg-gray-950 text-white">Screenshot Framer</div>
}
```

- [ ] **Step 9: 개발 서버 실행 확인**

```bash
npm run dev
```

Expected: `http://localhost:5173` 에서 "Screenshot Framer" 텍스트 보임.

- [ ] **Step 10: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + TS + Tailwind + Vitest"
```

---

## Task 2: 타입 정의

**Files:**
- Create: `src/types/frame.ts`
- Create: `src/test/types.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// src/test/types.test.ts
import type { Frame, ShadowConfig } from '../types/frame'

describe('타입 구조 검증', () => {
  it('Frame 타입이 필요한 필드를 가진다', () => {
    const frame: Frame = {
      id: 'macbook-air',
      label: 'MacBook Air',
      category: 'device',
      assetPath: '/frames/macbook-air.png',
      screenArea: { x: 100, y: 80, width: 1200, height: 750 },
      aspectRatio: 1.6,
    }
    expect(frame.id).toBe('macbook-air')
    expect(frame.screenArea.width).toBe(1200)
  })

  it('ShadowConfig 타입이 필요한 필드를 가진다', () => {
    const shadow: ShadowConfig = {
      enabled: true,
      color: '#000000',
      blur: 40,
      intensity: 50,
    }
    expect(shadow.blur).toBe(40)
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/types.test.ts
```

Expected: FAIL — `Cannot find module '../types/frame'`

- [ ] **Step 3: `src/types/frame.ts` 작성**

```ts
export type FrameCategory = 'device' | 'browser'

export type ScreenArea = {
  x: number
  y: number
  width: number
  height: number
}

export type Frame = {
  id: string
  label: string
  category: FrameCategory
  assetPath: string
  screenArea: ScreenArea
  aspectRatio: number
}

export type ShadowConfig = {
  enabled: boolean
  color: string
  blur: number       // 0–100
  intensity: number  // 0–100
}

export type ImageTransform = {
  scale: number    // 1.0 = screenArea fit 기준
  offsetX: number  // screenArea 내 x 이동 (px, 1x 기준)
  offsetY: number  // screenArea 내 y 이동 (px, 1x 기준)
}

export type ExportScale = 1 | 2 | 3
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/types.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/frame.ts src/test/types.test.ts
git commit -m "feat: add Frame and ShadowConfig type definitions"
```

---

## Task 3: 프레임 메타데이터

**Files:**
- Create: `src/data/frames.ts`
- Create: `src/test/frames.test.ts`

> **Note:** 에셋 파일(`src/assets/frames/*.png`)은 아직 없어도 됨. 경로 문자열만 정의.

- [ ] **Step 1: 테스트 작성**

```ts
// src/test/frames.test.ts
import { FRAMES, getFrameById } from '../data/frames'

describe('FRAMES 메타데이터', () => {
  it('4개 프레임이 정의되어 있다', () => {
    expect(FRAMES.length).toBe(4)
  })

  it('모든 프레임에 screenArea가 정의되어 있다', () => {
    FRAMES.forEach(f => {
      expect(f.screenArea.width).toBeGreaterThan(0)
      expect(f.screenArea.height).toBeGreaterThan(0)
    })
  })

  it('aspectRatio가 screenArea와 일치한다', () => {
    FRAMES.forEach(f => {
      const computed = f.screenArea.width / f.screenArea.height
      expect(f.aspectRatio).toBeCloseTo(computed, 2)
    })
  })

  it('getFrameById가 올바른 프레임을 반환한다', () => {
    const frame = getFrameById('macbook-pro-16')
    expect(frame?.label).toBe('MacBook Pro 16')
  })

  it('getFrameById가 없는 id에 undefined를 반환한다', () => {
    expect(getFrameById('nonexistent')).toBeUndefined()
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/frames.test.ts
```

Expected: FAIL — `Cannot find module '../data/frames'`

- [ ] **Step 3: `src/data/frames.ts` 작성**

> screenArea 수치는 에셋 파일 실제 크기에 맞게 나중에 조정 필요. 아래는 플레이스홀더 수치.

```ts
import type { Frame } from '../types/frame'

export const FRAMES: Frame[] = [
  {
    id: 'macbook-pro-16',
    label: 'MacBook Pro 16',
    category: 'device',
    assetPath: '/frames/macbook-pro-16.png',
    screenArea: { x: 140, y: 90, width: 1728, height: 1117 },
    aspectRatio: 1728 / 1117,
  },
  {
    id: 'iphone-15',
    label: 'iPhone 15',
    category: 'device',
    assetPath: '/frames/iphone-15.png',
    screenArea: { x: 30, y: 60, width: 390, height: 844 },
    aspectRatio: 390 / 844,
  },
  {
    id: 'chrome-mac',
    label: 'Chrome (Mac)',
    category: 'browser',
    assetPath: '/frames/chrome-mac.png',
    screenArea: { x: 0, y: 88, width: 1440, height: 832 },
    aspectRatio: 1440 / 832,
  },
  {
    id: 'safari-mac',
    label: 'Safari (Mac)',
    category: 'browser',
    assetPath: '/frames/safari-mac.png',
    screenArea: { x: 0, y: 88, width: 1440, height: 832 },
    aspectRatio: 1440 / 832,
  },
]

export function getFrameById(id: string): Frame | undefined {
  return FRAMES.find(f => f.id === id)
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/frames.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/frames.ts src/test/frames.test.ts
git commit -m "feat: add frame metadata and getFrameById"
```

---

## Task 4: Compositor 유틸 함수

**Files:**
- Create: `src/utils/compositor.ts`
- Create: `src/test/compositor.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// src/test/compositor.test.ts
import { calculateCanvasSize, buildShadow } from '../utils/compositor'
import type { ShadowConfig } from '../types/frame'

describe('calculateCanvasSize', () => {
  it('1x 스케일에서 에셋 기준 캔버스 크기를 반환한다', () => {
    const result = calculateCanvasSize(1500, 950, 1)
    expect(result).toEqual({ width: 1500, height: 950 })
  })

  it('2x 스케일에서 두 배 크기를 반환한다', () => {
    const result = calculateCanvasSize(1500, 950, 2)
    expect(result).toEqual({ width: 3000, height: 1900 })
  })

  it('3x 스케일에서 세 배 크기를 반환한다', () => {
    const result = calculateCanvasSize(1500, 950, 3)
    expect(result).toEqual({ width: 4500, height: 2850 })
  })
})

describe('buildShadow', () => {
  it('disabled 상태면 빈 shadow 설정을 반환한다', () => {
    const config: ShadowConfig = { enabled: false, color: '#000', blur: 40, intensity: 50 }
    const result = buildShadow(config)
    expect(result.shadowBlur).toBe(0)
    expect(result.shadowColor).toBe('transparent')
  })

  it('enabled 상태면 blur와 color를 반환한다', () => {
    const config: ShadowConfig = { enabled: true, color: '#000000', blur: 60, intensity: 50 }
    const result = buildShadow(config)
    expect(result.shadowBlur).toBe(60)
    expect(result.shadowColor).toBe('#000000')
  })

  it('intensity 50이면 offsetY가 양수다', () => {
    const config: ShadowConfig = { enabled: true, color: '#000', blur: 40, intensity: 50 }
    const result = buildShadow(config)
    expect(result.shadowOffsetY).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/compositor.test.ts
```

Expected: FAIL

- [ ] **Step 3: `src/utils/compositor.ts` 작성**

```ts
import type { Frame, ShadowConfig, ImageTransform, ExportScale } from '../types/frame'

export type CanvasSize = { width: number; height: number }

export type ShadowSettings = {
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
}

export function calculateCanvasSize(
  assetWidth: number,
  assetHeight: number,
  scale: ExportScale
): CanvasSize {
  return { width: assetWidth * scale, height: assetHeight * scale }
}

export function buildShadow(config: ShadowConfig): ShadowSettings {
  if (!config.enabled) {
    return { shadowColor: 'transparent', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0 }
  }
  const offset = (config.intensity / 100) * 30
  return {
    shadowColor: config.color,
    shadowBlur: config.blur,
    shadowOffsetX: 0,
    shadowOffsetY: offset,
  }
}

// screenArea에 screenshot을 transform 적용하여 클리핑 후 그림
function drawScreenshot(
  ctx: CanvasRenderingContext2D,
  screenshot: HTMLImageElement,
  screenArea: Frame['screenArea'],
  transform: ImageTransform
): void {
  const { x, y, width: sw, height: sh } = screenArea
  const { scale, offsetX, offsetY } = transform

  // 실제 그릴 스크린샷 크기 (scale 적용)
  const drawW = sw * scale
  const drawH = sh * scale

  // 중앙 기준 배치 후 offset 적용
  const drawX = x + (sw - drawW) / 2 + offsetX
  const drawY = y + (sh - drawH) / 2 + offsetY

  ctx.save()
  // screenArea를 클리핑 마스크로
  ctx.beginPath()
  ctx.rect(x, y, sw, sh)
  ctx.clip()
  ctx.drawImage(screenshot, drawX, drawY, drawW, drawH)
  ctx.restore()
}

export function drawComposite(params: {
  canvas: HTMLCanvasElement
  screenshot: HTMLImageElement
  frameImg: HTMLImageElement
  frame: Frame
  transform: ImageTransform
  shadow: ShadowConfig
  scale: ExportScale
}): void {
  const { canvas, screenshot, frameImg, frame, transform, shadow, scale } = params
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const assetW = frameImg.naturalWidth
  const assetH = frameImg.naturalHeight
  const { width, height } = calculateCanvasSize(assetW, assetH, scale)

  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)

  // 1. 오프스크린 캔버스에 스크린샷 + 프레임 합성 (그림자 없이)
  const offscreen = document.createElement('canvas')
  offscreen.width = assetW
  offscreen.height = assetH
  const offCtx = offscreen.getContext('2d')!

  drawScreenshot(offCtx, screenshot, frame.screenArea, transform)
  offCtx.drawImage(frameImg, 0, 0, assetW, assetH)

  // 2. 메인 캔버스에 그림자 적용 후 오프스크린 전사
  const shadowSettings = buildShadow(shadow)
  ctx.shadowColor = shadowSettings.shadowColor
  ctx.shadowBlur = shadowSettings.shadowBlur * scale
  ctx.shadowOffsetX = shadowSettings.shadowOffsetX * scale
  ctx.shadowOffsetY = shadowSettings.shadowOffsetY * scale

  ctx.drawImage(offscreen, 0, 0, width, height)

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/compositor.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/compositor.ts src/test/compositor.test.ts
git commit -m "feat: add compositor utility functions"
```

---

## Task 5: useImageUpload 훅

**Files:**
- Create: `src/hooks/useImageUpload.ts`
- Create: `src/test/useImageUpload.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// src/test/useImageUpload.test.ts
import { renderHook, act } from '@testing-library/react'
import { useImageUpload } from '../hooks/useImageUpload'

function makeImageFile(width: number, height: number): File {
  return new File([''], 'test.png', { type: 'image/png' })
}

// HTMLImageElement 로드를 모킹
function mockImageLoad(width: number, height: number) {
  Object.defineProperty(global.Image.prototype, 'src', {
    set(_src: string) {
      setTimeout(() => {
        Object.defineProperty(this, 'naturalWidth', { value: width, configurable: true })
        Object.defineProperty(this, 'naturalHeight', { value: height, configurable: true })
        this.onload?.()
      }, 0)
    },
    configurable: true,
  })
}

describe('useImageUpload', () => {
  it('초기 상태는 image가 null이고 error가 없다', () => {
    const { result } = renderHook(() => useImageUpload())
    expect(result.current.image).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('8000px 이하 이미지는 정상 로드된다', async () => {
    mockImageLoad(1920, 1080)
    const { result } = renderHook(() => useImageUpload())
    const file = makeImageFile(1920, 1080)

    await act(async () => {
      await result.current.handleFile(file)
      await new Promise(r => setTimeout(r, 50))
    })

    expect(result.current.error).toBeNull()
  })

  it('한 변이 8000px 초과 시 error가 설정되고 image는 null이다', async () => {
    mockImageLoad(9000, 1080)
    const { result } = renderHook(() => useImageUpload())
    const file = makeImageFile(9000, 1080)

    await act(async () => {
      await result.current.handleFile(file)
      await new Promise(r => setTimeout(r, 50))
    })

    expect(result.current.error).toMatch(/8[,.]?000/)
    expect(result.current.image).toBeNull()
  })

  it('clearImage 호출 시 초기 상태로 돌아간다', async () => {
    mockImageLoad(1920, 1080)
    const { result } = renderHook(() => useImageUpload())
    const file = makeImageFile(1920, 1080)

    await act(async () => {
      await result.current.handleFile(file)
      await new Promise(r => setTimeout(r, 50))
    })

    act(() => result.current.clearImage())
    expect(result.current.image).toBeNull()
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/useImageUpload.test.ts
```

Expected: FAIL

- [ ] **Step 3: `src/hooks/useImageUpload.ts` 작성**

```ts
import { useState } from 'react'

const MAX_DIMENSION = 8000

export type ImageUploadState = {
  image: HTMLImageElement | null
  dataUrl: string | null
  error: string | null
  handleFile: (file: File) => Promise<void>
  clearImage: () => void
}

export function useImageUpload(): ImageUploadState {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File): Promise<void> => {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => {
        const url = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
            setError(
              `이미지 크기가 너무 큽니다. 한 변이 8,000px를 초과할 수 없습니다. (현재: ${img.naturalWidth}×${img.naturalHeight}px)`
            )
            setImage(null)
            setDataUrl(null)
          } else {
            setError(null)
            setImage(img)
            setDataUrl(url)
          }
          resolve()
        }
        img.src = url
      }
      reader.readAsDataURL(file)
    })
  }

  const clearImage = () => {
    setImage(null)
    setDataUrl(null)
    setError(null)
  }

  return { image, dataUrl, error, handleFile, clearImage }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/useImageUpload.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useImageUpload.ts src/test/useImageUpload.test.ts
git commit -m "feat: add useImageUpload hook with 8000px dimension guard"
```

---

## Task 6: useImageTransform 훅

**Files:**
- Create: `src/hooks/useImageTransform.ts`
- Create: `src/test/useImageTransform.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// src/test/useImageTransform.test.ts
import { renderHook, act } from '@testing-library/react'
import { useImageTransform } from '../hooks/useImageTransform'

describe('useImageTransform', () => {
  it('초기 transform은 scale=1, offset=0이다', () => {
    const { result } = renderHook(() => useImageTransform())
    expect(result.current.transform).toEqual({ scale: 1, offsetX: 0, offsetY: 0 })
  })

  it('setScale이 scale을 업데이트한다', () => {
    const { result } = renderHook(() => useImageTransform())
    act(() => result.current.setScale(1.5))
    expect(result.current.transform.scale).toBe(1.5)
  })

  it('pan이 offset을 누적한다', () => {
    const { result } = renderHook(() => useImageTransform())
    act(() => result.current.pan(10, 20))
    expect(result.current.transform.offsetX).toBe(10)
    expect(result.current.transform.offsetY).toBe(20)
    act(() => result.current.pan(5, -5))
    expect(result.current.transform.offsetX).toBe(15)
    expect(result.current.transform.offsetY).toBe(15)
  })

  it('reset이 초기 상태로 돌린다', () => {
    const { result } = renderHook(() => useImageTransform())
    act(() => { result.current.setScale(2); result.current.pan(50, 50) })
    act(() => result.current.reset())
    expect(result.current.transform).toEqual({ scale: 1, offsetX: 0, offsetY: 0 })
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/useImageTransform.test.ts
```

- [ ] **Step 3: `src/hooks/useImageTransform.ts` 작성**

```ts
import { useState, useCallback } from 'react'
import type { ImageTransform } from '../types/frame'

const INITIAL: ImageTransform = { scale: 1, offsetX: 0, offsetY: 0 }

export function useImageTransform() {
  const [transform, setTransform] = useState<ImageTransform>(INITIAL)

  const setScale = useCallback((scale: number) => {
    setTransform(prev => ({ ...prev, scale }))
  }, [])

  const pan = useCallback((dx: number, dy: number) => {
    setTransform(prev => ({
      ...prev,
      offsetX: prev.offsetX + dx,
      offsetY: prev.offsetY + dy,
    }))
  }, [])

  const reset = useCallback(() => setTransform(INITIAL), [])

  return { transform, setScale, pan, reset }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/useImageTransform.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useImageTransform.ts src/test/useImageTransform.test.ts
git commit -m "feat: add useImageTransform hook"
```

---

## Task 7: useCompositor 훅

**Files:**
- Create: `src/hooks/useCompositor.ts`

- [ ] **Step 1: `src/hooks/useCompositor.ts` 작성**

```ts
import { useCallback, useRef } from 'react'
import type { Frame, ShadowConfig, ImageTransform, ExportScale } from '../types/frame'
import { drawComposite } from '../utils/compositor'

export type CompositorParams = {
  screenshot: HTMLImageElement | null
  frame: Frame | null
  transform: ImageTransform
  shadow: ShadowConfig
}

export function useCompositor(params: CompositorParams) {
  const frameImgCache = useRef<Map<string, HTMLImageElement>>(new Map())

  const loadFrameImage = useCallback((assetPath: string): Promise<HTMLImageElement> => {
    const cached = frameImgCache.current.get(assetPath)
    if (cached) return Promise.resolve(cached)

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        frameImgCache.current.set(assetPath, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = assetPath
    })
  }, [])

  const renderToCanvas = useCallback(
    async (canvas: HTMLCanvasElement, scale: ExportScale = 1): Promise<void> => {
      const { screenshot, frame, transform, shadow } = params
      if (!screenshot || !frame) return

      const frameImg = await loadFrameImage(frame.assetPath)
      drawComposite({ canvas, screenshot, frameImg, frame, transform, shadow, scale })
    },
    [params, loadFrameImage]
  )

  const exportPng = useCallback(
    async (scale: ExportScale): Promise<void> => {
      const { screenshot, frame, transform, shadow } = params
      if (!screenshot || !frame) return

      const canvas = document.createElement('canvas')
      const frameImg = await loadFrameImage(frame.assetPath)
      drawComposite({ canvas, screenshot, frameImg, frame, transform, shadow, scale })

      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `framed-${frame.id}-${scale}x.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    },
    [params, loadFrameImage]
  )

  return { renderToCanvas, exportPng }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useCompositor.ts
git commit -m "feat: add useCompositor hook"
```

---

## Task 8: Toast 컴포넌트

**Files:**
- Create: `src/components/Toast.tsx`
- Create: `src/test/Toast.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// src/test/Toast.test.tsx
import { render, screen } from '@testing-library/react'
import { Toast } from '../components/Toast'

describe('Toast', () => {
  it('message가 있으면 렌더링한다', () => {
    render(<Toast message="이미지가 너무 큽니다." onClose={() => {}} />)
    expect(screen.getByText('이미지가 너무 큽니다.')).toBeInTheDocument()
  })

  it('message가 null이면 렌더링하지 않는다', () => {
    const { container } = render(<Toast message={null} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/Toast.test.tsx
```

- [ ] **Step 3: `src/components/Toast.tsx` 작성**

```tsx
type ToastProps = {
  message: string | null
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3 text-sm text-white shadow-xl">
      <span>{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white text-lg leading-none">
        ×
      </button>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/Toast.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Toast.tsx src/test/Toast.test.tsx
git commit -m "feat: add Toast component"
```

---

## Task 9: UploadZone 컴포넌트

**Files:**
- Create: `src/components/UploadZone.tsx`
- Create: `src/test/UploadZone.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// src/test/UploadZone.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadZone } from '../components/UploadZone'

describe('UploadZone', () => {
  it('업로드 안내 텍스트를 렌더링한다', () => {
    render(<UploadZone onFile={() => {}} />)
    expect(screen.getByText(/드래그|클릭/i)).toBeInTheDocument()
  })

  it('파일 선택 시 onFile 콜백을 호출한다', async () => {
    const onFile = vi.fn()
    render(<UploadZone onFile={onFile} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File([''], 'test.png', { type: 'image/png' })
    await userEvent.upload(input, file)

    expect(onFile).toHaveBeenCalledWith(file)
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/UploadZone.test.tsx
```

- [ ] **Step 3: `src/components/UploadZone.tsx` 작성**

```tsx
import { useRef, useState } from 'react'

type UploadZoneProps = {
  onFile: (file: File) => void
}

export function UploadZone({ onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors ${
        dragging ? 'border-blue-400 bg-blue-950/30' : 'border-gray-700 hover:border-gray-500'
      }`}
    >
      <p className="text-gray-400 text-sm">
        클릭하거나 드래그해서 스크린샷 업로드
      </p>
      <p className="mt-1 text-gray-600 text-xs">PNG, JPG (최대 8,000px)</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/UploadZone.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/UploadZone.tsx src/test/UploadZone.test.tsx
git commit -m "feat: add UploadZone component with drag-and-drop"
```

---

## Task 10: FramePicker 컴포넌트

**Files:**
- Create: `src/components/FramePicker.tsx`
- Create: `src/test/FramePicker.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// src/test/FramePicker.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FramePicker } from '../components/FramePicker'
import { FRAMES } from '../data/frames'

describe('FramePicker', () => {
  it('디바이스 탭이 기본 선택되어 있다', () => {
    render(<FramePicker selectedId={null} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: '디바이스' })).toHaveClass('text-white')
  })

  it('디바이스 프레임 목록을 렌더링한다', () => {
    render(<FramePicker selectedId={null} onSelect={() => {}} />)
    const deviceFrames = FRAMES.filter(f => f.category === 'device')
    deviceFrames.forEach(f => {
      expect(screen.getByText(f.label)).toBeInTheDocument()
    })
  })

  it('브라우저 탭 클릭 시 브라우저 프레임을 보여준다', async () => {
    render(<FramePicker selectedId={null} onSelect={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: '브라우저' }))
    expect(screen.getByText('Chrome (Mac)')).toBeInTheDocument()
  })

  it('프레임 선택 시 onSelect 콜백을 호출한다', async () => {
    const onSelect = vi.fn()
    render(<FramePicker selectedId={null} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('MacBook Air'))
    expect(onSelect).toHaveBeenCalledWith(FRAMES.find(f => f.id === 'macbook-air'))
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/FramePicker.test.tsx
```

- [ ] **Step 3: `src/components/FramePicker.tsx` 작성**

```tsx
import { useState } from 'react'
import type { Frame, FrameCategory } from '../types/frame'
import { FRAMES } from '../data/frames'

type FramePickerProps = {
  selectedId: string | null
  onSelect: (frame: Frame) => void
}

export function FramePicker({ selectedId, onSelect }: FramePickerProps) {
  const [tab, setTab] = useState<FrameCategory>('device')

  const filtered = FRAMES.filter(f => f.category === tab)

  return (
    <div>
      <div className="flex gap-1 rounded-lg bg-gray-900 p-1 mb-3">
        {(['device', 'browser'] as FrameCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setTab(cat)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
              tab === cat ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {cat === 'device' ? '디바이스' : '브라우저'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filtered.map(frame => (
          <button
            key={frame.id}
            onClick={() => onSelect(frame)}
            className={`rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
              selectedId === frame.id
                ? 'border-blue-500 bg-blue-950/40 text-white'
                : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
            }`}
          >
            {frame.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/FramePicker.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/FramePicker.tsx src/test/FramePicker.test.tsx
git commit -m "feat: add FramePicker component with device/browser tabs"
```

---

## Task 11: ImageAdjust 컴포넌트

**Files:**
- Create: `src/components/ImageAdjust.tsx`
- Create: `src/test/ImageAdjust.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// src/test/ImageAdjust.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageAdjust } from '../components/ImageAdjust'

describe('ImageAdjust', () => {
  it('Scale 슬라이더를 렌더링한다', () => {
    render(<ImageAdjust scale={1} onScaleChange={() => {}} onReset={() => {}} />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('슬라이더 변경 시 onScaleChange를 호출한다', async () => {
    const onScaleChange = vi.fn()
    render(<ImageAdjust scale={1} onScaleChange={onScaleChange} onReset={() => {}} />)
    const slider = screen.getByRole('slider')
    await userEvent.type(slider, '{arrowright}')
    expect(onScaleChange).toHaveBeenCalled()
  })

  it('초기화 버튼 클릭 시 onReset을 호출한다', async () => {
    const onReset = vi.fn()
    render(<ImageAdjust scale={1.5} onScaleChange={() => {}} onReset={onReset} />)
    await userEvent.click(screen.getByRole('button', { name: /초기화/ }))
    expect(onReset).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/ImageAdjust.test.tsx
```

- [ ] **Step 3: `src/components/ImageAdjust.tsx` 작성**

```tsx
type ImageAdjustProps = {
  scale: number
  onScaleChange: (scale: number) => void
  onReset: () => void
}

export function ImageAdjust({ scale, onScaleChange, onReset }: ImageAdjustProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="w-10 text-xs text-gray-400">크기</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={scale}
          onChange={e => onScaleChange(Number(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <span className="w-10 text-right text-xs text-gray-500">{scale.toFixed(2)}x</span>
      </div>
      <p className="text-xs text-gray-600">미리보기 위에서 드래그해 위치를 조절할 수 있어요</p>
      <button
        onClick={onReset}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        초기화
      </button>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/ImageAdjust.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ImageAdjust.tsx src/test/ImageAdjust.test.tsx
git commit -m "feat: add ImageAdjust component with scale slider"
```

---

## Task 12: ShadowControls 컴포넌트

**Files:**
- Create: `src/components/ShadowControls.tsx`
- Create: `src/test/ShadowControls.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// src/test/ShadowControls.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShadowControls } from '../components/ShadowControls'
import type { ShadowConfig } from '../types/frame'

const defaultShadow: ShadowConfig = { enabled: false, color: '#000000', blur: 40, intensity: 50 }

describe('ShadowControls', () => {
  it('그림자 토글 버튼을 렌더링한다', () => {
    render(<ShadowControls value={defaultShadow} onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('disabled 상태에서 슬라이더가 비활성화된다', () => {
    render(<ShadowControls value={defaultShadow} onChange={() => {}} />)
    const sliders = screen.getAllByRole('slider')
    sliders.forEach(s => expect(s).toBeDisabled())
  })

  it('enabled 상태에서 슬라이더가 활성화된다', () => {
    const enabled: ShadowConfig = { ...defaultShadow, enabled: true }
    render(<ShadowControls value={enabled} onChange={() => {}} />)
    const sliders = screen.getAllByRole('slider')
    sliders.forEach(s => expect(s).not.toBeDisabled())
  })

  it('토글 클릭 시 onChange가 호출된다', async () => {
    const onChange = vi.fn()
    render(<ShadowControls value={defaultShadow} onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith({ ...defaultShadow, enabled: true })
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/ShadowControls.test.tsx
```

- [ ] **Step 3: `src/components/ShadowControls.tsx` 작성**

```tsx
import type { ShadowConfig } from '../types/frame'

type ShadowControlsProps = {
  value: ShadowConfig
  onChange: (config: ShadowConfig) => void
}

export function ShadowControls({ value, onChange }: ShadowControlsProps) {
  const update = (partial: Partial<ShadowConfig>) => onChange({ ...value, ...partial })

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={e => update({ enabled: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm text-gray-300">그림자</span>
      </label>

      <div className={`space-y-3 ${value.enabled ? '' : 'opacity-40 pointer-events-none'}`}>
        <SliderRow
          label="강도"
          value={value.intensity}
          min={0} max={100}
          disabled={!value.enabled}
          onChange={v => update({ intensity: v })}
        />
        <SliderRow
          label="블러"
          value={value.blur}
          min={0} max={100}
          disabled={!value.enabled}
          onChange={v => update({ blur: v })}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">색상</span>
          <input
            type="color"
            value={value.color}
            disabled={!value.enabled}
            onChange={e => update({ color: e.target.value })}
            className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}

function SliderRow(props: {
  label: string
  value: number
  min: number
  max: number
  disabled: boolean
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs text-gray-400">{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        disabled={props.disabled}
        onChange={e => props.onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="w-8 text-right text-xs text-gray-500">{props.value}</span>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/ShadowControls.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ShadowControls.tsx src/test/ShadowControls.test.tsx
git commit -m "feat: add ShadowControls component"
```

---

## Task 13: ExportControls 컴포넌트

**Files:**
- Create: `src/components/ExportControls.tsx`
- Create: `src/test/ExportControls.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// src/test/ExportControls.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportControls } from '../components/ExportControls'

describe('ExportControls', () => {
  it('1x/2x/3x 버튼을 렌더링한다', () => {
    render(<ExportControls onExport={() => {}} disabled={false} />)
    expect(screen.getByRole('button', { name: '1x' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2x' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3x' })).toBeInTheDocument()
  })

  it('저장 버튼을 렌더링한다', () => {
    render(<ExportControls onExport={() => {}} disabled={false} />)
    expect(screen.getByRole('button', { name: /저장/ })).toBeInTheDocument()
  })

  it('저장 클릭 시 선택된 스케일로 onExport를 호출한다', async () => {
    const onExport = vi.fn()
    render(<ExportControls onExport={onExport} disabled={false} />)
    await userEvent.click(screen.getByRole('button', { name: '2x' }))
    await userEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(onExport).toHaveBeenCalledWith(2)
  })

  it('disabled 상태에서 저장 버튼이 비활성화된다', () => {
    render(<ExportControls onExport={() => {}} disabled={true} />)
    expect(screen.getByRole('button', { name: /저장/ })).toBeDisabled()
  })
})
```

- [ ] **Step 2: 테스트 실행 확인 (FAIL)**

```bash
npx vitest run src/test/ExportControls.test.tsx
```

- [ ] **Step 3: `src/components/ExportControls.tsx` 작성**

```tsx
import { useState } from 'react'
import type { ExportScale } from '../types/frame'

type ExportControlsProps = {
  onExport: (scale: ExportScale) => void
  disabled: boolean
}

const SCALES: ExportScale[] = [1, 2, 3]

export function ExportControls({ onExport, disabled }: ExportControlsProps) {
  const [scale, setScale] = useState<ExportScale>(2)

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 rounded-lg bg-gray-900 p-1">
        {SCALES.map(s => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              scale === s ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
      <button
        onClick={() => onExport(scale)}
        disabled={disabled}
        className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        PNG 저장
      </button>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/ExportControls.test.tsx
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ExportControls.tsx src/test/ExportControls.test.tsx
git commit -m "feat: add ExportControls component with 1x/2x/3x selection"
```

---

## Task 14: PreviewCanvas 컴포넌트

**Files:**
- Create: `src/components/PreviewCanvas.tsx`

- [ ] **Step 1: `src/components/PreviewCanvas.tsx` 작성**

```tsx
import { useEffect, useRef, useCallback } from 'react'
import type { Frame, ShadowConfig, ImageTransform } from '../types/frame'
import { useCompositor } from '../hooks/useCompositor'

type PreviewCanvasProps = {
  screenshot: HTMLImageElement | null
  frame: Frame | null
  transform: ImageTransform
  shadow: ShadowConfig
  onPan: (dx: number, dy: number) => void
}

export function PreviewCanvas({ screenshot, frame, transform, shadow, onPan }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { renderToCanvas } = useCompositor({ screenshot, frame, transform, shadow })
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    renderToCanvas(canvasRef.current, 1)
  }, [renderToCanvas])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    dragStart.current = { x: e.clientX, y: e.clientY }
    onPan(dx, dy)
  }, [onPan])

  const handleMouseUp = useCallback(() => {
    dragStart.current = null
  }, [])

  if (!screenshot || !frame) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-gray-800 bg-gray-950">
        <p className="text-gray-600 text-sm">프레임과 스크린샷을 선택하면 미리보기가 나타납니다</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center rounded-2xl border border-gray-800 bg-[url('/checkerboard.svg')] bg-repeat p-4 overflow-auto">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain shadow-2xl cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PreviewCanvas.tsx
git commit -m "feat: add PreviewCanvas component"
```

---

## Task 15: App 레이아웃 조합

**Files:**
- Modify: `src/App.tsx`
- Create: `public/checkerboard.svg`

- [ ] **Step 1: 투명 배경 체커보드 SVG 생성 (`public/checkerboard.svg`)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
  <rect width="8" height="8" fill="#333"/>
  <rect x="8" y="8" width="8" height="8" fill="#333"/>
  <rect x="8" width="8" height="8" fill="#222"/>
  <rect y="8" width="8" height="8" fill="#222"/>
</svg>
```

- [ ] **Step 2: `src/App.tsx` 작성**

```tsx
import { useState, useCallback } from 'react'
import type { Frame, ShadowConfig, ExportScale } from './types/frame'
import { useImageUpload } from './hooks/useImageUpload'
import { useImageTransform } from './hooks/useImageTransform'
import { useCompositor } from './hooks/useCompositor'
import { UploadZone } from './components/UploadZone'
import { FramePicker } from './components/FramePicker'
import { ImageAdjust } from './components/ImageAdjust'
import { ShadowControls } from './components/ShadowControls'
import { ExportControls } from './components/ExportControls'
import { PreviewCanvas } from './components/PreviewCanvas'
import { Toast } from './components/Toast'

const DEFAULT_SHADOW: ShadowConfig = {
  enabled: false,
  color: '#000000',
  blur: 40,
  intensity: 50,
}

export default function App() {
  const { image, error, handleFile, clearImage } = useImageUpload()
  const { transform, setScale, pan, reset: resetTransform } = useImageTransform()
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [shadow, setShadow] = useState<ShadowConfig>(DEFAULT_SHADOW)

  const { exportPng } = useCompositor({
    screenshot: image,
    frame: selectedFrame,
    transform,
    shadow,
  })

  const onFile = useCallback((file: File) => { handleFile(file) }, [handleFile])
  const handleExport = useCallback((scale: ExportScale) => { exportPng(scale) }, [exportPng])

  // 프레임 변경 시 transform 초기화
  const handleFrameSelect = useCallback((frame: Frame) => {
    setSelectedFrame(frame)
    resetTransform()
  }, [resetTransform])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Screenshot Framer</h1>
      </header>

      <main className="mx-auto max-w-7xl p-6 grid grid-cols-[320px_1fr] gap-6 h-[calc(100vh-65px)]">
        {/* 사이드바 */}
        <aside className="flex flex-col gap-5 overflow-y-auto">
          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              스크린샷
            </h2>
            {image ? (
              <div className="flex items-center justify-between rounded-xl border border-gray-800 px-3 py-2 text-sm">
                <span className="text-gray-300 truncate">업로드 완료</span>
                <button onClick={clearImage} className="text-gray-500 hover:text-gray-300 ml-2">×</button>
              </div>
            ) : (
              <UploadZone onFile={onFile} />
            )}
          </section>

          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              프레임
            </h2>
            <FramePicker selectedId={selectedFrame?.id ?? null} onSelect={handleFrameSelect} />
          </section>

          {image && selectedFrame && (
            <section>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                이미지 조정
              </h2>
              <ImageAdjust
                scale={transform.scale}
                onScaleChange={setScale}
                onReset={resetTransform}
              />
            </section>
          )}

          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              그림자
            </h2>
            <ShadowControls value={shadow} onChange={setShadow} />
          </section>

          <section className="mt-auto">
            <ExportControls
              onExport={handleExport}
              disabled={!image || !selectedFrame}
            />
          </section>
        </aside>

        {/* 미리보기 */}
        <PreviewCanvas
          screenshot={image}
          frame={selectedFrame}
          transform={transform}
          shadow={shadow}
          onPan={pan}
        />
      </main>

      <Toast message={error} onClose={clearImage} />
    </div>
  )
}
```

- [ ] **Step 3: 개발 서버 실행 후 수동 확인**

```bash
npm run dev
```

확인 항목:
1. 스크린샷 업로드 (드래그앤드롭 + 파일 선택)
2. 8,000px 초과 이미지 차단 확인
3. 프레임 선택 → 미리보기 반영
4. 그림자 토글/슬라이더 동작
5. PNG 저장 버튼 (1x/2x/3x)

- [ ] **Step 4: 전체 테스트 통과 확인**

```bash
npx vitest run
```

Expected: 모든 테스트 PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx public/checkerboard.svg
git commit -m "feat: compose App layout with all components"
```

---

## Task 16: 프레임 에셋 배치 안내

**Files:**
- Create: `src/assets/frames/` (디렉토리)

- [ ] **Step 1: 에셋 디렉토리 생성 및 README 작성**

```bash
mkdir -p public/frames
```

- [ ] **Step 2: 에셋 파일 배치**

사용자가 제공한 PNG 파일을 `public/frames/`에 아래 이름으로 저장:

| 파일명 | 설명 |
|--------|------|
| `macbook-pro-16.png` | MacBook Pro 16 프레임 |
| `iphone-15.png` | iPhone 15 프레임 |
| `chrome-mac.png` | Chrome (Mac) 브라우저 프레임 |
| `safari-mac.png` | Safari (Mac) 브라우저 프레임 |

- [ ] **Step 3: `src/data/frames.ts`의 `screenArea` 좌표를 실제 에셋 기준으로 수정**

각 에셋을 이미지 편집 도구로 열어 스크린 영역의 실제 픽셀 좌표(x, y, width, height)를 측정 후 `frames.ts` 수정.

- [ ] **Step 4: Commit**

```bash
git add public/frames/ src/data/frames.ts
git commit -m "feat: add frame assets and adjust screenArea coordinates"
```

---

## 전체 테스트 실행

```bash
npx vitest run
```

모든 테스트 PASS 확인 후 배포 준비 완료.
