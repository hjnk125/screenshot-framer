/* Variation C — Bento Soft
   큰 라운드 · 여유있는 패딩 · 오프화이트 톤 · Editorial 느낌
*/

const VariationC = () => {
  const [frameTab, setFrameTab] = React.useState("device");
  const [selectedFrame, setSelectedFrame] = React.useState("macbook-pro-16");
  const [scale, setScale] = React.useState(1.00);
  const [shadow, setShadow] = React.useState(true);
  const [opacity, setOpacity] = React.useState(100);
  const [exportScale, setExportScale] = React.useState(2);

  const frames = {
    device: [
      { id: "macbook-pro-16", label: "MacBook Pro", sub: "16 인치" },
      { id: "iphone-15", label: "iPhone 15", sub: "Pro 사이즈" },
    ],
    browser: [
      { id: "chrome-light", label: "Chrome", sub: "Light" },
      { id: "chrome-dark", label: "Chrome", sub: "Dark" },
      { id: "safari-bigSur-light", label: "Safari", sub: "Big Sur" },
      { id: "safari-bigSur-dark", label: "Safari", sub: "BS · Dark" },
      { id: "safari-catalina-light", label: "Safari", sub: "Catalina" },
      { id: "safari-catalina-dark", label: "Safari", sub: "Cat · Dark" },
    ],
  };

  const T = {
    pageBg: "#efeeea",
    card: "#fbfaf6",
    cardInner: "#ffffff",
    text: "#1d1e20",
    muted: "#a2a09b",
    soft: "#66655f",
    border: "rgba(0,0,0,0.05)",
    accent: "#d7ff3a",
    accentInk: "#1d1e20",
  };

  const Card = ({ children, style, label, caption }) => (
    <div style={{
      background: T.card,
      borderRadius: 26,
      border: `1px solid ${T.border}`,
      padding: 20,
      display: "flex", flexDirection: "column",
      ...style,
    }}>
      {label && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: "-.01em" }}>{label}</div>
          {caption && <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontWeight: 500 }}>{caption}</div>}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <div style={{
      width: "100%", height: "100%",
      background: T.pageBg, fontFamily: "'Pretendard', sans-serif",
      color: T.text, padding: 18,
      display: "grid", gridTemplateColumns: "360px 1fr", gap: 18,
      boxSizing: "border-box", overflow: "hidden",
    }}>
      {/* ===== Sidebar ===== */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
        {/* Brand + file as one editorial unit */}
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, background: T.accentInk,
                display: "grid", placeItems: "center",
              }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, border: `1.8px solid ${T.accent}` }}/>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.015em" }}>Framer</div>
            </div>
            <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 600, letterSpacing: ".06em" }}>0.3</div>
          </div>
          <div style={{
            background: T.cardInner, borderRadius: 16, padding: 12,
            display: "flex", gap: 11, alignItems: "center",
            border: `1px solid ${T.border}`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11, flexShrink: 0,
              background: `linear-gradient(135deg, #d7ff3a, #7a9a2a)`,
              border: `1px solid ${T.border}`,
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>dashboard-hero.png</div>
              <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2 }}>2880 × 1800 · 1.4 MB</div>
            </div>
            <button style={{
              width: 26, height: 26, borderRadius: 8, border: "none",
              background: "transparent", color: T.soft, cursor: "pointer",
            }}>✕</button>
          </div>
        </Card>

        {/* Frame picker */}
        <Card label="프레임" caption="디바이스와 브라우저 중 선택">
          <div style={{
            display: "flex", gap: 6, marginBottom: 12,
          }}>
            {["device", "browser"].map(cat => (
              <button key={cat} onClick={() => setFrameTab(cat)} style={{
                flex: 1, padding: "9px 0", fontSize: 12.5, fontWeight: 600,
                border: `1px solid ${frameTab === cat ? T.accentInk : T.border}`,
                borderRadius: 12,
                background: frameTab === cat ? T.accentInk : "transparent",
                color: frameTab === cat ? "#fff" : T.soft,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {cat === "device" ? "디바이스" : "브라우저"}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 180, overflowY: "auto" }}>
            {frames[frameTab].map(f => {
              const active = selectedFrame === f.id;
              return (
                <button key={f.id} onClick={() => setSelectedFrame(f.id)} style={{
                  background: active ? T.accent : T.cardInner,
                  border: `1px solid ${active ? T.accent : T.border}`,
                  borderRadius: 12, padding: "9px 11px",
                  textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", gap: 1,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{f.label}</span>
                  <span style={{ fontSize: 10, color: active ? T.accentInk : T.muted, fontWeight: 500 }}>{f.sub}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Adjust + Shadow combined */}
        <Card label="조정">
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11.5, fontWeight: 500, color: T.soft }}>배율</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{scale.toFixed(2)}×</span>
            </div>
            <div style={{ position: "relative", height: 16, display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%", height: 4, background: T.cardInner, borderRadius: 4, border: `1px solid ${T.border}` }}/>
              <div style={{ position: "absolute", left: 0, height: 4, background: T.accentInk, borderRadius: 4, width: `${((scale - 0.5) / 2.5) * 100}%` }}/>
              <input type="range" min="0.5" max="3" step="0.01" value={scale} onChange={e => setScale(+e.target.value)} style={{
                position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer",
              }}/>
              <div style={{
                position: "absolute", left: `calc(${((scale - 0.5) / 2.5) * 100}% - 8px)`,
                width: 16, height: 16, borderRadius: 16, background: "#fff",
                border: `2px solid ${T.accentInk}`, pointerEvents: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}/>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <button onClick={() => setShadow(!shadow)} style={{
                  width: 30, height: 18, borderRadius: 18, border: "none",
                  background: shadow ? T.accentInk : "#d0cfc9",
                  position: "relative", cursor: "pointer", padding: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 2, left: shadow ? 14 : 2,
                    width: 14, height: 14, borderRadius: 14, background: "#fff",
                    transition: "left .15s",
                  }}/>
                </button>
                <span style={{ fontSize: 11.5, fontWeight: 500, color: T.soft }}>그림자</span>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: "ui-monospace, monospace", color: shadow ? T.text : T.muted }}>{shadow ? `${opacity}%` : "OFF"}</span>
            </div>
            <div style={{ position: "relative", height: 16, display: "flex", alignItems: "center", opacity: shadow ? 1 : 0.3 }}>
              <div style={{ width: "100%", height: 4, background: T.cardInner, borderRadius: 4, border: `1px solid ${T.border}` }}/>
              <div style={{ position: "absolute", left: 0, height: 4, background: T.accentInk, borderRadius: 4, width: `${opacity}%` }}/>
              <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(+e.target.value)} disabled={!shadow} style={{
                position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer",
              }}/>
              <div style={{
                position: "absolute", left: `calc(${opacity}% - 8px)`,
                width: 16, height: 16, borderRadius: 16, background: "#fff",
                border: `2px solid ${T.accentInk}`, pointerEvents: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}/>
            </div>
          </div>

          <button style={{
            alignSelf: "flex-start", marginTop: 14,
            fontSize: 11, fontWeight: 600, color: T.soft,
            background: "transparent", border: `1px solid ${T.border}`,
            borderRadius: 9, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 5,
          }}>↻ 모두 초기화</button>
        </Card>

        {/* Export — hero block */}
        <div style={{
          marginTop: "auto",
          background: T.accentInk, borderRadius: 26, padding: 20,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-.01em" }}>내보내기</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", marginTop: 2, fontWeight: 500 }}>출력 크기 · 5760 × 3600</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3].map(s => (
              <button key={s} onClick={() => setExportScale(s)} style={{
                flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 600,
                borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
                background: exportScale === s ? T.accent : "rgba(255,255,255,0.05)",
                color: exportScale === s ? T.accentInk : "#fff",
                cursor: "pointer", fontFamily: "inherit",
              }}>{s}×</button>
            ))}
          </div>
          <button style={{
            width: "100%", padding: "12px", borderRadius: 14,
            background: T.accent, color: T.accentInk,
            border: "none", fontSize: 13.5, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            letterSpacing: "-.01em",
          }}>
            PNG 저장 →
          </button>
        </div>
      </aside>

      {/* ===== Preview ===== */}
      <main style={{
        background: T.card, borderRadius: 26,
        border: `1px solid ${T.border}`,
        padding: 22,
        display: "flex", flexDirection: "column", gap: 16,
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.015em" }}>미리보기</div>
            <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2, fontWeight: 500 }}>MacBook Pro 16″ · 실제 크기의 {(scale * 100).toFixed(0)}%</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["새로고침", "비율 고정", "썸네일"].map((l, i) => (
              <button key={i} style={{
                padding: "6px 11px", fontSize: 11.5, fontWeight: 500,
                borderRadius: 10, border: `1px solid ${T.border}`,
                background: "transparent", color: T.soft,
                cursor: "pointer", fontFamily: "inherit",
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{
          flex: 1, borderRadius: 20, overflow: "hidden",
          background: `url(../assets/checkerboard.svg)`,
          backgroundRepeat: "repeat", backgroundSize: "22px 22px",
          border: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 50,
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 14, left: 18, fontSize: 10, color: T.muted, fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>● 캔버스</div>
          <div style={{ position: "absolute", bottom: 14, right: 18, fontSize: 10, color: T.muted, fontFamily: "ui-monospace, monospace" }}>3456 × 2160 px</div>
          <div style={{ width: "min(100%, 720px)" }}>
            <MockFramedShot tone="light" radius={16}/>
          </div>
        </div>

        {/* Status chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { k: "배율", v: `${scale.toFixed(2)}×` },
            { k: "오프셋", v: "0, 0" },
            { k: "그림자", v: shadow ? `${opacity}%` : "없음" },
            { k: "출력", v: `${exportScale}× PNG` },
          ].map((s, i) => (
            <div key={i} style={{
              background: T.cardInner, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "6px 11px",
              display: "flex", gap: 7, alignItems: "baseline",
            }}>
              <span style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>{s.k}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{s.v}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.soft, fontWeight: 500 }}>
            <span style={{ width: 7, height: 7, borderRadius: 7, background: "#4ca24f" }}/>
            저장 준비 완료
          </div>
        </div>
      </main>
    </div>
  );
};

window.VariationC = VariationC;
