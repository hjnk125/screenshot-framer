# App Store Screenshots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 앱스토어 제출용 6.7형(1290×2796) 스크린샷을 만드는 `appstore` 카테고리를 추가한다.

**Architecture:** `FrameCategory`에 `"appstore"` 추가. `ScreenArea`에 `rotation?` 필드 추가. 새 `drawAppStoreComposite` 함수가 배경 전체 채움 + 회전 clip + 고정 크기(1290×2796) export를 담당한다. `computeEffectiveScale` / `calculateOutputSize`는 appstore 분기를 추가하고, FramePicker에 App Store 탭을 추가한다.

**Tech Stack:** TypeScript, React, Canvas 2D API, Vitest

---

## 파일 구조

| 파일 | 변경 종류 | 내용 |
|---|---|---|
| `src/types/frame.ts` | Modify | FrameCategory에 `"appstore"`, ScreenArea에 `rotation?`, AppStoreMeta 추가 |
| `src/data/frames.ts` | Modify | appstore 프레임 6개 추가 |
| `src/utils/compositor.ts` | Modify | drawAppStoreComposite, rotation 지원, appstore 분기 |
| `src/components/FramePicker.tsx` | Modify | App Store 탭 추가 |
| `src/App.tsx` | Modify | appstore 카테고리 섹션 라벨 조정 |
| `src/test/compositor.test.ts` | Modify | appstore scale/size 테스트 |
| `src/test/frames.test.ts` | Modify | appstore 프레임 메타데이터 테스트 |

---

## Task 1: 타입 정의

**Files:**
- Modify: `src/types/frame.ts`

- [ ] **Step 1: `FrameCategory`, `ScreenArea`, `AppStoreMeta`, `Frame` 타입 수정**

`src/types/frame.ts` 전체를 아래로 교체:

```typescript
export type FrameCategory = "device" | "browser" | "appstore";

export type TabArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  fontSize: number;
  faviconX: number;
  faviconY: number;
  faviconSize: number;
  textOffsetX: number;
  textOffsetY?: number;
};

export type BrowserFrameMeta = {
  contentBg: string;
  contentRadius: number;
  urlBar: {
    x: number;
    y: number;
    width: number;
    height: number;
    bgColor: string;
    textColor: string;
    fontSize: number;
    align: "left" | "center";
  };
  tabArea?: TabArea;
  defaultFaviconPath?: string;
};

export type BrowserState = {
  url: string;
  title: string;
  favicon: HTMLImageElement | null;
};

export type ScreenArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  roundCorners: "TOP" | "BOTTOM" | "ALL";
  rotation?: number; // degrees, clockwise. 0 or undefined = upright
};

export type AppStoreMeta = {
  canvasWidth: number;
  canvasHeight: number;
};

export type Frame = {
  id: string;
  label: string;
  category: FrameCategory;
  assetPath: string;
  assetPath2x?: string;
  screenArea: ScreenArea;
  aspectRatio: number;
  noUpscale?: boolean;
  browserMeta?: BrowserFrameMeta;
  appstoreMeta?: AppStoreMeta;
  shortToolbar?: {
    assetPath: string;
    browserMeta: BrowserFrameMeta;
  };
};

export type ShadowConfig = {
  enabled: boolean;
  opacity: number;
};

export type ImageTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type ExportScale = number;

export type DeviceBgType = "transparent" | "white" | "black" | "image";

export type DeviceBgConfig = {
  type: DeviceBgType;
  image: HTMLImageElement | null;
};
```

- [ ] **Step 2: 타입 컴파일 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 기존 테스트 통과 확인**

```bash
npm run test
```

Expected: All tests pass

- [ ] **Step 4: 커밋**

```bash
git add src/types/frame.ts
git commit -m "feat: FrameCategory에 appstore 추가, ScreenArea rotation 필드 추가, AppStoreMeta 타입 신규"
```

---

## Task 2: 프레임 데이터 — screenArea 측정 및 등록

**Files:**
- Modify: `src/data/frames.ts`
- Modify: `src/test/frames.test.ts`

### screenArea 좌표 측정 (appstore-67-a, b)

- [ ] **Step 1: 브라우저 콘솔에서 white area 측정 스크립트 실행**

앱을 `npm run dev`로 실행 후 브라우저 콘솔에 아래 붙여넣기:

