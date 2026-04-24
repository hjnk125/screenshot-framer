/* Variation B — Bento Dense
   조밀한 2컬럼 벤토 · 얇은 카드 · 한 화면 정보 밀도 최대화
*/

const VariationB = () => {
  const [frameTab, setFrameTab] = React.useState("device");
  const [selectedFrame, setSelectedFrame] = React.useState("macbook-pro-16");
  const [scale, setScale] = React.useState(1.00);
  const [shadow, setShadow] = React.useState(true);
  const [opacity, setOpacity] = React.useState(100);
  const [exportScale, setExportScale] = React.useState(2);

  const frames = {
    device: [
      { id: "macbook-pro-16", label: "MacBook Pro 16″", meta: "3456×2160" },
      { id: "iphone-15", label: "iPhone 15", meta: "1179×2556" },
    ],
    browser: [
      { id: "chrome-light", label: "Chrome", meta: "Light" },
      { id: "chrome-dark", label: "Chrome", meta: "Dark" },
      { id: "safari-bigSur-light", label: "Safari", meta: "Big Sur" },
      { id: "safari-bigSur-dark", label: "Safari", meta: "BS Dark" },
    ],
  };

  const T = {
    pageBg: "#e8e8e6",
    card: "#f7f7f5",
    cardInner: "#ffffff",
    text: "#17181a",
    muted: "#8a8a88",
    soft: "#5a5a58",
    border: "rgba(0,0,0,0.07)",
    accent: "#d7ff3a",
    accentDark: "#17181a",
  };

  const MiniCard = ({ children, style, label, value }) => (
    <div style={{
      background: T.card, borderRadius: 14, padding: 10,
      border: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      ...style,
    }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: T.soft, letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</div>
          {value && <div style={{ fontSize: 10, color: T.muted, fontFamily: "ui-monospace, monospace" }}>{value}</div>}
        </div>
      )}
      {children}
    </div>
  );

  const Stat = ({ k, v }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontSize: 9.5, color: T.muted, fontWeight: 500, letterSpacing: ".04em", textTransform: "uppercase" }}>{k}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: "-.01em" }}>{v}</div>
    </div>
  );

  return (
    <div style={{
      width: "100%", height: "100%",
      background: T.pageBg, fontFamily: "'Pretendard', sans-serif",
      color: T.text, padding: 10,
      display: "grid", gridTemplateColumns: "340px 1fr", gap: 10,
      boxSizing: "border-box", overflow: "hidden",
    }}>
      {/* ===== Sidebar ===== */}
      <aside style={{ display: "grid", gridTemplateRows: "auto auto auto auto 1fr auto", gap: 10, overflow: "hidden" }}>
        {/* Header strip */}
        <div style={{
          background: T.accentDark, borderRadius: 14, padding: "10px 12px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, background: T.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: T.accentDark,
            }}>▢</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Screenshot Framer</div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "ui-monospace, monospace" }}>v0.3</div>
        </div>

        {/* File row + frame row as 1 bento unit */}
        <MiniCard label="파일" value="1.4 MB">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: `linear-gradient(135deg, #d7ff3a 0%, #8fa839 100%)`,
              border: `1px solid ${T.border}`,
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>dashboard-hero.png</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 1, fontFamily: "ui-monospace, monospace" }}>2880 × 1800</div>
            </div>
            <button style={{
              width: 22, height: 22, borderRadius: 6, border: "none",
              background: "transparent", color: T.soft, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Icon name="close" size={12}/></button>
          </div>
        </MiniCard>

        {/* Frame picker */}
        <MiniCard label="프레임" value={frames[frameTab].length + "개"}>
          <div style={{
            display: "flex", background: T.cardInner, padding: 2, borderRadius: 8,
            border: `1px solid ${T.border}`, marginBottom: 8,
          }}>
            {["device", "browser"].map(cat => (
              <button key={cat} onClick={() => setFrameTab(cat)} style={{
                flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 600,
                border: "none", cursor: "pointer", borderRadius: 6,
                background: frameTab === cat ? T.accentDark : "transparent",
                color: frameTab === cat ? "#fff" : T.soft,
                fontFamily: "inherit",
              }}>
                {cat === "device" ? "디바이스" : "브라우저"}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {frames[frameTab].map(f => {
              const active = selectedFrame === f.id;
              return (
                <button key={f.id} onClick={() => setSelectedFrame(f.id)} style={{
                  background: active ? T.accent : T.cardInner,
                  border: `1px solid ${active ? T.accent : T.border}`,
                  borderRadius: 8, padding: "6px 8px",
                  textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", gap: 1,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.label}</span>
                  <span style={{ fontSize: 9.5, color: active ? T.accentDark : T.muted, fontFamily: "ui-monospace, monospace" }}>{f.meta}</span>
                </button>
              );
            })}
          </div>
        </MiniCard>

        {/* 2-column: Scale + Shadow */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniCard label="배율" value={`${scale.toFixed(2)}×`}>
            <div style={{ flex: 1, position: "relative", height: 14, display: "flex", alignItems: "center", marginTop: 4 }}>
              <div style={{ width: "100%", height: 3, background: T.cardInner, borderRadius: 3, border: `1px solid ${T.border}` }}/>
              <div style={{ position: "absolute", left: 0, height: 3, background: T.accentDark, borderRadius: 3, width: `${((scale - 0.5) / 2.5) * 100}%` }}/>
              <input type="range" min="0.5" max="3" step="0.01" value={scale} onChange={e => setScale(+e.target.value)} style={{
                position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer",
              }}/>
              <div style={{
                position: "absolute", left: `calc(${((scale - 0.5) / 2.5) * 100}% - 6px)`,
                width: 12, height: 12, borderRadius: 12, background: "#fff",
                border: `2px solid ${T.accentDark}`, pointerEvents: "none",
              }}/>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontSize: 9, color: T.muted, fontFamily: "ui-monospace, monospace" }}>0.5×</span>
              <span style={{ fontSize: 9, color: T.muted, fontFamily: "ui-monospace, monospace" }}>3.0×</span>
            </div>
          </MiniCard>

          <MiniCard label="그림자" value={shadow ? `${opacity}%` : "OFF"}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <button onClick={() => setShadow(!shadow)} style={{
                width: 26, height: 15, borderRadius: 15, border: "none",
                background: shadow ? T.accentDark : "#d5d5d3",
                position: "relative", cursor: "pointer", padding: 0,
              }}>
                <div style={{
                  position: "absolute", top: 2, left: shadow ? 13 : 2,
                  width: 11, height: 11, borderRadius: 11, background: "#fff",
                  transition: "left .15s",
                }}/>
              </button>
              <span style={{ fontSize: 10.5, fontWeight: 500, color: shadow ? T.text : T.muted }}>활성</span>
            </div>
            <div style={{ flex: 1, position: "relative", height: 14, display: "flex", alignItems: "center", opacity: shadow ? 1 : 0.35 }}>
              <div style={{ width: "100%", height: 3, background: T.cardInner, borderRadius: 3, border: `1px solid ${T.border}` }}/>
              <div style={{ position: "absolute", left: 0, height: 3, background: T.accentDark, borderRadius: 3, width: `${opacity}%` }}/>
              <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(+e.target.value)} disabled={!shadow} style={{
                position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer",
              }}/>
              <div style={{
                position: "absolute", left: `calc(${opacity}% - 6px)`,
                width: 12, height: 12, borderRadius: 12, background: "#fff",
                border: `2px solid ${T.accentDark}`, pointerEvents: "none",
              }}/>
            </div>
          </MiniCard>
        </div>

        {/* Info / metrics grid — 4 mini stats */}
        <MiniCard label="현재 상태">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px" }}>
            <Stat k="출력" v="5760 × 3600"/>
            <Stat k="예상 용량" v="4.2 MB"/>
            <Stat k="오프셋" v="0, 0 px"/>
            <Stat k="포맷" v="PNG · RGBA"/>
          </div>
        </MiniCard>

        {/* Export panel */}
        <div style={{
          background: T.accentDark, borderRadius: 14, padding: 12,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: ".06em", textTransform: "uppercase" }}>내보내기</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "ui-monospace, monospace" }}>{exportScale}× scale</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3].map(s => (
              <button key={s} onClick={() => setExportScale(s)} style={{
                flex: 1, padding: "6px 0", fontSize: 11.5, fontWeight: 700,
                borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)",
                background: exportScale === s ? T.accent : "rgba(255,255,255,0.06)",
                color: exportScale === s ? T.accentDark : "#fff",
                cursor: "pointer", fontFamily: "inherit",
              }}>{s}×</button>
            ))}
          </div>
          <button style={{
            width: "100%", padding: "9px 12px", borderRadius: 9,
            background: T.accent, color: T.accentDark,
            border: "none", fontSize: 12.5, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Icon name="download" size={13} strokeWidth={2.2}/> PNG 저장
          </button>
        </div>
      </aside>

      {/* ===== Preview ===== */}
      <main style={{
        background: T.card, borderRadius: 18,
        border: `1px solid ${T.border}`,
        padding: 12,
        display: "grid", gridTemplateRows: "auto 1fr auto", gap: 10,
        overflow: "hidden",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: T.cardInner, borderRadius: 10, padding: "7px 10px",
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 8, background: "#4ca24f" }}/>
              <span style={{ fontSize: 11, fontWeight: 600 }}>MacBook Pro 16″</span>
            </div>
            <span style={{ fontSize: 10.5, color: T.muted, fontFamily: "ui-monospace, monospace" }}>3456 × 2160</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["layers", "refresh", "lock", "cal"].map(n => (
              <button key={n} style={{
                width: 24, height: 24, borderRadius: 6,
                border: "none", background: "transparent",
                cursor: "pointer", color: T.soft,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={n} size={12}/>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          borderRadius: 12, overflow: "hidden",
          background: `url(../assets/checkerboard.svg)`,
          backgroundRepeat: "repeat", backgroundSize: "16px 16px",
          border: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 28, position: "relative",
        }}>
          {/* rulers */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 16, background: "rgba(255,255,255,0.5)", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 9, color: T.muted, fontFamily: "ui-monospace, monospace", letterSpacing: ".08em" }}>
              0 · 500 · 1000 · 1500 · 2000 · 2500 · 3000
            </div>
          </div>
          <div style={{ width: "min(100%, 640px)", marginTop: 8 }}>
            <MockFramedShot tone="light"/>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr) auto", gap: 8,
          padding: "6px 2px",
        }}>
          {[
            { k: "ZOOM", v: `${scale.toFixed(2)}×` },
            { k: "PAN", v: "0, 0 px" },
            { k: "SHADOW", v: shadow ? `${opacity}%` : "OFF" },
            { k: "EXPORT", v: `${exportScale}× PNG` },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: ".06em" }}>{s.k}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{s.v}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 6px" }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: "#4ca24f" }}/>
            <span style={{ fontSize: 10.5, color: T.soft, fontWeight: 500 }}>준비됨</span>
          </div>
        </div>
      </main>
    </div>
  );
};

window.VariationB = VariationB;
