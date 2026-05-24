import React, { useEffect, useMemo, useRef, useState } from "react";
import { NW_PROJECT, NW_SCENES, NW_DEFAULT_DONE, NW_ACTIVE_ID, NW_SCRIPT_URL, NW_SCRIPT_LABEL } from "./NextWeek.data";
import "./NextWeek.css";

const NW = {
  bg: "#ECE6D8",
  bg2: "#E5DECC",
  surface: "#F4F0E6",
  surface2: "#FBF7EC",
  border: "rgba(15,14,12,0.10)",
  borderStrong: "rgba(15,14,12,0.22)",
  text: "#0F0E0C",
  textDim: "rgba(15,14,12,0.58)",
  textFaint: "rgba(15,14,12,0.32)",
  blue: "#A8CCDE",
  blueDeep: "#1F4A6E",
  blueSoft: "rgba(168,204,222,0.40)",
  done: "#5C7A4E",
  doneSoft: "rgba(92,122,78,0.16)",
  vfx: "#9C5B2A",
  vfxSoft: "rgba(156,91,42,0.12)",
  env: "#7A3B2C",
  envSoft: "rgba(122,59,44,0.12)",
  display: '"Geist", -apple-system, system-ui, sans-serif',
  ui: '"Geist", "Inter", -apple-system, system-ui, sans-serif',
  mono: '"Geist Mono", "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

// Build sequential index → storyboard image map.
// Images live in /public/nextweek/images/. Most are NNN.png; a few use
// descriptive suffixes — listed below so the lookup stays explicit.
const FLAT_SHOTS = NW_SCENES.flatMap(sc => sc.shots);
const IMG_COUNT = 131;
const IMG_OVERRIDES = {
  123: "123-ECU-hand.png",
  131: "131-B5-ServerWatching.png",
};
const SHOT_IMG = (() => {
  const map = {};
  FLAT_SHOTS.forEach((s, i) => {
    const n = i + 1;
    if (n <= IMG_COUNT) {
      const file = IMG_OVERRIDES[n] || `${String(n).padStart(3, "0")}.png`;
      map[s.id] = `/nextweek/images/${file}`;
    }
  });
  return map;
})();

// ─── icons ──────────────────────────────────────────────────
const Check = ({ s = 18, w = 2.4 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5l5 5L20 6.5"/>
  </svg>
);

// ─── inline editable ────────────────────────────────────────
function Editable({ value, onChange, multiline = false, className = "", style = {}, placeholder = "", tag = "span" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);
  const commit = () => {
    const next = ref.current?.innerText ?? "";
    if (next !== value) onChange && onChange(next);
  };
  const Tag = tag;
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      onBlur={commit}
      onKeyDown={e => {
        if (!multiline && e.key === "Enter") { e.preventDefault(); ref.current?.blur(); }
        if (e.key === "Escape") { e.preventDefault(); ref.current?.blur(); }
      }}
      className={`nw-edit ${className}`}
      style={style}
    />
  );
}

// ─── checkbox ───────────────────────────────────────────────
function ShotCheck({ size = 44, checked, active, onClick }) {
  return (
    <button onClick={onClick} aria-label={checked ? "Mark unfilmed" : "Mark filmed"} style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: checked ? NW.text : (active ? NW.blue : NW.surface),
      border: `2px solid ${checked ? NW.text : (active ? NW.blueDeep : NW.text)}`,
      color: checked ? NW.bg : "transparent",
      cursor: "pointer", padding: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: checked
        ? `0 2px 0 ${NW.text}`
        : (active ? `0 0 0 4px ${NW.blueSoft}, 0 2px 0 ${NW.blueDeep}` : `0 2px 0 ${NW.text}`),
      flexShrink: 0, transition: "all 0.15s",
    }}>
      {checked && <Check s={size * 0.56} w={3.2}/>}
    </button>
  );
}

