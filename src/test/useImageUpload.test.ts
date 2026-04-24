import { renderHook, act } from "@testing-library/react";
import { useImageUpload } from "../hooks/useImageUpload";

function mockImageLoad(width: number, height: number) {
  Object.defineProperty(global.Image.prototype, "src", {
    set(_src: string) {
      setTimeout(() => {
        Object.defineProperty(this, "naturalWidth", {
          value: width,
          configurable: true,
        });
        Object.defineProperty(this, "naturalHeight", {
          value: height,
          configurable: true,
        });
        this.onload?.();
      }, 0);
    },
    configurable: true,
  });
}

describe("useImageUpload", () => {
  it("초기 상태는 image가 null이고 error가 없다", () => {
    const { result } = renderHook(() => useImageUpload());
    expect(result.current.image).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("4000px 이하 이미지는 정상 로드된다", async () => {
    mockImageLoad(1920, 1080);
    const { result } = renderHook(() => useImageUpload());
    const file = new File([""], "test.png", { type: "image/png" });

    await act(async () => {
      await result.current.handleFile(file);
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.error).toBeNull();
  });

  it("한 변이 4000px 초과 시 error가 설정되고 image는 null이다", async () => {
    mockImageLoad(5000, 1080);
    const { result } = renderHook(() => useImageUpload());
    const file = new File([""], "test.png", { type: "image/png" });

    await act(async () => {
      await result.current.handleFile(file);
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.error).toMatch(/4[,.]?000/);
    expect(result.current.image).toBeNull();
  });

  it("clearImage 호출 시 초기 상태로 돌아간다", async () => {
    mockImageLoad(1920, 1080);
    const { result } = renderHook(() => useImageUpload());
    const file = new File([""], "test.png", { type: "image/png" });

    await act(async () => {
      await result.current.handleFile(file);
      await new Promise((r) => setTimeout(r, 50));
    });

    act(() => result.current.clearImage());
    expect(result.current.image).toBeNull();
  });
});
