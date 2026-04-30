import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShadowCard from "../components/ShadowCard/ShadowCard";
import type { ShadowConfig } from "../types/frame";
import { describe, it, expect, vi } from "vitest";

const defaultShadow: ShadowConfig = { enabled: false, opacity: 100 };

describe("ShadowCard", () => {
  it("그림자 토글 버튼을 렌더링한다", () => {
    render(<ShadowCard value={defaultShadow} onChange={() => {}} />);
    expect(
      screen.getByRole("button", { name: /toggle shadow/i }),
    ).toBeInTheDocument();
  });

  it("disabled 상태에서 슬라이더가 렌더링되지 않는다", () => {
    render(<ShadowCard value={defaultShadow} onChange={() => {}} />);
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });

  it("enabled 상태에서 슬라이더가 활성화된다", () => {
    const enabled: ShadowConfig = { ...defaultShadow, enabled: true };
    render(<ShadowCard value={enabled} onChange={() => {}} />);
    const sliders = screen.getAllByRole("slider");
    sliders.forEach((s) => expect(s).not.toBeDisabled());
  });

  it("토글 클릭 시 onChange가 호출된다", async () => {
    const onChange = vi.fn();
    render(<ShadowCard value={defaultShadow} onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: /toggle shadow/i }),
    );
    expect(onChange).toHaveBeenCalledWith({ ...defaultShadow, enabled: true });
  });
});