```javascript
async function measureWhiteArea(src) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (d[i] > 240 && d[i+1] > 240 && d[i+2] > 240 && d[i+3] > 200) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

// 아래 두 줄 각각 실행
measureWhiteArea('/frames/appstore/appstore-67-full.png').then(r => console.log('full:', JSON.stringify(r)));
measureWhiteArea('/frames/appstore/appstore-67-offset.png').then(r => console.log('offset:', JSON.stringify(r)));
```

측정 결과를 기록. (upright 프레임만 정확; 틸트 프레임은 Step 2 참조)

- [ ] **Step 2: 틸트 프레임(c1, c2, d1, d2) center 추정**

틸트 프레임은 rotation이 ±30°이므로 흰 영역 바운딩박스가 실제 screenArea와 다름. 아래 스크립트로 흰 영역 무게중심을 구한다:

```javascript
async function measureCenter(src) {
  const img = await new Promise((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let sx=0, sy=0, n=0;
  for (let y=0; y<c.height; y++) {
    for (let x=0; x<c.width; x++) {
      const i=(y*c.width+x)*4;
      if (d[i]>240&&d[i+1]>240&&d[i+2]>240&&d[i+3]>200) { sx+=x; sy+=y; n++; }
    }
  }
  return { cx: Math.round(sx/n), cy: Math.round(sy/n), pixels: n };
}
['tilt-a1','tilt-a2','tilt-b1','tilt-b2'].forEach(name =>
  measureCenter(`/frames/appstore/appstore-67-${name}.png`).then(r =>
    console.log(`${name}:`, JSON.stringify(r))
  )
);
```

무게중심 cx, cy를 이용해 screenArea를 역산한다:

```
// 틸트 프레임 screenArea 역산 공식
// (stepWidth, stepHeight 는 upright 프레임에서 측정한 screen width, height)
x = cx - screenWidth / 2
y = cy - screenHeight / 2
```

> **참고:** 무게중심은 canvas에 보이는 픽셀만 대상이라 screenArea center와 완벽히 일치하지 않을 수 있음. 구현 후 프리뷰를 보면서 x, y를 ±50px 범위에서 조정.

- [ ] **Step 3: frames.ts에 appstore 엔트리 6개 추가**

`src/data/frames.ts` 파일 끝 `getFrameById` 함수 위에 추가:

```typescript
// ── App Store 6.5형 ────────────────────────────────────────────────────────
// screenArea 값은 measureWhiteArea / measureCenter 스크립트 결과로 업데이트 필요.
// rotation=0 프레임(a, b)은 콘솔 측정값으로 직접 교체.
// rotation≠0 프레임(c1,c2,d1,d2)은 무게중심 역산 후 프리뷰에서 확인/조정.
{
  id: "appstore-67-a",
  label: "6.7\" Full",
  category: "appstore",
  assetPath: "/frames/appstore/appstore-67-full.png",
  screenArea: {
    x: 57,        // ← measureWhiteArea 결과로 교체
    y: 120,       // ← measureWhiteArea 결과로 교체
    width: 1128,  // ← measureWhiteArea 결과로 교체
    height: 2453, // ← measureWhiteArea 결과로 교체
    radius: 170,
    roundCorners: "ALL",
  },
  aspectRatio: 1290 / 2796,
  appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 },
},
{
  id: "appstore-67-b",
  label: "6.7\" Offset",
  category: "appstore",
  assetPath: "/frames/appstore/appstore-67-offset.png",
  screenArea: {
    x: 57,         // ← measureWhiteArea 결과로 교체
    y: 640,        // ← measureWhiteArea 결과로 교체
    width: 1128,   // ← measureWhiteArea 결과로 교체
    height: 2453,  // screen이 canvas 아래로 넘어가는 것은 정상
    radius: 170,
    roundCorners: "ALL",
  },
  aspectRatio: 1290 / 2796,
  appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 },
},
{
  id: "appstore-67-c1",
  label: "6.7\" Tilt A-1",
  category: "appstore",
  assetPath: "/frames/appstore/appstore-67-tilt-a1.png",
  screenArea: {
    x: 384,    // ← measureCenter 역산 후 조정
    y: 721,    // ← measureCenter 역산 후 조정
    width: 1128,
    height: 2453,
    radius: 170,
    roundCorners: "ALL",
    rotation: -30,
  },
  aspectRatio: 1290 / 2796,
  appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 },
},
{
  id: "appstore-67-c2",
  label: "6.7\" Tilt A-2",
  category: "appstore",
  assetPath: "/frames/appstore/appstore-67-tilt-a2.png",
  screenArea: {
    x: -216,  // ← 음수 가능 (canvas 밖으로 나감)
    y: -729,  // ← measureCenter 역산 후 조정
    width: 1128,
    height: 2453,
    radius: 170,
    roundCorners: "ALL",
    rotation: -30,
  },
  aspectRatio: 1290 / 2796,
  appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 },
},
{
  id: "appstore-67-d1",
  label: "6.7\" Tilt B-1",
  category: "appstore",
  assetPath: "/frames/appstore/appstore-67-tilt-b1.png",
  screenArea: {
    x: 634,   // ← measureCenter 역산 후 조정
    y: 71,    // ← measureCenter 역산 후 조정
    width: 1128,
    height: 2453,
    radius: 170,
    roundCorners: "ALL",
    rotation: 30,
  },
  aspectRatio: 1290 / 2796,
  appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 },
},
{
  id: "appstore-67-d2",
  label: "6.7\" Tilt B-2",
  category: "appstore",
  assetPath: "/frames/appstore/appstore-67-tilt-b2.png",
  screenArea: {
    x: -166,  // ← measureCenter 역산 후 조정
    y: 971,   // ← measureCenter 역산 후 조정
    width: 1128,
    height: 2453,
    radius: 170,
    roundCorners: "ALL",
    rotation: 30,
  },
  aspectRatio: 1290 / 2796,
  appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 },
},
```

