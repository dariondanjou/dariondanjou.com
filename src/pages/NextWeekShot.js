import React, { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NW_SCENES, NW_SCRIPT_URL, NW_SCRIPT_LABEL } from "./NextWeek.data";
import { useShotOverrides, STATUS, getScene, getSeq, getBaseShot } from "./NextWeek.state";
import "./NextWeek.css";

const NW = {
  bg: "#ECE6D8",
  surface: "#F4F0E6",
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
  vfx: "#2F6B3B",
  env: "#7A3B2C",
  display: '"Geist", -apple-system, system-ui, sans-serif',
  ui: '"Geist", "Inter", -apple-system, system-ui, sans-serif',
  mono: '"Geist Mono", "IBM Plex Mono", ui-monospace, monospace',
};

// Static image lookup shared with the index page (kept inline to avoid a
// circular dep through NextWeek.js).
const FLAT_SHOTS = NW_SCENES.flatMap(sc => sc.shots);
const IMG_COUNT = 131;
const IMG_OVERRIDES = { 123: "123-ECU-hand.png", 131: "131-B5-ServerWatching.png" };
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

// Editable contentEditable component (mirrors NextWeek.js Editable).
function Editable({ value, onChange, multiline = false, style = {}, placeholder = "", tag = "p" }) {
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
      className="nw-edit"
      style={style}
    />
  );
}

function StatusPill({ status }) {
  const map = {
    [STATUS.PENDING]:   { label: "Pending",   bg: "rgba(15,14,12,0.08)", color: NW.text,    border: "rgba(15,14,12,0.18)" },
    [STATUS.COMPLETED]: { label: "Filmed",    bg: NW.doneSoft,          color: NW.done,     border: NW.done },
    [STATUS.SKIPPED]:   { label: "Skipped",   bg: "rgba(15,14,12,0.06)", color: NW.textDim, border: NW.borderStrong },
    [STATUS.DELETED]:   { label: "Deleted",   bg: "rgba(122,59,44,0.10)", color: NW.env,    border: NW.env },
  };
  const t = map[status] || map[STATUS.PENDING];
  return (
    <span style={{
      padding: "5px 10px",
      fontFamily: NW.mono, fontSize: 11, fontWeight: 800,
      letterSpacing: 1.4, textTransform: "uppercase",
      background: t.bg, color: t.color,
      border: `2px solid ${t.border}`,
    }}>{t.label}</span>
  );
}

function ActionBtn({ children, onClick, active, tone = "default" }) {
  const isDanger = tone === "danger";
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        background: active ? NW.text : "transparent",
        color: active ? NW.bg : (isDanger ? NW.env : NW.text),
        border: `2px solid ${active ? NW.text : (isDanger ? NW.env : NW.text)}`,
        fontFamily: NW.mono, fontSize: 11, fontWeight: 700,
        letterSpacing: 1, textTransform: "uppercase",
        cursor: "pointer", borderRadius: 0,
        boxShadow: `2px 2px 0 ${active ? NW.text : (isDanger ? NW.env : NW.text)}`,
      }}
    >
      {children}
    </button>
  );
}

function VfxBadge({ tag }) {
  const isEnv = tag === "ENV";
  return (
    <span style={{
      padding: "5px 10px",
      fontFamily: NW.mono, fontSize: 11, fontWeight: 800,
      letterSpacing: 1.4, color: "#fff",
      background: isEnv ? NW.env : NW.vfx,
    }}>
      {tag === "ENV" ? "AI · ENV" : tag === "VFX?" ? "VFX?" : "AI · VFX"}
    </span>
  );
}

function MetaRow({ label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", gap: 14,
      padding: "10px 0", borderBottom: `1px solid ${NW.border}`,
    }}>
      <div style={{
        fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700,
        color: NW.textDim, letterSpacing: 1.4, textTransform: "uppercase",
        minWidth: 110,
      }}>{label}</div>
      <div style={{ fontFamily: NW.ui, fontSize: 14, fontWeight: 600, color: NW.text }}>{value}</div>
    </div>
  );
}