// ─── storyboard frame (real image when available, fallback placeholder) ──
function Storyboard({ shot, completed, active, onToggle }) {
  const { seed = 0, id: code, cam, lens, vfx } = shot;
  const src = SHOT_IMG[code];

  // Procedural fallback palettes (for shots with no image yet)
  const palettes = [
    { a: "#D8C9A8", b: "#B8A580", glow: "rgba(168,204,222,0.55)" },
    { a: "#C9D6DD", b: "#9FB4C0", glow: "rgba(244,238,220,0.55)" },
    { a: "#E0D2B8", b: "#BFAA86", glow: "rgba(168,204,222,0.45)" },
    { a: "#B8C9D4", b: "#8FA5B4", glow: "rgba(244,238,220,0.6)" },
    { a: "#D2C4A2", b: "#A89878", glow: "rgba(168,204,222,0.5)" },
    { a: "#C2B59A", b: "#9C8E72", glow: "rgba(244,238,220,0.5)" },
  ];
  const p = palettes[seed % palettes.length];
  const subjectX = 30 + ((seed * 23) % 40);
  const horizon = 56 + ((seed * 11) % 18);
  const subjW = 18 + (seed % 5) * 6;
  const subjH = 60 + (seed % 4) * 20;

  const safeH = 23.4;
  const top = (100 - safeH) / 2;
  const bot = top + safeH;
  const dim = completed;

  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "9 / 16",
      background: src ? NW.text : `linear-gradient(180deg, ${p.a} 0%, ${p.b} 100%)`,
      borderRadius: 4, overflow: "hidden",
      boxShadow: "inset 0 0 0 1px rgba(15,14,12,0.10)",
    }}>
      {src ? (
        <img
          src={src}
          alt={`Shot ${code} storyboard`}
          loading="lazy"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: dim ? 0.4 : 1, transition: "opacity 0.2s",
          }}
        />
      ) : (
        <>
          <div style={{
            position: "absolute", inset: 0, opacity: dim ? 0.4 : 1, transition: "opacity 0.2s",
            background: `radial-gradient(ellipse 50% 30% at ${subjectX}% ${horizon - 12}%, ${p.glow}, transparent 70%)`,
          }}/>
          <div style={{
            position: "absolute", left: `${subjectX}%`, top: `${horizon - subjH * 0.5}%`,
            width: subjW, height: subjH, background: "rgba(15,14,12,0.78)",
            transform: "translateX(-50%)", borderRadius: "40% 40% 8% 8%",
            opacity: dim ? 0.4 : 1, transition: "opacity 0.2s",
          }}/>
          <div style={{
            position: "absolute", left: 0, right: 0, top: `${horizon}%`, height: 1,
            background: "rgba(15,14,12,0.18)",
          }}/>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1, pointerEvents: "none" }}>
            <defs>
              <pattern id={`nwh${seed}-${code}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke={NW.text} strokeWidth="0.6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#nwh${seed}-${code})`}/>
          </svg>
        </>
      )}

      {/* 2.4:1 SAFE AREA — letterbox bands + dashed guides */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${top}%`,
        background: "linear-gradient(180deg, rgba(15,14,12,0.16), transparent)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${100 - bot}%`,
        background: "linear-gradient(0deg, rgba(15,14,12,0.16), transparent)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", left: 6, right: 6, top: `${top}%`, height: 0,
        borderTop: "1px dashed rgba(31,74,110,0.55)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", left: 6, right: 6, bottom: `${100 - bot}%`, height: 0,
        borderTop: "1px dashed rgba(31,74,110,0.55)", pointerEvents: "none" }}/>
      <div style={{
        position: "absolute", left: 8, top: `${top}%`, transform: "translateY(-100%)",
        fontFamily: NW.mono, fontSize: 8.5, fontWeight: 600, color: NW.blueDeep,
        letterSpacing: 0.8, padding: "2px 4px 1px", pointerEvents: "none",
      }}>2.4 : 1</div>

      {/* TOP STRIP */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, padding: 10,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 8, zIndex: 3,
      }}>
        <div style={{
          padding: "4px 8px", borderRadius: 3, background: NW.text,
          fontFamily: NW.mono, fontSize: 11, fontWeight: 700,
          color: NW.bg, letterSpacing: 0.4,
        }}>{code}</div>
        <ShotCheck size={36} checked={completed} active={active} onClick={onToggle}/>
      </div>

      {/* BOTTOM STRIP */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, padding: 10,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 8, zIndex: 3,
      }}>
        <div style={{
          padding: "3px 7px", borderRadius: 2,
          background: "rgba(15,14,12,0.78)", backdropFilter: "blur(4px)",
          fontFamily: NW.mono, fontSize: 9.5, fontWeight: 600, color: NW.bg,
          letterSpacing: 0.5,
        }}>
          {cam} · {lens}
        </div>
        {vfx && <VfxBadge tag={vfx}/>}
      </div>
    </div>
  );
}