- [ ] **Step 4: frames.test.ts에 appstore 테스트 추가**

`src/test/frames.test.ts` 끝에 추가:

```typescript
describe("App Store 프레임", () => {
  const appstoreFrames = FRAMES.filter((f) => f.category === "appstore");

  it("appstore 프레임이 6개 정의되어 있다", () => {
    expect(appstoreFrames).toHaveLength(6);
  });

  it("모든 appstore 프레임에 appstoreMeta가 정의되어 있다", () => {
    appstoreFrames.forEach((f) => {
      expect(f.appstoreMeta).toBeDefined();
      expect(f.appstoreMeta?.canvasWidth).toBe(1242);
      expect(f.appstoreMeta?.canvasHeight).toBe(2688);
    });
  });

  it("모든 appstore 프레임의 aspectRatio가 1242/2688이다", () => {
    appstoreFrames.forEach((f) => {
      expect(f.aspectRatio).toBeCloseTo(1242 / 2688, 4);
    });
  });

  it("appstore 프레임의 screenArea width/height가 양수이다", () => {
    appstoreFrames.forEach((f) => {
      expect(f.screenArea.width).toBeGreaterThan(0);
      expect(f.screenArea.height).toBeGreaterThan(0);
    });
  });

  it("틸트 프레임(c1, c2, d1, d2)에 rotation이 설정되어 있다", () => {
    const tiltIds = ["appstore-67-c1", "appstore-67-c2", "appstore-67-d1", "appstore-67-d2"];
    tiltIds.forEach((id) => {
      const f = FRAMES.find((fr) => fr.id === id);
      expect(f?.screenArea.rotation).toBeDefined();
      expect(Math.abs(f!.screenArea.rotation!)).toBe(30);
    });
  });

  it("정면 프레임(a, b)은 rotation이 없다", () => {
    ["appstore-67-a", "appstore-67-b"].forEach((id) => {
      const f = FRAMES.find((fr) => fr.id === id);
      expect(f?.screenArea.rotation ?? 0).toBe(0);
    });
  });
});
```

- [ ] **Step 5: 테스트 실행**

```bash
npm run test
```

Expected: 새로 추가한 appstore 테스트 6개 모두 PASS

- [ ] **Step 6: 커밋**

```bash
git add src/data/frames.ts src/test/frames.test.ts
git commit -m "feat: App Store 6.5형 프레임 6종 데이터 추가"
```

---

## Task 3: Compositor — AppStore 렌더링

**Files:**
- Modify: `src/utils/compositor.ts`
- Modify: `src/test/compositor.test.ts`

- [ ] **Step 1: compositor.test.ts import 업데이트 및 appstore 테스트 추가**

`src/test/compositor.test.ts` 파일 상단 import를 아래로 교체:

```typescript
import { calculateCanvasSize, computeEffectiveScale, calculateOutputSize } from "../utils/compositor";
import type { Frame, ShadowConfig } from "../types/frame";
```

그리고 파일 끝에 추가:

