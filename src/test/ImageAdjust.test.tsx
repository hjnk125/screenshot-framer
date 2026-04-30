import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageAdjust } from "../components/ImageAdjustCard/ImageAdjust";
import { describe, it, expect, vi } from "vitest";

describe("ImageAdjust", () => {
  it("Scale 슬라이더를 렌더링한다", () => {
    render(
      <ImageAdjust scale={1} onScaleChange={() => {}} onReset={() => {}} />,
    );
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("슬라이더 변경 시 onScaleChange를 호출한다", () => {
    const onScaleChange = vi.fn();
    render(
      <ImageAdjust
        scale={1}
        onScaleChange={onScaleChange}
        onReset={() => {}}
      />,
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "1.5" } });
    expect(onScaleChange).toHaveBeenCalledWith(1.5);
  });

  it("초기화 버튼 클릭 시 onReset을 호출한다", async () => {
    const onReset = vi.fn();
    render(
      <ImageAdjust scale={1.5} onScaleChange={() => {}} onReset={onReset} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
