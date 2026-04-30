import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExportCard from "../components/ExportCard/ExportCard";
import { describe, it, expect, vi } from "vitest";

describe("ExportCard", () => {
  it("Export PNG 버튼을 렌더링한다", () => {
    render(<ExportCard onExport={() => {}} disabled={false} />);
    expect(
      screen.getByRole("button", { name: /export png/i }),
    ).toBeInTheDocument();
  });

  it("Export PNG 클릭 시 onExport를 호출한다", async () => {
    const onExport = vi.fn();
    render(<ExportCard onExport={onExport} disabled={false} />);
    await userEvent.click(screen.getByRole("button", { name: /export png/i }));
    expect(onExport).toHaveBeenCalled();
  });

  it("disabled 상태에서 Export PNG 버튼이 비활성화된다", () => {
    render(<ExportCard onExport={() => {}} disabled={true} />);
    expect(
      screen.getByRole("button", { name: /export png/i }),
    ).toBeDisabled();
  });

  it("isExporting=true이면 버튼에 spinner가 표시되고 텍스트가 없다", () => {
    render(<ExportCard onExport={() => {}} disabled={false} isExporting={true} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByText(/export png/i)).not.toBeInTheDocument();
  });

  it("isExporting=true이면 버튼이 비활성화된다", () => {
    render(<ExportCard onExport={() => {}} disabled={false} isExporting={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("isExporting=false이면 Export PNG 텍스트가 표시된다", () => {
    render(<ExportCard onExport={() => {}} disabled={false} isExporting={false} />);
    expect(screen.getByRole("button", { name: /export png/i })).toBeInTheDocument();
  });

  it("outputSize가 uploadSize보다 작으면 리사이즈 안내 표시", () => {
    render(
      <ExportCard
        onExport={() => {}}
        disabled={false}
        getOutputSize={() => ({ width: 1300, height: 2800 })}
        uploadSize={{ width: 8000, height: 17000 }}
      />,
    );
    expect(screen.getByText(/Resized to.*1,300/s)).toBeInTheDocument();
  });

  it("outputSize가 uploadSize와 같으면 리사이즈 안내 미표시", () => {
    render(
      <ExportCard
        onExport={() => {}}
        disabled={false}
        getOutputSize={() => ({ width: 2560, height: 1664 })}
        uploadSize={{ width: 2560, height: 1664 }}
      />,
    );
    expect(screen.queryByText(/Resized to/i)).not.toBeInTheDocument();
  });

  it("uploadSize 없으면 리사이즈 안내 미표시", () => {
    render(
      <ExportCard
        onExport={() => {}}
        disabled={false}
        getOutputSize={() => ({ width: 1300, height: 2800 })}
      />,
    );
    expect(screen.queryByText(/Resized to/i)).not.toBeInTheDocument();
  });
});
