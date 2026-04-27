import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportControls } from "../components/ExportControls";
import { describe, it, expect, vi } from "vitest";

describe("ExportControls", () => {
  it("Export PNG 버튼을 렌더링한다", () => {
    render(<ExportControls onExport={() => {}} disabled={false} />);
    expect(
      screen.getByRole("button", { name: /export png/i }),
    ).toBeInTheDocument();
  });

  it("Export PNG 클릭 시 onExport를 호출한다", async () => {
    const onExport = vi.fn();
    render(<ExportControls onExport={onExport} disabled={false} />);
    await userEvent.click(screen.getByRole("button", { name: /export png/i }));
    expect(onExport).toHaveBeenCalled();
  });

  it("disabled 상태에서 Export PNG 버튼이 비활성화된다", () => {
    render(<ExportControls onExport={() => {}} disabled={true} />);
    expect(
      screen.getByRole("button", { name: /export png/i }),
    ).toBeDisabled();
  });

  it("isExporting=true이면 버튼에 spinner가 표시되고 텍스트가 없다", () => {
    render(<ExportControls onExport={() => {}} disabled={false} isExporting={true} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByText(/export png/i)).not.toBeInTheDocument();
  });

  it("isExporting=true이면 버튼이 비활성화된다", () => {
    render(<ExportControls onExport={() => {}} disabled={false} isExporting={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("isExporting=false이면 Export PNG 텍스트가 표시된다", () => {
    render(<ExportControls onExport={() => {}} disabled={false} isExporting={false} />);
    expect(screen.getByRole("button", { name: /export png/i })).toBeInTheDocument();
  });
});
