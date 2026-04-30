import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FramePickerCard from "../components/FramePickerCard/FramePickerCard";
import { FRAMES } from "../data/frames";
import { describe, it, expect, vi } from "vitest";

describe("FramePickerCard", () => {
  it("디바이스 탭이 기본 선택되어 있다", () => {
    render(<FramePickerCard selectedId={null} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Device" })).toHaveClass(
      "text-white",
    );
  });

  it("디바이스 프레임 목록을 렌더링한다", () => {
    render(<FramePickerCard selectedId={null} onSelect={() => {}} />);
    const deviceFrames = FRAMES.filter((f) => f.category === "device");
    deviceFrames.forEach((f) => {
      expect(screen.getByText(f.label)).toBeInTheDocument();
    });
  });

  it("브라우저 탭 클릭 시 브라우저 프레임을 보여준다", async () => {
    render(<FramePickerCard selectedId={null} onSelect={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Browser" }));
    expect(screen.getByText("Chrome")).toBeInTheDocument();
  });

  it("프레임 선택 시 onSelect 콜백을 호출한다", async () => {
    const onSelect = vi.fn();
    render(<FramePickerCard selectedId={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("MacBook Pro 16"));
    expect(onSelect).toHaveBeenCalledWith(
      FRAMES.find((f) => f.id === "macbook-pro-16"),
    );
  });
});
