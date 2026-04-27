import { useEffect, useRef, useCallback } from "react";
import type { Frame } from "../types/frame";
import { Spinner } from "./Spinner";

type PreviewCanvasProps = {
  screenshot: HTMLImageElement | null;
  frame: Frame | null;
  onPan: (dx: number, dy: number) => void;
  renderToCanvas: (canvas: HTMLCanvasElement) => Promise<void>;
  isRendering: boolean;
};

export function PreviewCanvas({
  screenshot,
  frame,
  onPan,
  renderToCanvas,
  isRendering,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderToCanvas(canvasRef.current);
  }, [renderToCanvas]);

  const applyPan = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragStart.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = rect.width > 0 ? canvasRef.current.width / rect.width : 1;
      const scaleY =
        rect.height > 0 ? canvasRef.current.height / rect.height : 1;
      const dx = (clientX - dragStart.current.x) * scaleX;
      const dy = (clientY - dragStart.current.y) * scaleY;
      dragStart.current = { x: clientX, y: clientY };
      onPan(dx, dy);
    },
    [onPan],
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => applyPan(e.clientX, e.clientY),
    [applyPan],
  );

  const handleMouseUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  // touchmove에 preventDefault가 필요해 native 리스너로 { passive: false } 등록.
  // canvas는 screenshot+frame 있을 때만 렌더되므로 deps에 포함해 재실행 보장.
  const canvasVisible = !!screenshot && !!frame;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      dragStart.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      applyPan(t.clientX, t.clientY);
    };

    const onTouchEnd = () => {
      dragStart.current = null;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [applyPan, canvasVisible]);

  if (!screenshot || !frame) {
    return (
      <div className="flex h-full items-center justify-center rounded-card-dense border border-black/[0.07] bg-[url('/checkerboard.svg')] bg-repeat">
        <p className="text-[13px] font-medium text-muted">
          Select a frame and screenshot to preview
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden rounded-card-dense border border-black/[0.07] bg-[url('/checkerboard.svg')] bg-repeat p-10">
      <canvas
        ref={canvasRef}
        className="max-h-full max-w-full cursor-grab touch-none object-contain active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center rounded-card-dense bg-black/10">
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
}
