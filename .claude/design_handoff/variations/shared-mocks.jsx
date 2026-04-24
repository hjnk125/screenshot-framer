/* Shared mock data and icon components for all variations */

// Simple inline SVG icons — stroke-based, minimal
const Icon = ({ name, size = 16, className = "", strokeWidth = 1.6 }) => {
  const paths = {
    upload: <><path d="M12 4v12"/><path d="m7 9 5-5 5 5"/><path d="M4 18h16"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-10 10"/></>,
    device: <><rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M10 18h4"/></>,
    browser: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="6.5" r=".5" fill="currentColor"/></>,
    download: <><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/></>,
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    drag: <><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    shadow: <><circle cx="12" cy="9" r="5"/><ellipse cx="12" cy="19" rx="7" ry="1.5" opacity="0.4"/></>,
    zoom: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    check: <><path d="m5 12 5 5 9-11"/></>,
    chevron: <><path d="m9 5 6 7-6 7"/></>,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>,
    cal: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
};

// Mock preview (fake browser window with content). Gets rendered inside the preview canvas.
const MockFramedShot = ({ tone = "light", radius = 14 }) => {
  const bg = tone === "dark" ? "#0f1012" : "#ffffff";
  const fg = tone === "dark" ? "#e4e4e4" : "#17181a";
  const muted = tone === "dark" ? "#9a9a9a" : "#6b6b6b";
  const soft = tone === "dark" ? "#1c1d20" : "#f4f4f3";
  const border = tone === "dark" ? "#262728" : "#e7e7e6";
  return (
    <div style={{
      width: "100%", aspectRatio: "16/10",
      background: bg, borderRadius: radius, overflow: "hidden",
      border: `1px solid ${border}`,
      fontFamily: "'Pretendard', sans-serif",
      position: "relative",
      boxShadow: "0 18px 40px -20px rgba(0,0,0,0.18)",
    }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${border}`, gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: 9, background: "#ff5f57" }}/>
          <div style={{ width: 9, height: 9, borderRadius: 9, background: "#febc2e" }}/>
          <div style={{ width: 9, height: 9, borderRadius: 9, background: "#28c840" }}/>
        </div>
        <div style={{ flex: 1, height: 22, borderRadius: 6, background: soft, marginLeft: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: muted, fontWeight: 500 }}>
          framed.app/dashboard
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: "18px 18px 0" }}>
        <div style={{ fontSize: 11, color: muted, fontWeight: 500, letterSpacing: ".08em" }}>OVERVIEW</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: fg, letterSpacing: "-.02em" }}>2,847</div>
          <div style={{ fontSize: 12, color: "#5a9d3e", fontWeight: 600 }}>↑ 12.4%</div>
        </div>
        {/* Chart */}
        <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", gap: 5, height: 70 }}>
          {[28, 42, 36, 58, 48, 70, 62, 85, 74, 92, 80, 66].map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${h}%`,
              background: i === 9 ? "#d7ff3a" : (tone === "dark" ? "#26282c" : "#e9e9e7"),
              borderRadius: 3,
            }}/>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: muted }}>
          <span>Jan</span><span>Dec</span>
        </div>
      </div>
    </div>
  );
};

window.Icon = Icon;
window.MockFramedShot = MockFramedShot;
