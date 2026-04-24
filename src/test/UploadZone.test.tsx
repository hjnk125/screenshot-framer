import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadZone } from "../components/UploadZone";
import { describe, it, expect, vi } from "vitest";

describe("UploadZone", () => {
  it("업로드 안내 텍스트를 렌더링한다", () => {
    render(<UploadZone onFile={() => {}} />);
    expect(screen.getByText(/drag|click/i)).toBeInTheDocument();
  });

  it("파일 선택 시 onFile 콜백을 호출한다", async () => {
    const onFile = vi.fn();
    render(<UploadZone onFile={onFile} />);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File([""], "test.png", { type: "image/png" });
    await userEvent.upload(input, file);

    expect(onFile).toHaveBeenCalledWith(file);
  });
});
