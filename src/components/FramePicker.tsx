import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Frame, FrameCategory } from "../types/frame";
import { FRAMES } from "../data/frames";
import { Icon } from "./Icon";

type FramePickerProps = {
  selectedId: string | null;
  onSelect: (frame: Frame) => void;
  showHint?: boolean;
};

function FrameHintTooltip({
  cardRef,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const update = () => {
      if (!cardRef.current) return;
      const r = cardRef.current.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 1024;
      setDesktop(isDesktop);
      if (isDesktop) {
        // 데스크탑: 카드 우측, 세로 중앙
        setPos({ top: r.top + r.height / 2, left: r.right + 14 });
      } else {
        // 모바일: 카드 세로 중앙, 가로 중앙
        setPos({ top: r.top + r.height / 2, left: r.left + r.width / 2 });
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [cardRef]);

  if (!pos) return null;

  return createPortal(
    <div
      className="pointer-events-none animate-bounce"
      style={{
        position: "fixed",
        zIndex: 9999,
        top: pos.top,
        left: pos.left,
        transform: desktop ? "translateY(-50%)" : "translate(-50%, -50%)",
      }}
    >
      {desktop ? (
        /* 데스크탑: 그리드 우측 — 좌향 꼬리 */
        <div className="flex items-center">
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "7px solid transparent",
              borderBottom: "7px solid transparent",
              borderRight: "9px solid rgba(0,0,0,0.72)",
            }}
          />
          <div className="whitespace-nowrap rounded-[9px] bg-black/[0.72] px-[11px] py-[7px] text-[12.5px] font-semibold text-white backdrop-blur-sm">
            Pick a frame
          </div>
        </div>
      ) : (
        /* 모바일/태블릿: 카드 중앙 오버레이 */
        <div className="whitespace-nowrap rounded-[9px] bg-black/[0.72] px-[11px] py-[7px] text-[12.5px] font-semibold text-white backdrop-blur-sm">
          Pick a frame
        </div>
      )}
    </div>,
    document.body,
  );
}

export function FramePicker({
  selectedId,
  onSelect,
  showHint,
}: FramePickerProps) {
  const [tab, setTab] = useState<FrameCategory>("device");
  const cardRef = useRef<HTMLDivElement>(null);

  const filtered = FRAMES.filter((f) => f.category === tab);

  return (
    <>
      <div
        ref={cardRef}
        className="flex shrink-0 flex-col rounded-card-dense border border-black/[0.07] bg-card p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
            Frame
          </span>
        </div>

        {/* Segment control */}
        <div className="mb-[10px] flex rounded-[10px] border border-black/[0.07] bg-card-inner p-[3px]">
          {(["device", "browser"] as FrameCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className={`flex-1 rounded-[7px] py-[7px] text-[12px] font-semibold transition-colors ${
                tab === cat
                  ? "bg-ink text-white"
                  : "bg-transparent text-soft hover:text-ink"
              }`}
            >
              {cat === "device" ? "Device" : "Browser"}
            </button>
          ))}
        </div>

        {/* Frame grid */}
        <div className="grid max-h-[130px] grid-cols-2 gap-[6px] overflow-y-auto">
          {filtered.map((frame) => {
            const active = selectedId === frame.id;
            return (
              <button
                key={frame.id}
                onClick={() => onSelect(frame)}
                className={`flex min-h-[36px] cursor-pointer items-center justify-between gap-1 rounded-[10px] border px-[10px] py-[10px] text-left text-[11.5px] font-semibold text-ink transition-colors ${
                  active
                    ? "border-accent bg-accent"
                    : "border-black/[0.07] bg-card-inner hover:border-black/20"
                }`}
              >
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {frame.label}
                </span>
                {active && <Icon name="check" size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {showHint && <FrameHintTooltip cardRef={cardRef} />}
    </>
  );
}