function VfxBadge({ tag }) {
  const isEnv = tag === "ENV";
  const color = isEnv ? NW.env : NW.vfx;
  return (
    <div style={{
      padding: "3px 7px", borderRadius: 2,
      fontFamily: NW.mono, fontSize: 9.5, fontWeight: 700,
      letterSpacing: 0.8, color: "#fff", background: color,
    }}>
      {tag === "ENV" ? "AI · ENV" : tag === "VFX?" ? "VFX?" : "AI · VFX"}
    </div>
  );
}

// ─── shot card ──────────────────────────────────────────────
function ShotCard({ shot, completed, active, onToggle, onEdit }) {
  return (
    <article style={{
      position: "relative",
      background: NW.surface,
      border: `2px solid ${active ? NW.blueDeep : NW.text}`,
      borderRadius: 4,
      boxShadow: active ? `6px 6px 0 ${NW.blue}` : `4px 4px 0 ${NW.text}`,
      transition: "transform 0.15s, box-shadow 0.15s",
      opacity: completed ? 0.55 : 1,
    }}>
      <div style={{ padding: 10, paddingBottom: 0 }}>
        <Storyboard shot={shot} completed={completed} active={active} onToggle={onToggle}/>
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{
          display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap",
          marginBottom: 12,
        }}>
          <Editable
            tag="span"
            value={shot.type}
            onChange={v => onEdit("type", v)}
            style={{
              fontFamily: NW.mono, fontSize: 11, fontWeight: 700,
              color: NW.text, letterSpacing: 0.6, textTransform: "uppercase",
              padding: "2px 6px",
              background: active ? NW.blue : "rgba(15,14,12,0.08)",
              borderRadius: 2,
            }}
          />
          <Editable
            tag="span"
            value={shot.move}
            onChange={v => onEdit("move", v)}
            style={{
              fontFamily: NW.ui, fontSize: 11, color: NW.textDim,
              letterSpacing: 0.1, fontWeight: 500,
            }}
          />
        </div>

        <Editable
          tag="p"
          multiline
          value={shot.ctx}
          onChange={v => onEdit("ctx", v)}
          style={{
            fontFamily: NW.display, fontSize: 17, lineHeight: 1.22,
            fontWeight: 700, color: NW.text,
            textDecoration: completed ? "line-through" : "none",
            textDecorationColor: NW.done, textDecorationThickness: "2px",
            margin: 0, letterSpacing: -0.5,
          }}
        />

        <Editable
          tag="p"
          multiline
          value={shot.cov}
          onChange={v => onEdit("cov", v)}
          style={{
            fontFamily: NW.ui, fontSize: 12.5, lineHeight: 1.45,
            color: NW.textDim, marginTop: 10, marginBottom: 0,
            letterSpacing: 0, fontWeight: 500,
          }}
        />
      </div>

      {active && (
        <div style={{
          position: "absolute", top: -2, left: 16,
          transform: "translateY(-50%)",
          padding: "4px 10px", borderRadius: 2,
          background: NW.blueDeep, color: NW.bg,
          fontFamily: NW.mono, fontSize: 10, fontWeight: 800,
          letterSpacing: 1.4,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: NW.blue,
            animation: "nw-pulse 1.4s infinite",
          }}/>
          NOW SHOOTING
        </div>
      )}
    </article>
  );
}