```typescript
function makeAppStoreFrame(overrides: Partial<Frame> = {}): Frame {
  return {
    id: "appstore-67-a",
    label: "6.7\" Full",
    category: "appstore",
    assetPath: "/frames/appstore/appstore-67-a.png",
    screenArea: { x: 57, y: 120, width: 1128, height: 2453, radius: 170, roundCorners: "ALL" },
    aspectRatio: 1290 / 2796,
    appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 },
    ...overrides,
  } as Frame;
}

describe("computeEffectiveScale — appstore", () => {
  it("appstore 프레임은 스크린샷 크기에 관계없이 1.0을 반환한다", () => {
    const frame = makeAppStoreFrame();
    const frameImg = makeFrameImg(1242, 2688);
    expect(computeEffectiveScale(makeScreenshot(1128, 2453), frame, frameImg)).toBe(1.0);
    expect(computeEffectiveScale(makeScreenshot(500, 1000), frame, frameImg)).toBe(1.0);
    expect(computeEffectiveScale(makeScreenshot(5000, 10000), frame, frameImg)).toBe(1.0);
  });
});

describe("calculateOutputSize — appstore", () => {
  it("appstore 프레임은 항상 canvasWidth×canvasHeight를 반환한다", () => {
    const frame = makeAppStoreFrame();
    const frameImg = makeFrameImg(1242, 2688);
    const screenshot = makeScreenshot(1128, 2453);
    const shadow: ShadowConfig = { enabled: false, opacity: 100 };
    expect(calculateOutputSize(screenshot, frame, frameImg, shadow)).toEqual({
      width: 1242,
      height: 2688,
    });
  });

  it("shadow enabled여도 appstore는 크기가 고정된다", () => {
    const frame = makeAppStoreFrame();
    const frameImg = makeFrameImg(1242, 2688);
    const screenshot = makeScreenshot(1128, 2453);
    const shadow: ShadowConfig = { enabled: true, opacity: 100 };
    expect(calculateOutputSize(screenshot, frame, frameImg, shadow)).toEqual({
      width: 1242,
      height: 2688,
    });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test
```

Expected: FAIL — `computeEffectiveScale` appstore 케이스와 `calculateOutputSize` appstore 케이스가 실패

- [ ] **Step 3: `computeEffectiveScale`에 appstore 분기 추가**

`src/utils/compositor.ts`의 `computeEffectiveScale` 함수를:

```typescript
export function computeEffectiveScale(
  screenshot: HTMLImageElement,
  frame: Frame,
  frameImg: HTMLImageElement,
): number {
  if (frame.appstoreMeta) return 1.0;
  const screenW = frame.browserMeta
    ? frameImg.naturalWidth
    : frame.screenArea.width;
  const naturalScale = screenshot.naturalWidth / screenW;
  return frame.noUpscale ? Math.min(naturalScale, 1.0) : naturalScale;
}
```

- [ ] **Step 4: `calculateOutputSize`에 appstore 분기 추가**

`src/utils/compositor.ts`의 `calculateOutputSize` 함수를:

```typescript
export function calculateOutputSize(
  screenshot: HTMLImageElement,
  frame: Frame,
  frameImg: HTMLImageElement,
  shadow: ShadowConfig,
): CanvasSize {
  if (frame.appstoreMeta) {
    return {
      width: frame.appstoreMeta.canvasWidth,
      height: frame.appstoreMeta.canvasHeight,
    };
  }
  const assetW = frameImg.naturalWidth;
  const assetH = frameImg.naturalHeight;
  const s = computeEffectiveScale(screenshot, frame, frameImg);
  const pad = shadow.enabled ? SHADOW_PADDING * 2 : 0;

  if (frame.browserMeta) {
    const toolbarH = frameImg.naturalHeight;
    const contentH = Math.round(
      (assetW * screenshot.naturalHeight) / screenshot.naturalWidth,
    );
    return {
      width: Math.round((assetW + pad) * s),
      height: Math.round((toolbarH + contentH + pad) * s),
    };
  }

  return {
    width: Math.round((assetW + pad) * s),
    height: Math.round((assetH + pad) * s),
  };
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
npm run test
```

Expected: PASS

- [ ] **Step 6: `drawScreenshot`에 rotation 지원 추가**

기존 `drawScreenshot` 함수를 아래로 교체:

