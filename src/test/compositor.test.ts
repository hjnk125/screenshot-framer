import { calculateCanvasSize, computeEffectiveScale, calculateOutputSize } from "../utils/compositor";
import type { Frame, ShadowConfig } from "../types/frame";

describe("calculateCanvasSize", () => {
  it("1x 스케일에서 에셋 기준 캔버스 크기를 반환한다", () => {
    const result = calculateCanvasSize(1500, 950, 1);
    expect(result).toEqual({ width: 1500, height: 950 });
  });

  it("2x 스케일에서 두 배 크기를 반환한다", () => {
    const result = calculateCanvasSize(1500, 950, 2);
    expect(result).toEqual({ width: 3000, height: 1900 });
  });

  it("3x 스케일에서 세 배 크기를 반환한다", () => {
    const result = calculateCanvasSize(1500, 950, 3);
    expect(result).toEqual({ width: 4500, height: 2850 });
  });
});

function makeScreenshot(w: number, h: number): HTMLImageElement {
  return { naturalWidth: w, naturalHeight: h } as HTMLImageElement;
}

function makeFrameImg(w: number, h: number): HTMLImageElement {
  return { naturalWidth: w, naturalHeight: h } as HTMLImageElement;
}

function makeFrame(overrides: Partial<Frame>): Frame {
  return {
    id: "test",
    label: "Test",
    category: "device",
    assetPath: "/test.png",
    screenArea: { x: 0, y: 0, width: 2560, height: 1664, radius: 0, roundCorners: "ALL" },
    aspectRatio: 2560 / 1664, // 가로형
    ...overrides,
  } as Frame;
}

describe("computeEffectiveScale", () => {
  it("스크린샷이 클 때 naturalScale 그대로 반환 (캡 없음)", () => {
    const frame = makeFrame({ aspectRatio: 2560 / 1664 });
    const frameImg = makeFrameImg(3200, 2000);
    const screenshot = makeScreenshot(8000, 5000);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 8000/2560 = 3.125
    expect(scale).toBeCloseTo(3.125);
  });

  it("스크린샷이 화면 영역과 같을 때 1.0 반환", () => {
    const frame = makeFrame({ aspectRatio: 2560 / 1664 });
    const frameImg = makeFrameImg(3200, 2000);
    const screenshot = makeScreenshot(2560, 1664);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    expect(scale).toBeCloseTo(1.0);
  });

  it("스크린샷이 작을 때 naturalScale 그대로 반환 (하한 없음)", () => {
    const frame = makeFrame({
      aspectRatio: 1206 / 2622,
      screenArea: { x: 0, y: 0, width: 1206, height: 2622, radius: 0, roundCorners: "ALL" },
    });
    const frameImg = makeFrameImg(1300, 2800);
    const screenshot = makeScreenshot(100, 200);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 100/1206 ≈ 0.083 — 하한 없이 그대로
    expect(scale).toBeCloseTo(100 / 1206);
  });

  it("noUpscale 프레임: 큰 스크린샷이어도 1.0으로 캡", () => {
    const frame = makeFrame({
      aspectRatio: 1206 / 2622,
      screenArea: { x: 0, y: 0, width: 1206, height: 2622, radius: 0, roundCorners: "ALL" },
      noUpscale: true,
    });
    const frameImg = makeFrameImg(1300, 2800);
    const screenshot = makeScreenshot(8000, 17000);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    expect(scale).toBeCloseTo(1.0);
  });

  it("noUpscale 프레임: 작은 스크린샷은 축소 허용", () => {
    const frame = makeFrame({
      aspectRatio: 1206 / 2622,
      screenArea: { x: 0, y: 0, width: 1206, height: 2622, radius: 0, roundCorners: "ALL" },
      noUpscale: true,
    });
    const frameImg = makeFrameImg(1300, 2800);
    const screenshot = makeScreenshot(600, 1300);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 600/1206 ≈ 0.497 — 축소는 허용
    expect(scale).toBeCloseTo(600 / 1206);
  });
});

function makeAppStoreFrame(overrides: Partial<Frame> = {}): Frame {
  return {
    id: "appstore-67-full",
    label: "6.7\" Full",
    category: "appstore",
    assetPath: "/frames/appstore/appstore-67-full.png",
    screenArea: { x: 170, y: 518, width: 950, height: 2064, radius: 100, roundCorners: "ALL" },
    aspectRatio: 1290 / 2796,
    appstoreMeta: { canvasWidth: 1290, canvasHeight: 2796 },
    ...overrides,
  } as Frame;
}

describe("computeEffectiveScale — appstore", () => {
  it("appstore 프레임은 스크린샷 크기에 관계없이 1.0을 반환한다", () => {
    const frame = makeAppStoreFrame();
    const frameImg = makeFrameImg(1290, 2796);
    expect(computeEffectiveScale(makeScreenshot(950, 2064), frame, frameImg)).toBe(1.0);
    expect(computeEffectiveScale(makeScreenshot(500, 1000), frame, frameImg)).toBe(1.0);
    expect(computeEffectiveScale(makeScreenshot(5000, 10000), frame, frameImg)).toBe(1.0);
  });
});

describe("calculateOutputSize — appstore", () => {
  it("appstore 프레임은 항상 canvasWidth×canvasHeight를 반환한다", () => {
    const frame = makeAppStoreFrame();
    const frameImg = makeFrameImg(1290, 2796);
    const screenshot = makeScreenshot(950, 2064);
    const shadow: ShadowConfig = { enabled: false, opacity: 100 };
    expect(calculateOutputSize(screenshot, frame, frameImg, shadow)).toEqual({
      width: 1290,
      height: 2796,
    });
  });

  it("shadow enabled여도 appstore는 크기가 고정된다", () => {
    const frame = makeAppStoreFrame();
    const frameImg = makeFrameImg(1290, 2796);
    const screenshot = makeScreenshot(950, 2064);
    const shadow: ShadowConfig = { enabled: true, opacity: 100 };
    expect(calculateOutputSize(screenshot, frame, frameImg, shadow)).toEqual({
      width: 1290,
      height: 2796,
    });
  });
});