export default function NextWeekShot() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { setStatus, setImage, setField, getMerged } = useShotOverrides();

  // Tag <html> for route-scoped CSS (same as the index page).
  useEffect(() => {
    document.documentElement.classList.add("nw-route-active");
    return () => document.documentElement.classList.remove("nw-route-active");
  }, []);

  const base = getBaseShot(id);
  // Title management runs even when shot is missing so the cleanup is consistent.
  useEffect(() => {
    const prev = document.title;
    document.title = base
      ? `Shot ${id} · Next Week — Darion D'Anjou`
      : "Shot not found · Next Week";
    return () => { document.title = prev; };
  }, [id, base]);

  if (!base) {
    return (
      <div className="nw-page" style={{ padding: 40, textAlign: "center" }}>
        <h1 style={{ fontFamily: NW.display, fontSize: 32, color: NW.text }}>Shot &ldquo;{id}&rdquo; not found</h1>
        <Link to="/nextweek" style={{ color: NW.blueDeep, fontFamily: NW.mono, marginTop: 16, display: "inline-block" }}>
          &larr; Back to shot list
        </Link>
      </div>
    );
  }

  const shot = getMerged(id);
  const scene = getScene(id);
  const seq = String(getSeq(id)).padStart(3, "0");
  const src = shot.imgOverride || SHOT_IMG[id];
  const completed = shot.status === STATUS.COMPLETED;

  const handlePickImage = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(id, reader.result);
    reader.onerror = () => alert("Failed to read image.");
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const handleResetImage = () => {
    if (window.confirm("Remove the uploaded image for this shot and revert to the default storyboard?")) {
      setImage(id, "");
    }
  };
  const handleDelete = () => {
    if (window.confirm(`Delete shot ${id}? It will be hidden from the main list until you toggle "Show deleted".`)) {
      setStatus(id, STATUS.DELETED);
      navigate("/nextweek");
    }
  };
  const handleRestore = () => setStatus(id, STATUS.PENDING);

  return (
    <div className="nw-page">
      {/* Sticky nav (lightweight version of the index nav). */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(236,230,216,0.92)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `2px solid ${NW.text}`,
      }}>
        <div className="nw-shell" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0", gap: 20,
        }}>
          <Link to="/nextweek" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: NW.mono, fontSize: 11, fontWeight: 700,
            color: NW.text, textDecoration: "none",
            letterSpacing: 1.2, textTransform: "uppercase",
          }}>
            <span aria-hidden="true">&larr;</span>
            Back to shot list
          </Link>
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
        </div>
      </nav>

      <main className="nw-shell" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {/* Title row */}
        <header style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: 24, flexWrap: "wrap", marginBottom: 24,
        }}>
          <div>
            <div style={{
              fontFamily: NW.mono, fontSize: 11, fontWeight: 700,
              color: NW.textDim, letterSpacing: 1.6, textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Scene {String(scene.n).padStart(2, "0")} · {scene.title}
            </div>
            <h1 style={{
              fontFamily: NW.display, fontSize: 88, fontWeight: 900,
              letterSpacing: -4, lineHeight: 0.9, margin: 0,
              color: NW.text, textTransform: "uppercase",
              display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap",
            }}>
              <span style={{ color: NW.textFaint, fontWeight: 500, fontSize: 56 }}>{seq}</span>
              <span style={{ background: NW.blue, padding: "0 14px 4px" }}>{shot.id}</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <StatusPill status={shot.status}/>
            {shot.vfx && <VfxBadge tag={shot.vfx}/>}
            <span style={{
              padding: "5px 10px",
              background: "rgba(15,14,12,0.78)", color: NW.bg,
              fontFamily: NW.mono, fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
            }}>{shot.cam} · {shot.lens}</span>
          </div>
        </header>

        {/* Image — full-width hero, original aspect, click to open in new tab. */}
        <section style={{
          background: NW.text, border: `2px solid ${NW.text}`,
          boxShadow: `6px 6px 0 ${NW.text}`,
          padding: 0, marginBottom: 28,
        }}>
          {src ? (
            <a href={src} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
              <img
                src={src}
                alt={`Shot ${id} storyboard`}
                style={{
                  display: "block", width: "100%", height: "auto",
                  maxHeight: "85vh", objectFit: "contain",
                  background: NW.text,
                }}
              />
            </a>
          ) : (
            <div style={{
              padding: "120px 24px", textAlign: "center", color: NW.bg,
              fontFamily: NW.mono, fontSize: 13, letterSpacing: 1.2,
            }}>
              No storyboard image yet. Upload one below.
            </div>
          )}
        </section>

        {/* Action row — status changes, image upload, delete */}
        <section style={{
          display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32,
        }}>
          <ActionBtn
            onClick={() => setStatus(id, completed ? STATUS.PENDING : STATUS.COMPLETED)}
            active={completed}
          >
            {completed ? "Mark unfilmed" : "Mark filmed"}
          </ActionBtn>
          <ActionBtn
            onClick={() => setStatus(id, shot.status === STATUS.SKIPPED ? STATUS.PENDING : STATUS.SKIPPED)}
            active={shot.status === STATUS.SKIPPED}
          >
            {shot.status === STATUS.SKIPPED ? "Unskip" : "Skip"}
          </ActionBtn>
          <ActionBtn onClick={handlePickImage}>
            {shot.imgOverride ? "Replace image" : "Upload image"}
          </ActionBtn>
          {shot.imgOverride && (
            <ActionBtn onClick={handleResetImage}>Revert to default</ActionBtn>
          )}
          {shot.status === STATUS.DELETED ? (
            <ActionBtn onClick={handleRestore}>Restore</ActionBtn>
          ) : (
            <ActionBtn onClick={handleDelete} tone="danger">Delete</ActionBtn>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </section>

        {/* Two-column: editable script context + meta. */}
        <section style={{
          display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 36,
        }} className="nw-hero-grid">
          <div>
            <div style={{
              fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700,
              color: NW.blueDeep, letterSpacing: 1.6, textTransform: "uppercase",
              marginBottom: 8,
            }}>Shot type · Movement</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              <Editable
                tag="span"
                value={shot.type}
                onChange={v => setField(id, "type", v)}
                style={{
                  fontFamily: NW.mono, fontSize: 13, fontWeight: 700,
                  letterSpacing: 0.6, textTransform: "uppercase",
                  padding: "4px 10px",
                  background: "rgba(15,14,12,0.08)",
                  color: NW.text,
                }}
              />
              <Editable
                tag="span"
                value={shot.move}
                onChange={v => setField(id, "move", v)}
                style={{
                  fontFamily: NW.ui, fontSize: 13, fontWeight: 500,
                  color: NW.textDim, padding: "4px 4px",
                }}
              />
            </div>

            <div style={{
              fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700,
              color: NW.blueDeep, letterSpacing: 1.6, textTransform: "uppercase",
              marginBottom: 8,
            }}>Script context</div>
            <Editable
              tag="p"
              multiline
              value={shot.ctx}
              onChange={v => setField(id, "ctx", v)}
              style={{
                fontFamily: NW.display, fontSize: 24, lineHeight: 1.3,
                fontWeight: 700, color: NW.text,
                margin: "0 0 28px", letterSpacing: -0.5,
                textDecoration: completed ? "line-through" : "none",
                textDecorationColor: NW.done, textDecorationThickness: "2px",
              }}
            />

            <div style={{
              fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700,
              color: NW.blueDeep, letterSpacing: 1.6, textTransform: "uppercase",
              marginBottom: 8,
            }}>Coverage</div>
            <Editable
              tag="p"
              multiline
              value={shot.cov}
              onChange={v => setField(id, "cov", v)}
              style={{
                fontFamily: NW.ui, fontSize: 15, lineHeight: 1.5,
                color: NW.text, margin: "0 0 28px",
              }}
            />

            <div style={{
              fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700,
              color: NW.blueDeep, letterSpacing: 1.6, textTransform: "uppercase",
              marginBottom: 8,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 8, height: 8, background: NW.blue, border: `2px solid ${NW.blueDeep}` }}/>
              Notes
            </div>
            <Editable
              tag="p"
              multiline
              value={shot.notes}
              onChange={v => setField(id, "notes", v)}
              placeholder="Add a note for this shot…"
              style={{
                fontFamily: NW.ui, fontSize: 16, lineHeight: 1.5,
                color: NW.text, margin: 0, minHeight: 80,
                padding: 12, background: NW.surface,
                border: `2px solid ${NW.borderStrong}`,
              }}
            />
          </div>

          <aside>
            <div style={{
              background: NW.surface, border: `2px solid ${NW.text}`,
              boxShadow: `4px 4px 0 ${NW.text}`,
              padding: "18px 20px",
            }}>
              <div style={{
                fontFamily: NW.mono, fontSize: 10.5, fontWeight: 700,
                color: NW.textDim, letterSpacing: 1.6, textTransform: "uppercase",
                marginBottom: 12,
              }}>Shot details</div>
              <MetaRow label="Shot ID" value={shot.id}/>
              <MetaRow label="Sequence" value={`#${seq} of ${FLAT_SHOTS.length}`}/>
              <MetaRow label="Scene" value={`${String(scene.n).padStart(2, "0")} · ${scene.title}`}/>
              <MetaRow label="Setting" value={scene.setting}/>
              <MetaRow label="Camera" value={shot.cam}/>
              <MetaRow label="Lens" value={shot.lens}/>
              <MetaRow label="Movement" value={shot.move}/>
              {shot.vfx && <MetaRow label="VFX" value={shot.vfx === "ENV" ? "AI · ENV" : shot.vfx === "VFX?" ? "VFX?" : "AI · VFX"}/>}
              <MetaRow label="Storyboard" value={shot.imgOverride ? "Custom upload" : (SHOT_IMG[id] ? "Default frame" : "—")}/>
            </div>
            <div style={{ marginTop: 16, fontFamily: NW.mono, fontSize: 10.5, color: NW.textDim, letterSpacing: 0.4 }}>
              Edits are saved locally to this browser only.
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
