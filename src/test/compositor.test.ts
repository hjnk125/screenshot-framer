import { calculateCanvasSize } from "../utils/compositor";

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
