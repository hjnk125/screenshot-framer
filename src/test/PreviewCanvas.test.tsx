import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PreviewCanvas } from "../components/PreviewCanvas";

const mockImage = { src: "test.png" } as HTMLImageElement;
const mockFrame = { id: "frame-1" } as any;
const renderToCanvas = vi.fn().mockResolvedValue(undefined);

describe("PreviewCanvas", () => {
  it("screenshot와 frame이 없으면 안내 문구를 표시한다", () => {
    render(
      <PreviewCanvas
        screenshot={null}
        frame={null}
        onPan={() => {}}
        renderToCanvas={renderToCanvas}
        isRendering={false}
      />,
    );
    expect(
      screen.getByText(/select a frame and screenshot/i),
    ).toBeInTheDocument();
  });

  it("isRendering=true이면 spinner overlay를 표시한다", () => {
    render(
      <PreviewCanvas
        screenshot={mockImage}
        frame={mockFrame}
        onPan={() => {}}
        renderToCanvas={renderToCanvas}
        isRendering={true}
      />,
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("isRendering=false이면 spinner overlay를 표시하지 않는다", () => {
    render(
      <PreviewCanvas
        screenshot={mockImage}
        frame={mockFrame}
        onPan={() => {}}
        renderToCanvas={renderToCanvas}
        isRendering={false}
      />,
    );
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });
});