```typescript
function drawScreenshot(
  ctx: CanvasRenderingContext2D,
  screenshot: HTMLImageElement,
  screenArea: ScreenArea,
  transform: ImageTransform,
  fitMode: "cover" | "width" = "cover",
): void {
  const { x, y, width: sw, height: sh, radius = 0, roundCorners, rotation = 0 } = screenArea;
  const { scale, offsetX, offsetY } = transform;

  const imgW = screenshot.naturalWidth;
  const imgH = screenshot.naturalHeight;

  const baseScale =
    fitMode === "cover" ? Math.max(sw / imgW, sh / imgH) : sw / imgW;

  const drawW = imgW * baseScale * scale;
  const drawH = imgH * baseScale * scale;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (rotation !== 0) {
    // Rotate around the center of the screen area
    ctx.translate(x + sw / 2, y + sh / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-sw / 2, -sh / 2);
    // Origin is now at top-left of the (unrotated) screen area
    ctx.beginPath();
    if (radius > 0 && ctx.roundRect) {
      ctx.roundRect(0, 0, sw, sh, radius);
    } else {
      ctx.rect(0, 0, sw, sh);
    }
    ctx.clip();
    ctx.drawImage(
      screenshot,
      (sw - drawW) / 2 + offsetX,
      (sh - drawH) / 2 + offsetY,
      drawW,
      drawH,
    );
  } else {
    ctx.beginPath();
    if (radius > 0 && ctx.roundRect) {
      const radii =
        roundCorners === "BOTTOM"
          ? [0, 0, radius, radius]
          : roundCorners === "TOP"
            ? [radius, radius, 0, 0]
            : radius;
      ctx.roundRect(x, y, sw, sh, radii);
    } else {
      ctx.rect(x, y, sw, sh);
    }
    ctx.clip();
    ctx.drawImage(
      screenshot,
      x + (sw - drawW) / 2 + offsetX,
      y + (sh - drawH) / 2 + offsetY,
      drawW,
      drawH,
    );
  }

  ctx.restore();
}
```

- [ ] **Step 7: `drawAppStoreComposite` 함수 추가**

`drawBrowserComposite` 함수 바로 위에 추가:

```typescript
function drawAppStoreBg(
  ctx: CanvasRenderingContext2D,
  bg: DeviceBgConfig,
  w: number,
  h: number,
): void {
  if (bg.type === "transparent") return;
  ctx.save();
  if (bg.type === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "black") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
  } else if (bg.type === "image" && bg.image) {
    const { naturalWidth: iw, naturalHeight: ih } = bg.image;
    const bgScale = Math.max(w / iw, h / ih);
    const dw = iw * bgScale;
    const dh = ih * bgScale;
    ctx.drawImage(bg.image, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
  ctx.restore();
}

function drawAppStoreComposite(params: DrawCompositeParams): void {
  const { canvas, screenshot, frameImg, frame, transform, shadow, deviceBg } = params;
  const { appstoreMeta } = frame;
  if (!appstoreMeta) return;

  const { canvasWidth: w, canvasHeight: h } = appstoreMeta;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, h);

  // 1. Background — 전체 캔버스 채움
  if (deviceBg) {
    drawAppStoreBg(ctx, deviceBg, w, h);
  }

  // 2. Screenshot — rotation 포함 screenArea clip
  drawScreenshot(ctx, screenshot, frame.screenArea, transform, "cover");

  // 3. Shadow — ctx.shadow* 설정 후 프레임 이미지 그림 (캔버스 내부 클립됨)
  if (shadow.enabled) {
    const layers = buildShadowLayers(shadow);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = w;
    shadowCanvas.height = h;
    const sCtx = shadowCanvas.getContext("2d")!;
    for (const layer of layers) {
      sCtx.save();
      sCtx.shadowColor = layer.color;
      sCtx.shadowBlur = layer.blur;
      sCtx.shadowOffsetX = layer.offsetX;
      sCtx.shadowOffsetY = layer.offsetY;
      sCtx.drawImage(frameImg, 0, 0, w, h);
      sCtx.restore();
    }
    ctx.drawImage(shadowCanvas, 0, 0);
  }

  // 4. Frame overlay — 1:1
  ctx.drawImage(frameImg, 0, 0, w, h);
}
```

- [ ] **Step 8: `drawComposite`에 appstore 분기 추가**

```typescript
export function drawComposite(params: DrawCompositeParams): void {
  if (params.frame.appstoreMeta) {
    drawAppStoreComposite(params);
  } else if (params.frame.browserMeta) {
    drawBrowserComposite(params);
  } else {
    drawDeviceComposite(params);
  }
}
```

- [ ] **Step 9: 전체 테스트 통과 확인**

```bash
npm run test
```

Expected: All tests pass

- [ ] **Step 10: 커밋**

