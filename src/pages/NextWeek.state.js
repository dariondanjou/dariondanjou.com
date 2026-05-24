// Shared state for /nextweek + /nextweek/shot/:id.
// Persists per-shot overrides (status, notes, custom image, edited copy)
// in localStorage so navigation between the two routes never drops state.

import { useCallback, useEffect, useState } from "react";
import { NW_SCENES } from "./NextWeek.data";

const STORAGE_KEY = "nw_shot_overrides_v1";

// Status enum: 'pending' | 'completed' | 'skipped' | 'deleted'
export const STATUS = Object.freeze({
  PENDING: "pending",
  COMPLETED: "completed",
  SKIPPED: "skipped",
  DELETED: "deleted",
});

// Build static lookups from the canonical shot list.
const FLAT_SHOTS = NW_SCENES.flatMap(sc => sc.shots);
const SHOT_BY_ID = Object.fromEntries(FLAT_SHOTS.map(s => [s.id, s]));
const SCENE_OF_SHOT = (() => {
  const m = {};
  NW_SCENES.forEach(sc => sc.shots.forEach(s => { m[s.id] = sc; }));
  return m;
})();
const SEQ_OF_SHOT = Object.fromEntries(FLAT_SHOTS.map((s, i) => [s.id, i + 1]));

export function getScene(id) { return SCENE_OF_SHOT[id]; }
export function getSeq(id) { return SEQ_OF_SHOT[id]; }
export function getBaseShot(id) { return SHOT_BY_ID[id]; }
export function getAllShots() { return FLAT_SHOTS; }

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    // Most likely a quota error from a large data-URL image.
    console.warn("[nextweek] Failed to persist shot state:", err);
  }
}

// Merge canonical shot data with any user override for the given id.
export function mergeShot(id, overrides) {
  const base = SHOT_BY_ID[id];
  if (!base) return null;
  const o = overrides[id] || {};
  return {
    ...base,
    status: o.status || STATUS.PENDING,
    notes: o.notes || "",
    imgOverride: o.imgOverride || null,
    // Editable script-derived fields fall back to the canonical text.
    type: o.type ?? base.type,
    move: o.move ?? base.move,
    ctx: o.ctx ?? base.ctx,
    cov: o.cov ?? base.cov,
  };
}

// Hook: full overrides map + setters for individual fields/shots.
export function useShotOverrides() {
  const [overrides, setOverrides] = useState(() => readStore());

  // Keep tabs in sync — if another tab edits, refresh our copy.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setOverrides(readStore());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((id, patch) => {
    setOverrides(prev => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), ...patch } };
      // If a patch resets a field to its base value, drop it to keep storage lean.
      const merged = next[id];
      const base = SHOT_BY_ID[id] || {};
      const cleaned = {};
      Object.keys(merged).forEach(k => {
        const v = merged[k];
        const isStatusDefault = k === "status" && (v === STATUS.PENDING || !v);
        const isEmptyString = (k === "notes" || k === "imgOverride") && (v === "" || v == null);
        const matchesBase = k in base && v === base[k];
        if (!isStatusDefault && !isEmptyString && !matchesBase) cleaned[k] = v;
      });
      if (Object.keys(cleaned).length === 0) {
        const { [id]: _, ...rest } = next;
        writeStore(rest);
        return rest;
      }
      next[id] = cleaned;
      writeStore(next);
      return next;
    });
  }, []);

  const setStatus = useCallback((id, status) => update(id, { status }), [update]);
  const setNotes = useCallback((id, notes) => update(id, { notes }), [update]);
  const setImage = useCallback((id, imgOverride) => update(id, { imgOverride }), [update]);
  const setField = useCallback((id, field, value) => update(id, { [field]: value }), [update]);

  const getMerged = useCallback((id) => mergeShot(id, overrides), [overrides]);

  return { overrides, setStatus, setNotes, setImage, setField, getMerged };
}

// Convenience: status of a single shot, computed from overrides.
export function statusOf(overrides, id) {
  return overrides[id]?.status || STATUS.PENDING;
}
