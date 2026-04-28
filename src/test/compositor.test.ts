import { calculateCanvasSize, computeEffectiveScale } from "../utils/compositor";
import type { Frame } from "../types/frame";

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
    screenArea: { x: 0, y: 0, width: 2560, height: 1664, radius: 0 },
    aspectRatio: 2560 / 1664, // 가로형
    ...overrides,
  } as Frame;
}

describe("computeEffectiveScale", () => {
  it("가로형 프레임: 스크린샷이 화면 영역보다 훨씬 클 때 1.0으로 캡 (@2x 에셋이 대신 처리)", () => {
    // MacBook류 프레임: 화면 영역 2560px, 프레임 에셋 3200px
    // @2x 에셋 사용 시 resolveFrame이 2x 파일로 교체하므로 scale cap은 1.0 유지
    const frame = makeFrame({ aspectRatio: 2560 / 1664 });
    const frameImg = makeFrameImg(3200, 2000);
    const screenshot = makeScreenshot(8000, 5000);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 8000/2560 = 3.125 → 1.0으로 캡 (품질은 @2x 에셋이 담당)
    expect(scale).toBeCloseTo(1.0);
  });

  it("가로형 프레임: 스크린샷이 작을 때 캡 없이 자연 배율 사용", () => {
    const frame = makeFrame({ aspectRatio: 2560 / 1664 });
    const frameImg = makeFrameImg(3200, 2000);
    const screenshot = makeScreenshot(2560, 1664);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 2560/2560 = 1.0
    expect(scale).toBeCloseTo(1.0);
  });

  it("세로형(폰) 프레임: 큰 스크린샷이어도 1.0으로 캡", () => {
    // iPhone류 프레임: 화면 영역 1206px, 프레임 에셋 1300px
    const frame = makeFrame({
      aspectRatio: 1206 / 2622, // 세로형
      screenArea: { x: 0, y: 0, width: 1206, height: 2622, radius: 0 },
    });
    const frameImg = makeFrameImg(1300, 2800);
    const screenshot = makeScreenshot(8000, 17000);
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 8000/1206 ≈ 6.6 → 1.0으로 캡
    expect(scale).toBeCloseTo(1.0);
  });

  it("세로형 프레임: minScale 하한 적용 확인", () => {
    const frame = makeFrame({
      aspectRatio: 1206 / 2622,
      screenArea: { x: 0, y: 0, width: 1206, height: 2622, radius: 0 },
    });
    const frameImg = makeFrameImg(1300, 2800);
    const screenshot = makeScreenshot(100, 200); // 매우 작은 스크린샷
    const scale = computeEffectiveScale(screenshot, frame, frameImg);
    // naturalScale = 100/1206 ≈ 0.083 → minScale = 800/1300 ≈ 0.615 로 올라감
    const minScale = 800 / 1300;
    expect(scale).toBeCloseTo(minScale);
  });
});