// ─── scene header ───────────────────────────────────────────
function SceneHeader({ scene, doneCount, totalCount }) {
  const pct = Math.round((doneCount / totalCount) * 100);
  const complete = doneCount === totalCount;
  return (
    <header id={`scene-${scene.n}`} style={{
      padding: "64px 0 24px", borderBottom: `2px solid ${NW.text}`,
      marginBottom: 24, scrollMarginTop: 80,
    }}>
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 24, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22, minWidth: 0, flex: 1 }}>
          <span className="nw-scene-num" style={{
            fontFamily: NW.display, fontSize: 132, fontWeight: 800,
            color: complete ? "#fff" : NW.text,
            background: complete ? NW.done : NW.blue,
            letterSpacing: -7, lineHeight: 0.82,
            padding: "0 14px 4px", display: "inline-block",
          }}>{scene.n.toString().padStart(2, "0")}</span>
          <div style={{ minWidth: 0, paddingBottom: 6 }}>
            <div style={{
              fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700,
              color: NW.textDim, letterSpacing: 1.6,
              textTransform: "uppercase", marginBottom: 8,
            }}>{scene.setting}</div>
            <h2 className="nw-scene-title" style={{
              fontFamily: NW.display, fontSize: 42, fontWeight: 800,
              color: NW.text, letterSpacing: -1.8, lineHeight: 0.95, margin: 0,
              textTransform: "uppercase",
            }}>{scene.title}</h2>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 10 }}>
          <div style={{
            width: 160, height: 8,
            background: "rgba(15,14,12,0.10)", overflow: "hidden",
          }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: complete ? NW.done : NW.blueDeep,
            }}/>
          </div>
          <span style={{
            fontFamily: NW.mono, fontSize: 14, fontWeight: 700, color: NW.text,
            fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right",
          }}>{doneCount}/{totalCount}</span>
        </div>
      </div>
    </header>
  );
}

