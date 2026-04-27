import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spinner } from "../components/Spinner";

describe("Spinner", () => {
  it("data-testid='spinner' 요소를 렌더링한다", () => {
    render(<Spinner />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("size prop이 width/height 스타일에 반영된다", () => {
    render(<Spinner size={24} />);
    const el = screen.getByTestId("spinner");
    expect(el).toHaveStyle({ width: "24px", height: "24px" });
  });
});
