"use client";

import { useState, useEffect, useMemo } from "react";
import ConfirmDialog from "../ConfirmDialog";
import { apiFetch } from "../../lib/api";

const API_BASE = "http://localhost:8000";
const API = `${API_BASE}/api/passwords/`;

export default function PasswordsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [confirmTarget, setConfirmTarget] = useState(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mail, setMail] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.mail?.toLowerCase().includes(q) ||
        i.url?.toLowerCase().includes(q)
    );
  }, [items, search]);

  function resetForm() {
    setName("");
    setPassword("");
    setMail("");
    setUrl("");
    setEditingId(null);
  }

  function openNewModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingId(item.id);
    setName(item.name || "");
    setPassword(item.password || "");
    setMail(item.mail || "");
    setUrl(item.url || "");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  async function save(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const apiUrl = editingId ? `${API}${editingId}/` : API;
      const method = editingId ? "PATCH" : "POST";
      const res = await apiFetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          password,
          mail,
          url,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      if (editingId) {
        setItems((list) => list.map((i) => (i.id === editingId ? saved : i)));
      } else {
        setItems([saved, ...items]);
      }
      closeModal();
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
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  }

  function toggleReveal(id) {
    setRevealed((r) => ({ ...r, [id]: !r[id] }));
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  function normalizeHref(u) {
    if (!u) return "";
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Passwords</h1>

      <div style={styles.headerCard}>
        <div style={styles.breadcrumb}>
          <span style={{ fontWeight: 700 }}>Passwords</span>
          <span style={{ color: "#9ca3af" }}>›</span>
          <span style={{ fontWeight: 700 }}>Vault</span>
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
          <div style={styles.col}>Name</div>
          <div style={styles.col}>Mail</div>
          <div style={styles.col}>Password</div>
          <div style={styles.col}>URL</div>
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
              <div style={styles.col}>{i.name}</div>
              <div style={styles.col}>{i.mail || "—"}</div>
              <div style={{ ...styles.col, display: "flex", gap: "0.4rem", alignItems: "center" }}>
                {i.password ? (
                  <>
                    <span style={{ fontFamily: "monospace" }}>
                      {revealed[i.id] ? i.password : "•".repeat(Math.min(i.password.length, 12))}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleReveal(i.id)}
                      style={styles.iconBtn}
                      title={revealed[i.id] ? "Hide" : "Show"}
                    >
                      {revealed[i.id] ? "🙈" : "👁"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(i.password)}
                      style={styles.iconBtn}
                      title="Copy"
                    >
                      📋
                    </button>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div style={styles.col}>
                {i.url ? (
                  <a
                    href={normalizeHref(i.url)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#60a5fa", textDecoration: "underline" }}
                  >
                    {i.url}
                  </a>
                ) : (
                  "—"
                )}
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
        <div
          style={styles.modalBackdrop}
          onClick={() => !saving && closeModal()}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1rem" }}>
              {editingId ? "Edit Entry" : "New Entry"}
            </h2>
            <form
              onSubmit={save}
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              <label style={styles.label}>
                Name <span style={{ color: "#dc2626" }}>*</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Mail
                <input
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Password
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...styles.input, fontFamily: "monospace" }}
                />
              </label>
              <label style={styles.label}>
                URL
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  style={styles.input}
                />
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
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
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete entry?"
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
    gridTemplateColumns: "1.2fr 1.5fr 1.6fr 1.5fr 110px",
    background: "#262626",
    padding: "0.9rem 1rem",
    fontWeight: 700,
    color: "#fff",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.5fr 1.6fr 1.5fr 110px",
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
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    background: "#1a1a1a",
    color: "#fff",
    borderRadius: 10,
    padding: "1.5rem",
    width: "min(500px, 92vw)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#d1d5db",
    gap: "0.25rem",
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
};
