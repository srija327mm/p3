"use client";

import { useState, useEffect } from "react";
import ConfirmDialog from "../ConfirmDialog";
import { apiFetch } from "../../lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API = `${API_BASE}/api/bucketlist/`;

export default function BucketListPage() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    apiFetch(API)
      .then((r) => {
        if (!r.ok) throw new Error("failed to load");
        return r.json();
      })
      .then((data) => setItems(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function addItem(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    try {
      const res = await apiFetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("failed to add");
      const created = await res.json();
      setItems([created, ...items]);
      setInput("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleItem(item) {
    const next = !item.done;
    setItems((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, done: next } : t))
    );
    try {
      const res = await apiFetch(`${API}${item.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) throw new Error("failed to update");
    } catch (err) {
      setItems((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, done: !next } : t))
      );
      setError(err.message);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingText(item.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  async function saveEdit(item) {
    const text = editingText.trim();
    if (!text || text === item.text) {
      cancelEdit();
      return;
    }
    try {
      const res = await apiFetch(`${API}${item.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("failed to update");
      setItems((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, text } : t))
      );
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    const item = confirmTarget;
    setConfirmTarget(null);
    if (!item) return;
    try {
      const res = await apiFetch(`${API}${item.id}/`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("failed to delete");
      setItems((prev) => prev.filter((t) => t.id !== item.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Bucket List</h1>
      <form onSubmit={addItem} style={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="add a bucket list item"
          style={styles.input}
        />
        <button type="submit" style={styles.addBtn}>Add</button>
      </form>
      {error && <p style={{ color: "tomato" }}>{error}</p>}
      {loading ? (
        <p style={{ color: "#fff" }}>loading...</p>
      ) : (
        <ul style={styles.list}>
          {items.map((t) => (
            <li key={t.id} style={styles.item}>
              <input
                type="checkbox"
                checked={!!t.done}
                onChange={() => toggleItem(t)}
              />
              {editingId === t.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(t);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                  style={{ ...styles.input, flex: 1 }}
                />
              ) : (
                <span
                  style={{
                    flex: 1,
                    color: "#fff",
                    textDecoration: t.done ? "line-through" : "none",
                    opacity: t.done ? 0.6 : 1,
                  }}
                >
                  {t.text}
                </span>
              )}
              {editingId === t.id ? (
                <>
                  <button onClick={() => saveEdit(t)} style={styles.iconBtn} title="Save">✓</button>
                  <button onClick={cancelEdit} style={styles.iconBtn} title="Cancel">✕</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(t)} style={styles.iconBtn} title="Edit">✎</button>
                  <button onClick={() => setConfirmTarget(t)} style={{ ...styles.iconBtn, color: "#f87171" }} title="Delete">🗑</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete item?"
        message={confirmTarget ? `Are you sure you want to delete "${confirmTarget.text}"?` : ""}
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
    fontSize: "2rem",
    fontWeight: 800,
    marginBottom: "1rem",
    color: "#fff",
  },
  form: {
    display: "flex",
    gap: "0.5rem",
    margin: "1rem 0",
  },
  input: {
    flex: 1,
    padding: "0.65rem 0.85rem",
    background: "#2a2a2a",
    border: "1px solid #3a3a3a",
    borderRadius: 6,
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
  },
  addBtn: {
    padding: "0.65rem 1.25rem",
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    padding: "0.65rem 0",
    borderBottom: "1px solid #333",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "#d1d5db",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.25rem 0.5rem",
    borderRadius: 4,
  },
};