```bash
git add src/utils/compositor.ts src/test/compositor.test.ts
git commit -m "feat: AppStore 렌더링 추가 — rotation screenArea, 고정 캔버스, 전체 배경 채움"
```

---

## Task 4: FramePicker — App Store 탭

**Files:**
- Modify: `src/components/FramePicker.tsx`

- [ ] **Step 1: 탭 배열에 "appstore" 추가**

`src/components/FramePicker.tsx`에서 세그먼트 컨트롤 부분:

```tsx
{(["device", "browser", "appstore"] as FrameCategory[]).map((cat) => (
  <button
    key={cat}
    onClick={() => setTab(cat)}
    className={`flex-1 rounded-[7px] py-[7px] text-[12px] font-semibold transition-colors ${
      tab === cat
        ? "bg-ink text-white"
        : "bg-transparent text-soft hover:text-ink"
    }`}
  >
    {cat === "device" ? "Device" : cat === "browser" ? "Browser" : "App Store"}
  </button>
))}
```

- [ ] **Step 2: 개발 서버에서 육안 확인**

`npm run dev` 실행 후:
1. Frame 섹션에 "Device / Browser / App Store" 세 탭이 보인다
2. App Store 탭 클릭 시 6개 프레임 버튼이 나타난다 (6.5" Full, 6.5" Offset, 6.5" Tilt A-1 등)
3. 프레임 선택 시 프리뷰 캔버스에 렌더링이 시도된다

- [ ] **Step 3: 커밋**

```bash
git add src/components/FramePicker.tsx
git commit -m "feat: FramePicker에 App Store 탭 추가"
```

---

## Task 5: App.tsx — 컨트롤 섹션 라벨

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Device 섹션 라벨을 category에 따라 분기**

`src/App.tsx`에서 `{/* 4b. Device controls */}` 블록의 라벨 `<span>`을:

```tsx
<span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
  {selectedFrame.category === "appstore" ? "Background" : "Device"}
</span>
```

- [ ] **Step 2: 육안 확인**

1. Device 프레임 선택 → 섹션 라벨 "Device"
2. App Store 프레임 선택 → 섹션 라벨 "Background"

- [ ] **Step 3: 커밋**

```bash
git add src/App.tsx
git commit -m "feat: App Store 프레임 선택 시 Device 섹션 라벨을 Background로 표시"
```

---

## Task 6: 시각 검증 및 screenArea 좌표 보정

**Files:**
- Modify: `src/data/frames.ts` (좌표 보정)

- [ ] **Step 1: 정면 프레임(a, b) 검증**

`npm run dev` 후:
1. App Store 탭 → `6.5" Full` 선택
2. 스크린샷 업로드 (아무 이미지)
3. 프리뷰에서 스크린샷이 폰 화면 내부에 정확히 표시되는지 확인
4. Export PNG 후 1242×2688 파일 확인
5. `6.5" Offset` 반복

불일치 시 `src/data/frames.ts`의 해당 프레임 screenArea `x`, `y`, `width`, `height` 수정 후 재확인.

- [ ] **Step 2: 틸트 프레임(c1, c2, d1, d2) 검증**

각 프레임 선택 후:
1. 스크린샷이 기울어진 폰 화면 내부에 표시되는지 확인
2. 스크린샷이 프레임 외곽으로 넘쳐 보이면 `x`, `y` 조정
3. ±50px 단위로 조정하며 정렬 확인

- [ ] **Step 3: Export 확인**

각 프레임:
1. Export PNG 클릭
2. 파일 크기 확인 — 정확히 1242×2688
3. 배경 색상 변경 (White/Black/Image) 후 재확인

- [ ] **Step 4: 좌표 보정 후 커밋**

```bash
git add src/data/frames.ts
git commit -m "fix: App Store 프레임 screenArea 좌표 보정"
```

---

## 완료 체크리스트

- [ ] `npm run test` — All pass
- [ ] App Store 탭이 3번째 탭으로 나타남
- [ ] 6개 프레임 모두 선택 가능
- [ ] 정면 프레임(a, b): 스크린샷이 폰 화면에 정확히 배치됨
- [ ] 틸트 프레임(c1~d2): 스크린샷이 기울어진 화면에 올바르게 clip됨
- [ ] Export PNG가 항상 1242×2688
- [ ] Background None/White/Black/Image 전체 작동
- [ ] Shadow ON/OFF 작동 (캔버스 크기 변화 없음)
- [ ] `npx tsc --noEmit` — 에러 없음
