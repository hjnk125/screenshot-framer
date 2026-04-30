export function TitleCard() {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 rounded-card-dense bg-ink px-3 py-[10px]">
      <div className="flex items-center gap-[9px]">
        <div className="flex h-[22px] w-[22px] select-none items-center justify-center rounded-[6px] bg-accent">
          <img src="/logo.svg" alt="" className="h-[14px] w-[14px]" />
        </div>
        <h1 className="text-[12px] font-semibold text-white" aria-hidden="true">
          Screenshot Framer
        </h1>
      </div>
      <span className="font-mono text-[10px] text-white/50">v0.1</span>
    </div>
  );
}
