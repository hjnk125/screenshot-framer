/* Variation A — Bento Light
   라이트 그레이 배경 · 화이트 카드들이 벤토 그리드로 · 라임 액센트 포인트
*/

const VariationA = () => {
  const [frameTab, setFrameTab] = React.useState("device");
  const [selectedFrame, setSelectedFrame] = React.useState("macbook-pro-16");
  const [scale, setScale] = React.useState(1.00);
  const [shadow, setShadow] = React.useState(true);
  const [opacity, setOpacity] = React.useState(100);
  const [exportScale, setExportScale] = React.useState(2);

  const frames = {
    device: [
      { id: "macbook-pro-16", label: "MacBook Pro 16″" },
      { id: "iphone-15", label: "iPhone 15" },
    ],
    browser: [
      { id: "chrome-light", label: "Chrome" },
      { id: "chrome-dark", label: "Chrome Dark" },
      { id: "safari-bigSur-light", label: "Safari Big Sur" },
      { id: "safari-bigSur-dark", label: "Safari Big Sur Dark" },
      { id: "safari-catalina-light", label: "Safari Catalina" },
      { id: "safari-catalina-dark", label: "Safari Catalina Dark" },
    ],
  };

  // tokens
  const T = {
    pageBg: "#ececec",
    card: "#fafaf9",
    cardInner: "#ffffff",
    text: "#17181a",
    muted: "#8a8a88",
    soft: "#6b6b6b",
    border: "rgba(0,0,0,0.06)",
    borderStrong: "rgba(0,0,0,0.12)",
    accent: "#d7ff3a",
    accentDark: "#17181a",
  };

  const Card = ({ children, style, label, hint }) => (
    <div style={{
      background: T.card,
      borderRadius: 20,
      border: `1px solid ${T.border}`,
      padding: 16,
      display: "flex", flexDirection: "column",
      ...style,
    }}>
      {label && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.soft, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</div>
          {hint && <div style={{ fontSize: 11, color: T.muted }}>{hint}</div>}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <div style={{
      width: "100%", height: "100%",
      background: T.pageBg,
      fontFamily: "'Pretendard', sans-serif",
      color: T.text,
      padding: 14,
      display: "grid",
      gridTemplateColumns: "360px 1fr",
      gap: 14,
      boxSizing: "border-box",
      overflow: "hidden",
    }}>
      {/* ===== Sidebar ===== */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
        {/* Logo / app name card */}
        <Card style={{ padding: "14px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: T.accentDark,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <div style={{ position: "absolute", inset: 5, borderRadius: 4, border: `1.5px solid ${T.accent}` }}/>
              <div style={{ position: "absolute", top: 8, left: 8, width: 6, height: 6, borderRadius: 2, background: T.accent }}/>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-.01em" }}>Screenshot Framer</div>
              <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 500 }}>v0.3 · Pretendard</div>
            </div>
          </div>
        </Card>

        {/* Upload / File card */}
        <Card label="스크린샷" hint="PNG · JPG">
          <div style={{
            background: T.cardInner, borderRadius: 14, padding: 10,
            border: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 10, overflow: "hidden",
              background: `linear-gradient(135deg, #d7ff3a 0%, #a4c948 60%, #4a5d20 100%)`,
              position: "relative", flexShrink: 0,
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ position: "absolute", bottom: 6, right: 6, width: 14, height: 14, borderRadius: 14, background: "rgba(255,255,255,0.8)" }}/>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>dashboard-hero.png</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>2880 × 1800 · 1.4 MB</div>
            </div>
            <button style={{
              width: 24, height: 24, borderRadius: 8, border: "none",
              background: "transparent", color: T.soft, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="close" size={14}/>
            </button>
          </div>
        </Card>

        {/* Frame picker */}
        <Card label="프레임">
          <div style={{
            display: "flex", background: T.cardInner, padding: 3, borderRadius: 10,
            border: `1px solid ${T.border}`, marginBottom: 10,
          }}>
            {["device", "browser"].map(cat => (
              <button key={cat} onClick={() => setFrameTab(cat)} style={{
                flex: 1, padding: "7px 0", fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer", borderRadius: 7,
                background: frameTab === cat ? T.accentDark : "transparent",
                color: frameTab === cat ? "#fff" : T.soft,
                transition: "all .15s",
              }}>
                {cat === "device" ? "디바이스" : "브라우저"}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {frames[frameTab].map(f => {
              const active = selectedFrame === f.id;
              return (
                <button key={f.id} onClick={() => setSelectedFrame(f.id)} style={{
                  background: active ? T.accent : T.cardInner,
                  border: `1px solid ${active ? T.accent : T.border}`,
                  borderRadius: 10, padding: "10px 10px",
                  fontSize: 11.5, fontWeight: 600, color: T.text,
                  textAlign: "left", cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4,
                  minHeight: 36,
                }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.label}</span>
                  {active && <Icon name="check" size={12}/>}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Image adjust */}
        <Card label="이미지 조정" hint={`${scale.toFixed(2)}×`}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="zoom" size={14} className=""/>
            <div style={{ flex: 1, position: "relative", height: 16, display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%", height: 4, background: T.cardInner, borderRadius: 4, border: `1px solid ${T.border}` }}/>
              <div style={{ position: "absolute", left: 0, height: 4, background: T.accentDark, borderRadius: 4, width: `${((scale - 0.5) / 2.5) * 100}%` }}/>
              <input type="range" min="0.5" max="3" step="0.01" value={scale} onChange={e => setScale(+e.target.value)} style={{
                position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer",
              }}/>
              <div style={{
                position: "absolute", left: `calc(${((scale - 0.5) / 2.5) * 100}% - 7px)`,
                width: 14, height: 14, borderRadius: 14, background: "#fff",
                border: `2px solid ${T.accentDark}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)", pointerEvents: "none",
              }}/>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <span style={{ fontSize: 10.5, color: T.muted }}>드래그로 위치 조절</span>
            <button style={{
              fontSize: 11, fontWeight: 600, color: T.soft,
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4, padding: 0,
              fontFamily: "inherit",
            }}>
              <Icon name="reset" size={11}/> 초기화
            </button>
          </div>
        </Card>

        {/* Shadow */}
        <Card label="그림자" hint={shadow ? `${opacity}%` : "OFF"}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: shadow ? 12 : 0 }}>
            <button onClick={() => setShadow(!shadow)} style={{
              width: 32, height: 18, borderRadius: 18, border: "none",
              background: shadow ? T.accentDark : "#d5d5d3",
              position: "relative", cursor: "pointer", padding: 0,
              transition: "background .15s",
            }}>
              <div style={{
                position: "absolute", top: 2, left: shadow ? 16 : 2,
                width: 14, height: 14, borderRadius: 14, background: "#fff",
                transition: "left .15s",
              }}/>
            </button>
            <span style={{ fontSize: 12, fontWeight: 500, color: shadow ? T.text : T.muted }}>그림자 활성화</span>
          </div>
          {shadow && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="shadow" size={14}/>
              <div style={{ flex: 1, position: "relative", height: 16, display: "flex", alignItems: "center" }}>
                <div style={{ width: "100%", height: 4, background: T.cardInner, borderRadius: 4, border: `1px solid ${T.border}` }}/>
                <div style={{ position: "absolute", left: 0, height: 4, background: T.accentDark, borderRadius: 4, width: `${opacity}%` }}/>
                <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(+e.target.value)} style={{
                  position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer",
                }}/>
                <div style={{
                  position: "absolute", left: `calc(${opacity}% - 7px)`,
                  width: 14, height: 14, borderRadius: 14, background: "#fff",
                  border: `2px solid ${T.accentDark}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)", pointerEvents: "none",
                }}/>
              </div>
              <span style={{ width: 32, fontSize: 11, fontWeight: 600, textAlign: "right", color: T.text }}>{opacity}</span>
            </div>
          )}
        </Card>

        {/* Export */}
        <Card label="내보내기" style={{ marginTop: "auto", background: T.accentDark, borderColor: T.accentDark }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[1, 2, 3].map(s => (
              <button key={s} onClick={() => setExportScale(s)} style={{
                flex: 1, padding: "7px 0", fontSize: 12, fontWeight: 600,
                borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                background: exportScale === s ? T.accent : "rgba(255,255,255,0.06)",
                color: exportScale === s ? T.accentDark : "#fff",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all .15s",
              }}>{s}×</button>
            ))}
          </div>
          <button style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            background: T.accent, color: T.accentDark,
            border: "none", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Icon name="download" size={14} strokeWidth={2}/> PNG 저장
          </button>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 8, textAlign: "center" }}>
            약 5760 × 3600 · 예상 4.2 MB
          </div>
        </Card>

        {/* Override label color for dark card */}
        <style>{`
          /* noop */
        `}</style>
      </aside>

      {/* ===== Preview area ===== */}
      <main style={{
        background: T.card,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        padding: 16,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Preview toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14, padding: "0 2px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.soft, letterSpacing: ".04em", textTransform: "uppercase" }}>미리보기</div>
            <div style={{ fontSize: 11, color: T.muted, background: T.cardInner, border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 7px", fontWeight: 500 }}>
              MacBook Pro 16″ · 3456 × 2160
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { icon: "layers", label: "레이어" },
              { icon: "refresh", label: "새로고침" },
              { icon: "lock", label: "비율 고정" },
            ].map((b, i) => (
              <button key={i} style={{
                width: 28, height: 28, borderRadius: 8,
                border: `1px solid ${T.border}`, background: T.cardInner,
                cursor: "pointer", color: T.soft,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={b.icon} size={13}/>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1, borderRadius: 14, overflow: "hidden",
          background: `url(../assets/checkerboard.svg)`,
          backgroundRepeat: "repeat",
          backgroundSize: "20px 20px",
          border: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px",
          position: "relative",
        }}>
          {/* Corner coords */}
          <div style={{ position: "absolute", top: 10, left: 12, fontSize: 10, color: T.muted, fontFamily: "ui-monospace, monospace", letterSpacing: ".02em" }}>0, 0</div>
          <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, color: T.muted, fontFamily: "ui-monospace, monospace", letterSpacing: ".02em" }}>3456 × 2160</div>

          <div style={{ width: "min(100%, 720px)" }}>
            <MockFramedShot tone="light"/>
          </div>
        </div>

        {/* Footer status strip */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 12, fontSize: 11, color: T.muted,
        }}>
          <div style={{ display: "flex", gap: 14 }}>
            <span><span style={{ fontWeight: 600, color: T.soft }}>배율</span> {scale.toFixed(2)}×</span>
            <span><span style={{ fontWeight: 600, color: T.soft }}>오프셋</span> 0, 0</span>
            <span><span style={{ fontWeight: 600, color: T.soft }}>그림자</span> {shadow ? `${opacity}%` : "없음"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: "#4ca24f" }}/>
            준비됨
          </div>
        </div>
      </main>
    </div>
  );
};

window.VariationA = VariationA;
