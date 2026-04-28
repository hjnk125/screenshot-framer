import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useImageUpload } from "../hooks/useImageUpload";

function mockImageLoad(width: number, height: number) {
  const MockImage = class {
    naturalWidth = 0;
    naturalHeight = 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_url: string) {
      setTimeout(() => {
        this.naturalWidth = width;
        this.naturalHeight = height;
        this.onload?.();
      }, 0);
    }
  };
  vi.stubGlobal("Image", MockImage);
}

describe("useImageUpload", () => {
  it("초기 상태는 image가 null이고 error가 없다", () => {
    const { result } = renderHook(() => useImageUpload());
    expect(result.current.image).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("8000px 이하 이미지는 정상 로드된다", async () => {
    mockImageLoad(1920, 1080);
    const { result } = renderHook(() => useImageUpload());
    const file = new File([""], "test.png", { type: "image/png" });

    await act(async () => {
      await result.current.handleFile(file);
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.error).toBeNull();
  });

  it("한 변이 8000px 초과 시 error가 설정되고 image는 null이다", async () => {
    mockImageLoad(9000, 1080);
    const { result } = renderHook(() => useImageUpload());
    const file = new File([""], "test.png", { type: "image/png" });

    await act(async () => {
      await result.current.handleFile(file);
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.error).toMatch(/8[,.]?000/);
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