// ─── site nav ───────────────────────────────────────────────
function SiteNav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(236,230,216,0.86)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: `2px solid ${NW.text}`,
    }}>
      <div className="nw-shell" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 0", gap: 20,
      }}>
        <a href="/" style={{
          fontFamily: NW.display, fontSize: 18, fontWeight: 800, color: NW.text,
          letterSpacing: -0.6, textDecoration: "none", textTransform: "uppercase",
          display: "flex", alignItems: "baseline", gap: 12,
        }}>
          DARION D&rsquo;ANJOU
          <span style={{
            fontFamily: NW.mono, fontSize: 10, fontWeight: 600, color: NW.textDim,
            letterSpacing: 1.4, textTransform: "uppercase",
          }}>Director</span>
        </a>
        <div className="nw-nav-links" style={{
          display: "flex", alignItems: "center", gap: 24,
          fontFamily: NW.ui, fontSize: 12, fontWeight: 600,
          color: NW.textDim, textTransform: "uppercase", letterSpacing: 0.6,
        }}>
          <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Films</a>
          <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Process</a>
          <a href="/nextweek" style={{
            color: NW.text, textDecoration: "none",
            background: NW.blue, padding: "4px 10px", borderRadius: 2,
          }}>Next Week</a>
          <a href="/" style={{ color: "inherit", textDecoration: "none" }}>About</a>
          <a href="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact</a>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <a
            href={NW_SCRIPT_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 10px",
              background: NW.text, color: NW.bg,
              fontFamily: NW.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: 1.2, textTransform: "uppercase",
              textDecoration: "none", borderRadius: 2,
            }}
          >
            <span style={{ width: 6, height: 6, background: NW.blue }}/>
            {NW_SCRIPT_LABEL}
            <span aria-hidden="true">&rarr;</span>
          </a>
          <div style={{
            fontFamily: NW.mono, fontSize: 10, fontWeight: 600, color: NW.textDim,
            letterSpacing: 1, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            dariondanjou.com<span style={{ color: NW.text, fontWeight: 700 }}>/nextweek</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── hero ───────────────────────────────────────────────────
function Hero({ project, totalDone, totalShots, pct }) {
  return (
    <header className="nw-shell" style={{
      paddingTop: 56, paddingBottom: 36,
      borderBottom: `1px solid ${NW.border}`,
    }}>
      <div className="nw-hero-grid" style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px",
        gap: 48, alignItems: "end",
      }}>
        <div>
          <div style={{
            fontFamily: NW.mono, fontSize: 11, color: NW.textFaint,
            letterSpacing: 1.6, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
          }}>
            <span style={{ width: 18, height: 1, background: NW.blueDeep }}/>
            Short film · Production 2035 / Shooting 2025
            <span style={{ width: 18, height: 1, background: NW.blueDeep }}/>
          </div>
          <h1 className="nw-title" style={{
            fontFamily: NW.display, fontSize: 220, fontWeight: 900,
            color: NW.text, letterSpacing: -11, lineHeight: 0.84,
            margin: 0, textTransform: "uppercase",
          }}>
            <span>NEXT</span><br/>
            <span style={{
              background: NW.blue, padding: "0 18px 8px",
              display: "inline-block", marginTop: 4,
            }}>WEEK<span style={{ color: NW.blueDeep }}>.</span></span>
          </h1>
          <p style={{
            fontFamily: NW.ui, fontSize: 21, fontWeight: 500, lineHeight: 1.4,
            color: NW.text, maxWidth: 640, marginTop: 32, marginBottom: 0,
            letterSpacing: -0.3,
          }}>
            {project.logline}
          </p>
          <a
            href={NW_SCRIPT_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              marginTop: 24,
              padding: "10px 16px",
              background: NW.surface,
              border: `2px solid ${NW.text}`,
              boxShadow: `4px 4px 0 ${NW.text}`,
              color: NW.text, textDecoration: "none",
              fontFamily: NW.mono, fontSize: 12, fontWeight: 700,
              letterSpacing: 1.4, textTransform: "uppercase",
            }}
          >
            <span style={{
              width: 10, height: 10, background: NW.blue,
              border: `2px solid ${NW.blueDeep}`,
            }}/>
            Read the script &middot; Production Final
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
        <aside style={{
          background: NW.text, color: NW.bg, padding: "24px 26px",
        }}>
          <div style={{
            fontFamily: NW.mono, fontSize: 10, fontWeight: 700, color: NW.blue,
            letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 18,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 8, height: 8, background: NW.blue }}/>
            Shot list · live
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{
              fontFamily: NW.display, fontSize: 88, fontWeight: 900,
              color: NW.bg, letterSpacing: -4, lineHeight: 0.84,
            }}>{totalDone}</span>
            <span style={{ fontFamily: NW.mono, fontSize: 13, fontWeight: 600, color: "rgba(236,230,216,0.65)" }}>
              of {totalShots} shots
            </span>
          </div>
          <div style={{
            marginTop: 18, height: 8,
            background: "rgba(236,230,216,0.15)", overflow: "hidden",
          }}>
            <div style={{ width: `${pct}%`, height: "100%", background: NW.blue }}/>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 10,
            fontFamily: NW.mono, fontSize: 11, fontWeight: 600,
            color: "rgba(236,230,216,0.7)", letterSpacing: 0.4,
            fontVariantNumeric: "tabular-nums",
          }}>
            <span>{pct}% complete</span>
            <span>{totalShots - totalDone} remaining</span>
          </div>
          <div style={{
            marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(236,230,216,0.18)",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
          }}>
            <div>
              <div style={{ fontFamily: NW.mono, fontSize: 9.5, fontWeight: 700, color: NW.blue, letterSpacing: 1.4 }}>PRIMARY</div>
              <div style={{ fontFamily: NW.ui, color: NW.bg, fontSize: 14, fontWeight: 600, marginTop: 3, letterSpacing: -0.2 }}>{project.primaryFrame}</div>
            </div>
            <div>
              <div style={{ fontFamily: NW.mono, fontSize: 9.5, fontWeight: 700, color: NW.blue, letterSpacing: 1.4 }}>SECONDARY</div>
              <div style={{ fontFamily: NW.ui, color: NW.bg, fontSize: 14, fontWeight: 600, marginTop: 3, letterSpacing: -0.2 }}>{project.secondaryFrame}</div>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}

