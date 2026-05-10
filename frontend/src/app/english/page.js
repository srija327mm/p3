"use client";

import { useState, useEffect, useMemo } from "react";
import ConfirmDialog from "../ConfirmDialog";
import { apiFetch } from "../../lib/api";

const API_BASE = "http://localhost:8000";
const API = `${API_BASE}/api/english/`;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function EnglishPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    apiFetch(API)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setItems)
      .catch((e) => setError(`Failed to load entries: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        (i.day || "").includes(q) ||
        (i.description || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  function openNewModal() {
    setEditingItem(null);
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingItem(null);
  }

  function handleSaved(saved, wasEdit) {
    if (wasEdit) {
      setItems((list) => list.map((i) => (i.id === saved.id ? saved : i)));
    } else {
      setItems([saved, ...items]);
    }
    closeModal();
  }

  async function confirmDelete() {
    const item = confirmTarget;
    setConfirmTarget(null);
    if (!item) return;
    try {
      const res = await apiFetch(`${API}${item.id}/`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setItems((list) => list.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My English Today</h1>

      <div style={styles.headerCard}>
        <div style={styles.breadcrumb}>
          <span style={{ fontWeight: 700 }}>My English Today</span>
          <span style={{ color: "#9ca3af" }}>›</span>
          <span style={{ fontWeight: 700 }}>Entries</span>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          style={styles.search}
        />
        <button type="button" onClick={openNewModal} style={styles.primaryBtn}>
          New Entry
        </button>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.col}>Day</div>
          <div style={styles.col}>Description</div>
          <div style={styles.col}>Actions</div>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            No entries yet. Click &quot;New Entry&quot; to add one.
          </div>
        ) : (
          filtered.map((i) => (
            <div key={i.id} style={styles.row}>
              <div style={styles.col}>{formatDay(i.day)}</div>
              <div style={{ ...styles.col, ...styles.notesPreview }}>
                {i.description || <span style={{ color: "#9ca3af" }}>—</span>}
              </div>
              <div style={{ ...styles.col, display: "flex", gap: "0.4rem" }}>
                <button
                  type="button"
                  onClick={() => openEditModal(i)}
                  style={styles.iconBtn}
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmTarget(i)}
                  style={{ ...styles.iconBtn, color: "#f87171" }}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <EnglishModal
          editing={editingItem}
          onClose={closeModal}
          onSaved={handleSaved}
          onError={setError}
        />
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete entry?"
        message={
          confirmTarget
            ? `Are you sure you want to delete the entry for ${formatDay(confirmTarget.day)}?`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}

function EnglishModal({ editing, onClose, onSaved, onError }) {
  const isEdit = !!editing;
  const [day, setDay] = useState(editing?.day || todayISO());
  const [description, setDescription] = useState(editing?.description || "");
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (!day) return;
    setSaving(true);
    try {
      const url = isEdit ? `${API}${editing.id}/` : API;
      const method = isEdit ? "PATCH" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ day, description }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onSaved(await res.json(), isEdit);
    } catch (err) {
      onError(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.modalBackdrop} onClick={() => !saving && onClose()}>
      <div
        style={{ ...styles.modal, width: "min(640px, 95vw)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h2 style={{ flex: 1, textAlign: "center", margin: 0 }}>
            {isEdit ? "Edit Entry" : "New Entry"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={styles.closeBtn}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={save} style={{ padding: "1.25rem" }}>
          <label style={{ ...styles.label, marginBottom: "1rem" }}>
            Day <span style={{ color: "#dc2626" }}>*</span>
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="What did you learn or practice in English today?"
              style={{ ...styles.input, resize: "vertical", fontFamily: "inherit" }}
            />
          </label>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
              marginTop: "1.25rem",
              paddingTop: "1rem",
              borderTop: "1px solid #3a3a3a",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={styles.secondaryBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.primaryBtn}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDay(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  headerCard: {
    background: "#1a1a1a",
    borderRadius: 10,
    padding: "1rem 1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
    marginBottom: "1rem",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1rem",
    color: "#fff",
  },
  search: {
    flex: 1,
    padding: "0.6rem 0.85rem",
    border: "1px solid #3a3a3a",
    borderRadius: 8,
    fontSize: "0.95rem",
    outline: "none",
    color: "#fff",
    background: "#2a2a2a",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "0.65rem 1.1rem",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#2a2a2a",
    color: "#fff",
    border: "1px solid #3a3a3a",
    padding: "0.65rem 1.1rem",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0 0.5rem",
  },
  errorBanner: {
    background: "#3a1414",
    color: "#fca5a5",
    border: "1px solid #7f1d1d",
    padding: "0.85rem 1rem",
    borderRadius: 8,
    marginBottom: "1rem",
  },
  tableCard: {
    background: "#1a1a1a",
    borderRadius: 10,
    boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.4fr 3fr 110px",
    background: "#262626",
    padding: "0.9rem 1rem",
    fontWeight: 700,
    color: "#fff",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1.4fr 3fr 110px",
    padding: "0.9rem 1rem",
    borderTop: "1px solid #333",
    alignItems: "center",
    color: "#fff",
  },
  col: {
    paddingRight: "0.5rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  notesPreview: {
    maxHeight: 80,
    overflow: "hidden",
    fontSize: "0.9rem",
    color: "#cbd5e1",
    whiteSpace: "pre-wrap",
  },
  empty: {
    padding: "3rem 1rem",
    textAlign: "center",
    color: "#9ca3af",
  },
  iconBtn: {
    background: "transparent",
    border: "1px solid #3a3a3a",
    color: "#d1d5db",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.3rem 0.55rem",
    borderRadius: 4,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "5vh",
    zIndex: 50,
    overflowY: "auto",
  },
  modal: {
    background: "#1a1a1a",
    color: "#fff",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #3a3a3a",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.95rem",
    fontWeight: 500,
    color: "#d1d5db",
    gap: "0.4rem",
  },
  input: {
    padding: "0.65rem 0.85rem",
    border: "1px solid #3a3a3a",
    borderRadius: 8,
    fontSize: "0.95rem",
    background: "#2a2a2a",
    color: "#fff",
    outline: "none",
  },
};
