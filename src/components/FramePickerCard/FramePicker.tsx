import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Frame, FrameCategory } from "../../types/frame";
import { FRAMES } from "../../data/frames";
import { Icon } from "../Icon";

type FramePickerProps = {
  selectedId: string | null;
  onSelect: (frame: Frame) => void;
  showHint?: boolean;
};

function FrameHintTooltip({
  tabRef,
}: {
  tabRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width?: number;
    desktop: boolean;
  } | null>(null);

  useEffect(() => {
    let lastKey = "";

    const update = () => {
      if (!tabRef.current) return;
      const tab = tabRef.current.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 1024;
      const top = isDesktop ? tab.top + tab.height / 2 : tab.top - 8;
      const left = isDesktop ? tab.right + 14 : tab.left;
      const key = `${isDesktop}|${top}|${left}`;
      if (key === lastKey) return;
      lastKey = key;
      setPos(
        isDesktop
          ? { top, left, desktop: true }
          : { top, left, width: tab.width, desktop: false },
      );
    };

    update();

    const ro = new ResizeObserver(update);
    if (tabRef.current) ro.observe(tabRef.current);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [tabRef]);

  if (!pos) return null;

  return createPortal(
    <div
      className="pointer-events-none animate-bounce"
      style={
        pos.desktop
          ? { position: "fixed", zIndex: 9999, top: pos.top, left: pos.left }
          : {
              position: "fixed",
              zIndex: 9999,
              top: pos.top,
              left: pos.left,
              width: pos.width,
              display: "flex",
              justifyContent: "center",
            }
      }
    >
      {pos.desktop ? (
        /* 데스크탑: 탭 우측 — 좌향 꼬리 */
        <div className="flex items-center" style={{ transform: "translateY(-50%)" }}>
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
        /* 모바일: 탭 위 — 아래향 꼬리 */
        <div className="flex flex-col items-center" style={{ transform: "translateY(-100%)" }}>
          <div className="whitespace-nowrap rounded-[9px] bg-black/[0.72] px-[11px] py-[7px] text-[12.5px] font-semibold text-white backdrop-blur-sm">
            Pick a frame
          </div>
          <div
            style={{
              width: 0,
              height: 0,
              marginTop: -1,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "8px solid rgba(0,0,0,0.72)",
            }}
          />
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
  const tabRef = useRef<HTMLDivElement>(null);

  const filtered = FRAMES.filter((f) => f.category === tab);

  return (
    <>
      <div className="flex shrink-0 flex-col rounded-card-dense border border-black/[0.07] bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-soft">
            Frame
          </span>
        </div>

        {/* Segment control */}
        <div ref={tabRef} className="mb-[10px] flex rounded-[10px] border border-black/[0.07] bg-card-inner p-[3px]">
          {(["device", "browser", "appstore"] as FrameCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className={`flex-1 rounded-[7px] py-[7px] text-[12px] font-semibold transition-colors ${
                tab === cat
                  ? "bg-ink text-white"
                  : "bg-transparent text-soft hover:text-ink"
              }`}
            >
              {cat === "device" ? "Device" : cat === "browser" ? "Browser" : "App Store"}
            </button>
          ))}
        </div>

        {/* Frame grid */}
        <div className="grid grid-cols-2 gap-[6px]">
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

      {showHint && <FrameHintTooltip tabRef={tabRef} />}
    </>
  );
}
