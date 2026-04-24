import { renderHook, act } from "@testing-library/react";
import { useImageTransform } from "../hooks/useImageTransform";

describe("useImageTransform", () => {
  it("초기 transform은 scale=1, offset=0이다", () => {
    const { result } = renderHook(() => useImageTransform());
    expect(result.current.transform).toEqual({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it("setScale이 scale을 업데이트한다", () => {
    const { result } = renderHook(() => useImageTransform());
    act(() => result.current.setScale(1.5));
    expect(result.current.transform.scale).toBe(1.5);
  });

  it("pan이 offset을 누적한다", () => {
    const { result } = renderHook(() => useImageTransform());
    act(() => result.current.pan(10, 20));
    expect(result.current.transform.offsetX).toBe(10);
    expect(result.current.transform.offsetY).toBe(20);
    act(() => result.current.pan(5, -5));
    expect(result.current.transform.offsetX).toBe(15);
    expect(result.current.transform.offsetY).toBe(15);
  });

  it("reset이 초기 상태로 돌린다", () => {
    const { result } = renderHook(() => useImageTransform());
    act(() => {
      result.current.setScale(2);
      result.current.pan(50, 50);
    });
    act(() => result.current.reset());
    expect(result.current.transform).toEqual({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });
});
