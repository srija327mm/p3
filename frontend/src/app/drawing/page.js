"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import ConfirmDialog from "../ConfirmDialog";
import { apiFetch } from "../../lib/api";

const API_BASE = "http://localhost:8000";
const API = `${API_BASE}/api/drawings/`;

const SketchCanvas = dynamic(() => import("./SketchCanvas"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #3a3a3a",
        borderRadius: 8,
        height: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
      }}
    >
      Loading canvas...
    </div>
  ),
});

const PALETTE = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function DrawingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState("");
  const [initialData, setInitialData] = useState({ lines: [], texts: [] });

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [mode, setMode] = useState("draw");
  const [pendingText, setPendingText] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const exportRef = useRef(() => ({ lines: [], texts: [] }));
  const clearRef = useRef(() => {});
  const hasContentRef = useRef(() => false);

  const registerExport = useCallback((fn) => { exportRef.current = fn; }, []);
  const registerClear = useCallback((fn) => { clearRef.current = fn; }, []);
  const registerHasContent = useCallback((fn) => { hasContentRef.current = fn; }, []);

  useEffect(() => {
    apiFetch(API)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setItems)
      .catch((e) => setError(`Failed to load: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  function newDrawing() {
    setEditingItem(null);
    setName("");
    setInitialData({ lines: [], texts: [] });
    clearRef.current();
  }

  function loadDrawing(item) {
    setEditingItem(item);
    setName(item.name || "");
    setInitialData(item.data || { lines: [], texts: [] });
  }

  async function saveDrawing() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name before saving.");
      return;
    }
    setSaving(true);
    try {
      const data = exportRef.current() || { lines: [], texts: [] };
      const url = editingItem ? `${API}${editingItem.id}/` : API;
      const method = editingItem ? "PATCH" : "POST";
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, data }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      if (editingItem) {
        setItems((list) => list.map((i) => (i.id === saved.id ? saved : i)));
      } else {
        setItems((list) => [saved, ...list]);
      }
      setEditingItem(saved);
      setError(null);
    } catch (err) {
      setError(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const item = confirmTarget;
    setConfirmTarget(null);
    if (!item) return;
    try {
      const res = await apiFetch(`${API}${item.id}/`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setItems((list) => list.filter((i) => i.id !== item.id));
      if (editingItem?.id === item.id) newDrawing();
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Drawing</h1>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <button type="button" onClick={newDrawing} style={styles.primaryBtn}>
            + New
          </button>
          <div style={styles.savedHeader}>Saved</div>
          {loading ? (
            <div style={styles.muted}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={styles.muted}>No saved drawings yet.</div>
          ) : (
            <ul style={styles.savedList}>
              {items.map((it) => (
                <li
                  key={it.id}
                  style={{
                    ...styles.savedItem,
                    ...(editingItem?.id === it.id ? styles.savedItemActive : {}),
                  }}
                >
                  <button
                    type="button"
                    onClick={() => loadDrawing(it)}
                    style={styles.savedItemBtn}
                    title="Open"
                  >
                    {it.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmTarget(it)}
                    style={{ ...styles.iconBtn, color: "#f87171" }}
                    title="Delete"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section style={styles.workspace}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div style={styles.toolbar}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Drawing name"
              style={{ ...styles.input, flex: "0 1 220px" }}
            />

            <div style={styles.divider} />

            <div style={styles.toolGroup} title="Mode">
              <button
                type="button"
                onClick={() => setMode("draw")}
                style={mode === "draw" ? styles.toggleOn : styles.toggleOff}
              >
                ✎ Draw
              </button>
              <button
                type="button"
                onClick={() => setMode("text")}
                style={mode === "text" ? styles.toggleOn : styles.toggleOff}
              >
                T Text
              </button>
            </div>

            <div style={styles.divider} />

            <div style={styles.toolGroup}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    ...styles.swatch,
                    background: c,
                    outline: color === c ? "2px solid #60a5fa" : "1px solid #3a3a3a",
                  }}
                  aria-label={`Color ${c}`}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={styles.colorInput}
                title="Custom color"
              />
            </div>

            <div style={styles.divider} />

            <label style={{ ...styles.toolGroup, color: "#d1d5db", fontSize: "0.85rem" }}>
              Size
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{ width: 100 }}
              />
              <span style={{ minWidth: 18, textAlign: "right" }}>{brushSize}</span>
            </label>

            <div style={styles.divider} />

            <button
              type="button"
              onClick={() => clearRef.current?.()}
              style={styles.secondaryBtn}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={saveDrawing}
              disabled={saving}
              style={styles.primaryBtn}
            >
              {saving ? "Saving..." : editingItem ? "Update" : "Save"}
            </button>
          </div>

          {mode === "text" && (
            <div style={styles.textBar}>
              <input
                type="text"
                value={pendingText}
                onChange={(e) => setPendingText(e.target.value)}
                placeholder="Type text, then click on the canvas to place it"
                style={{ ...styles.input, flex: 1 }}
              />
            </div>
          )}

          <SketchCanvas
            initialData={initialData}
            color={color}
            brushSize={brushSize}
            mode={mode}
            pendingText={pendingText}
            onTextPlaced={() => setPendingText("")}
            registerExport={registerExport}
            registerClear={registerClear}
            registerHasContent={registerHasContent}
          />
        </section>
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete drawing?"
        message={confirmTarget ? `Are you sure you want to delete "${confirmTarget.name}"?` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

const styles = {
  page: {
    background: "transparent",
    minHeight: "100%",
    padding: "1.5rem",
    color: "#fff",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 800,
    marginBottom: "1rem",
    color: "#fff",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "1rem",
    alignItems: "start",
  },
  sidebar: {
    background: "#1a1a1a",
    border: "1px solid #3a3a3a",
    borderRadius: 10,
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  savedHeader: {
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9ca3af",
    marginTop: "0.5rem",
  },
  savedList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  savedItem: {
    display: "flex",
    gap: "0.35rem",
    alignItems: "center",
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    padding: "0.25rem",
  },
  savedItemActive: {
    border: "1px solid #2563eb",
  },
  savedItemBtn: {
    flex: 1,
    background: "transparent",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    padding: "0.4rem 0.5rem",
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  workspace: {
    background: "#1a1a1a",
    border: "1px solid #3a3a3a",
    borderRadius: 10,
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
    alignItems: "center",
  },
  textBar: {
    display: "flex",
    gap: "0.5rem",
  },
  toolGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    background: "#3a3a3a",
  },
  toggleOn: {
    background: "#2563eb",
    color: "#fff",
    border: "1px solid #2563eb",
    padding: "0.4rem 0.7rem",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  toggleOff: {
    background: "#2a2a2a",
    color: "#fff",
    border: "1px solid #3a3a3a",
    padding: "0.4rem 0.7rem",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "1px solid #3a3a3a",
    cursor: "pointer",
    padding: 0,
  },
  colorInput: {
    width: 32,
    height: 28,
    background: "transparent",
    border: "1px solid #3a3a3a",
    borderRadius: 4,
    cursor: "pointer",
    padding: 0,
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "0.55rem 1rem",
    borderRadius: 6,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#2a2a2a",
    color: "#fff",
    border: "1px solid #3a3a3a",
    padding: "0.5rem 0.9rem",
    borderRadius: 6,
    fontWeight: 600,
    cursor: "pointer",
  },
  iconBtn: {
    background: "transparent",
    border: "1px solid #3a3a3a",
    color: "#d1d5db",
    cursor: "pointer",
    fontSize: "0.95rem",
    padding: "0.25rem 0.5rem",
    borderRadius: 4,
  },
  input: {
    padding: "0.55rem 0.75rem",
    border: "1px solid #3a3a3a",
    borderRadius: 6,
    fontSize: "0.95rem",
    fontFamily: "inherit",
    background: "#2a2a2a",
    color: "#fff",
    outline: "none",
  },
  errorBanner: {
    background: "#3a1414",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    padding: "0.65rem 0.9rem",
    borderRadius: 8,
  },
  muted: {
    color: "#9ca3af",
    fontSize: "0.9rem",
  },
};