// ─── package strip ──────────────────────────────────────────
function PackageStrip({ cameras }) {
  return (
    <section className="nw-shell" style={{ padding: "36px 0 12px" }}>
      <div style={{
        fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700, color: NW.textDim,
        letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 18,
      }}>Camera package · 2 Sony FX6 + 2 Sony FX3 · G Master primes · no 35mm · no gimbal</div>
      <div className="nw-pkg-grid">
        {cameras.map(c => (
          <div key={c.id} style={{
            background: NW.surface, border: `2px solid ${NW.text}`,
            borderRadius: 0, padding: "16px 18px",
            boxShadow: `4px 4px 0 ${NW.text}`,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{
                fontFamily: NW.display, fontSize: 26, fontWeight: 900,
                color: NW.text, letterSpacing: -1, lineHeight: 1,
                background: NW.blue, padding: "2px 8px",
              }}>{c.id}</span>
              <span style={{
                fontFamily: NW.mono, fontSize: 11, fontWeight: 600, color: NW.text,
                letterSpacing: 0.4,
              }}>{c.lenses}</span>
            </div>
            <div style={{ fontFamily: NW.ui, fontSize: 13.5, fontWeight: 600, color: NW.text, lineHeight: 1.35 }}>{c.role}</div>
            <div style={{ fontFamily: NW.ui, fontSize: 11.5, color: NW.textDim, marginTop: 6, lineHeight: 1.45 }}>{c.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── scene rail ─────────────────────────────────────────────
function shortenTitle(t) {
  return t.split(" · ")[0].replace("Stephanie Day arrives at ", "").replace("Stephanie ", "");
}
function SceneRail({ scenes, completed, onJump }) {
  return (
    <div className="nw-shell" style={{ padding: "24px 0 8px" }}>
      <div style={{
        fontFamily: NW.mono, fontSize: 10.5, color: NW.textFaint,
        letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12,
      }}>Scenes</div>
      <div className="nw-scene-rail">
        {scenes.map(s => {
          const done = s.shots.filter(sh => completed.has(sh.id)).length;
          const all = s.shots.length;
          const isDone = done === all;
          const inProgress = done > 0 && done < all;
          return (
            <a
              key={s.n}
              href={`#scene-${s.n}`}
              className="nw-scene-chip"
              onClick={e => {
                e.preventDefault();
                onJump && onJump(s.n);
              }}
              style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 0, textDecoration: "none",
              background: NW.surface, border: `2px solid ${NW.text}`,
              color: NW.text, whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: `2px 2px 0 ${NW.text}`,
            }}>
              <span style={{
                width: 26, height: 26,
                background: isDone ? NW.done : (inProgress ? NW.blue : "rgba(15,14,12,0.08)"),
                color: NW.text,
                fontFamily: NW.mono, fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                letterSpacing: 0.2,
              }}>{s.n.toString().padStart(2, "0")}</span>
              <span style={{
                fontFamily: NW.ui, fontSize: 13, color: NW.text, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 0.4,
              }}>{shortenTitle(s.title)}</span>
              <span style={{
                fontFamily: NW.mono, fontSize: 10.5, fontWeight: 600, color: NW.textDim,
                letterSpacing: 0.4, fontVariantNumeric: "tabular-nums",
              }}>{done}/{all}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── toolbar ────────────────────────────────────────────────
function ToolBar({ filter, setFilter, sceneFilter, setSceneFilter, scenes, totalDone, totalShots }) {
  const statusBtn = (key, label, count) => (
    <button key={key} onClick={() => setFilter(key)} style={{
      padding: "8px 14px", borderRadius: 0,
      background: filter === key ? NW.text : "transparent",
      border: `2px solid ${NW.text}`,
      color: filter === key ? NW.bg : NW.text,
      fontFamily: NW.ui, fontSize: 12, fontWeight: 700,
      cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
      letterSpacing: 0.6, textTransform: "uppercase",
    }}>
      {label}
      <span style={{
        fontFamily: NW.mono, fontSize: 10, fontWeight: 700,
        color: filter === key ? NW.blue : NW.textDim,
        fontVariantNumeric: "tabular-nums",
      }}>{count}</span>
    </button>
  );

  const sceneBtn = (n) => {
    const isActive = sceneFilter === n;
    const isAll = n === null;
    return (
      <button
        key={isAll ? "all" : n}
        onClick={() => setSceneFilter(n)}
        style={{
          padding: isAll ? "6px 12px" : "6px 10px",
          minWidth: isAll ? undefined : 36,
          borderRadius: 0,
          background: isActive ? NW.blueDeep : "transparent",
          border: `2px solid ${isActive ? NW.blueDeep : NW.text}`,
          color: isActive ? NW.bg : NW.text,
          fontFamily: NW.mono, fontSize: 11, fontWeight: 800,
          cursor: "pointer", letterSpacing: 0.6,
          textTransform: "uppercase",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {isAll ? "All scenes" : n.toString().padStart(2, "0")}
      </button>
    );
  };

  return (
    <div className="nw-shell" style={{
      position: "sticky", top: 55, zIndex: 20,
      padding: "14px 0",
      background: "rgba(236,230,216,0.92)", backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: `2px solid ${NW.text}`,
      display: "flex", flexDirection: "column", gap: 10, marginTop: 12,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 14, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700, color: NW.textDim,
            letterSpacing: 1.4, textTransform: "uppercase",
          }}>Status</div>
          <div style={{ display: "flex", gap: 8 }}>
            {statusBtn("all",  "All shots", totalShots)}
            {statusBtn("todo", "Remaining", totalShots - totalDone)}
            {statusBtn("done", "Filmed",    totalDone)}
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: NW.mono, fontSize: 11, fontWeight: 600, color: NW.textDim, letterSpacing: 0.4,
        }}>
          <span>Tap any text to edit · check box to mark filmed</span>
        </div>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <div style={{
          fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700, color: NW.textDim,
          letterSpacing: 1.4, textTransform: "uppercase",
        }}>Scene</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sceneBtn(null)}
          {scenes.map(s => sceneBtn(s.n))}
        </div>
      </div>
    </div>
  );
}

// ─── footer ─────────────────────────────────────────────────
function SiteFooter({ project }) {
  return (
    <footer style={{ borderTop: `2px solid ${NW.text}`, marginTop: 80, background: NW.text, color: NW.bg }}>
      <div className="nw-shell" style={{
        padding: "56px 0 40px",
        display: "grid", gridTemplateColumns: "minmax(0, 2fr) 1fr 1fr",
        gap: 36, alignItems: "start",
      }}>
        <div>
          <div style={{
            fontFamily: NW.display, fontSize: 56, fontWeight: 900, color: NW.bg,
            letterSpacing: -2.4, lineHeight: 0.92, textTransform: "uppercase",
          }}>
            Darion<br/>D&rsquo;Anjou
          </div>
          <div style={{
            fontFamily: NW.mono, fontSize: 11, fontWeight: 700, color: NW.blue,
            letterSpacing: 1.4, marginTop: 14, textTransform: "uppercase",
          }}>Director · Los Angeles</div>
          <div style={{
            fontFamily: NW.ui, fontSize: 13.5, color: "rgba(236,230,216,0.7)", lineHeight: 1.55,
            marginTop: 22, maxWidth: 480,
          }}>
            This shot list is a working document for &ldquo;{project.title}.&rdquo; Click any field to
            edit; mark shots filmed as we shoot. Updates sync to whoever has the link.
          </div>
        </div>
        <div>
          <div style={{ fontFamily: NW.mono, fontSize: 10, fontWeight: 700, color: NW.blue, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 14 }}>Crew</div>
          {["Director · Darion D’Anjou", "DP · TBD", "AD · TBD", "1st AC · TBD", "Gaffer · TBD"].map(l => (
            <div key={l} style={{ fontFamily: NW.ui, fontSize: 13.5, fontWeight: 500, color: "rgba(236,230,216,0.8)", marginBottom: 5 }}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: NW.mono, fontSize: 10, fontWeight: 700, color: NW.blue, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 14 }}>Links</div>
          {[
            { label: "Script · Production Final", href: NW_SCRIPT_URL },
            { label: "Lookbook", href: null },
            { label: "Storyboard PDF", href: null },
            { label: "Schedule", href: null },
            { label: "Callsheet", href: null },
          ].map(l => {
            const linkStyle = {
              fontFamily: NW.ui, fontSize: 13.5, fontWeight: 600,
              color: NW.bg, marginBottom: 5, display: "block",
              textDecoration: "underline",
              textDecorationColor: NW.blue, textDecorationThickness: 2, textUnderlineOffset: 3,
            };
            return l.href ? (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{l.label}</a>
            ) : (
              <div key={l.label} style={{ ...linkStyle, color: "rgba(236,230,216,0.5)", textDecorationColor: "rgba(236,230,216,0.2)" }}>{l.label}</div>
            );
          })}
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(236,230,216,0.15)" }}>
        <div className="nw-shell" style={{
          padding: "18px 0", display: "flex", justifyContent: "space-between",
          fontFamily: NW.mono, fontSize: 10.5, fontWeight: 600, color: "rgba(236,230,216,0.55)",
          letterSpacing: 0.8, flexWrap: "wrap", gap: 8, textTransform: "uppercase",
        }}>
          <span>&copy; 2025 Darion D&rsquo;Anjou · all rights reserved</span>
          <span>dariondanjou.com/nextweek · v0.4</span>
        </div>
      </div>
    </footer>
  );
}

// ─── page ───────────────────────────────────────────────────
export default function NextWeek() {
  const [completed, setCompleted] = useState(() => new Set(NW_DEFAULT_DONE));
  const [active, setActive] = useState(NW_ACTIVE_ID);
  const [shots, setShots] = useState(() => {
    const map = {};
    NW_SCENES.forEach(sc => sc.shots.forEach(s => { map[s.id] = { ...s }; }));
    return map;
  });
  const [filter, setFilter] = useState("all");
  const [sceneFilter, setSceneFilter] = useState(null); // null = all scenes, otherwise scene number

  const toggle = (id) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setActive(prevActive => prevActive === id ? null : prevActive);
  };
  const edit = (id, field, value) => {
    setShots(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const totalShots = useMemo(() => NW_SCENES.reduce((a, s) => a + s.shots.length, 0), []);
  const totalDone = completed.size;
  const pct = Math.round((totalDone / totalShots) * 100);

  // Set <title>, and tag <html> so route-scoped CSS can undo the
  // site-wide `html, body { overflow: hidden }` and `.page-content`
  // bottom padding. Cleaned up when navigating away.
  useEffect(() => {
    const prev = document.title;
    document.title = "Next Week · Shot List — Darion D'Anjou";
    document.documentElement.classList.add("nw-route-active");
    return () => {
      document.title = prev;
      document.documentElement.classList.remove("nw-route-active");
    };
  }, []);

  return (
    <div className="nw-page">
      <SiteNav/>
      <Hero project={NW_PROJECT} totalDone={totalDone} totalShots={totalShots} pct={pct}/>
      <PackageStrip cameras={NW_PROJECT.cameraPackage}/>
      <SceneRail
        scenes={NW_SCENES}
        completed={completed}
        onJump={(n) => {
          // Clear any active scene filter so the anchor target is in the DOM,
          // then scroll on the next paint.
          setSceneFilter(null);
          requestAnimationFrame(() => {
            const el = document.getElementById(`scene-${n}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }}
      />
      <ToolBar
        filter={filter} setFilter={setFilter}
        sceneFilter={sceneFilter} setSceneFilter={setSceneFilter}
        scenes={NW_SCENES}
        totalDone={totalDone} totalShots={totalShots}
      />

      <main className="nw-shell">
        {NW_SCENES.filter(s => sceneFilter == null || s.n === sceneFilter).map(scene => {
          const visibleShots = scene.shots.filter(s => {
            if (filter === "todo") return !completed.has(s.id);
            if (filter === "done") return completed.has(s.id);
            return true;
          });
          const doneInScene = scene.shots.filter(s => completed.has(s.id)).length;
          if (visibleShots.length === 0) return null;
          return (
            <section key={scene.n}>
              <SceneHeader scene={scene} doneCount={doneInScene} totalCount={scene.shots.length}/>
              <div className="nw-grid">
                {visibleShots.map(s => {
                  const data = shots[s.id];
                  return (
                    <ShotCard
                      key={s.id}
                      shot={data}
                      completed={completed.has(s.id)}
                      active={active === s.id}
                      onToggle={() => toggle(s.id)}
                      onEdit={(field, value) => edit(s.id, field, value)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <SiteFooter project={NW_PROJECT}/>
    </div>
  );
}
