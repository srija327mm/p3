"use client";

import { useState, useEffect, useMemo } from "react";

const API_BASE = "http://localhost:8000";
const API = `${API_BASE}/api/resumes/`;

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "saved", label: "Saved" },
];

const STATUS_LABEL = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

export default function ResumePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");
  const [resume, setResume] = useState(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setItems)
      .catch((e) => setError(`Failed to load resumes: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.company_name?.toLowerCase().includes(q) ||
        i.role?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        STATUS_LABEL[i.status]?.toLowerCase().includes(q)
    );
  }, [items, search]);

  function resetForm() {
    setCompanyName("");
    setRole("");
    setStatus("applied");
    setResume(null);
    setDescription("");
    setEditingId(null);
  }

  function openNewModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingId(item.id);
    setCompanyName(item.company_name || "");
    setRole(item.role || "");
    setStatus(item.status || "applied");
    setResume(null);
    setDescription(item.description || "");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  async function saveResume(e) {
    e.preventDefault();
    if (!companyName.trim() || !role.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("company_name", companyName.trim());
      fd.append("role", role.trim());
      fd.append("status", status);
      fd.append("description", description);
      if (resume) fd.append("resume", resume);

      const url = editingId ? `${API}${editingId}/` : API;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: fd });
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

  async function deleteResume(item) {
    if (!confirm(`Delete "${item.company_name} – ${item.role}"?`)) return;
    try {
      const res = await fetch(`${API}${item.id}/`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setItems((list) => list.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  }

  async function updateStatus(item, nextStatus) {
    const prev = item.status;
    setItems((list) =>
      list.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );
    try {
      const res = await fetch(`${API}${item.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      setItems((list) =>
        list.map((i) => (i.id === item.id ? { ...i, status: prev } : i))
      );
      setError(`Failed to update: ${err.message}`);
    }
  }

  function fileUrl(f) {
    if (!f) return null;
    return f.startsWith("http") ? f : `${API_BASE}${f}`;
  }

  function fileName(f) {
    if (!f) return "";
    const parts = f.split("/");
    return parts[parts.length - 1];
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Resume</h1>

      <div style={styles.headerCard}>
        <div style={styles.breadcrumb}>
          <span style={{ fontWeight: 700 }}>Resume</span>
          <span style={{ color: "#9ca3af" }}>›</span>
          <span style={{ fontWeight: 700 }}>Applications</span>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          style={styles.search}
        />
        <button
          type="button"
          onClick={openNewModal}
          style={styles.primaryBtn}
        >
          New Resume
        </button>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.col}>Company Name</div>
          <div style={styles.col}>Role</div>
          <div style={styles.col}>Status</div>
          <div style={styles.col}>Resume</div>
          <div style={styles.col}>Description</div>
          <div style={styles.col}>Actions</div>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            No entries yet. Click &quot;New Resume&quot; to add one.
          </div>
        ) : (
          filtered.map((i) => (
            <div key={i.id} style={styles.row}>
              <div style={styles.col}>{i.company_name}</div>
              <div style={styles.col}>{i.role}</div>
              <div style={styles.col}>
                <select
                  value={i.status}
                  onChange={(e) => updateStatus(i, e.target.value)}
                  style={styles.statusSelect}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.col}>
                {i.resume ? (
                  <a
                    href={fileUrl(i.resume)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#60a5fa", textDecoration: "underline" }}
                  >
                    {fileName(i.resume)}
                  </a>
                ) : (
                  "—"
                )}
              </div>
              <div style={styles.col}>{i.description || "—"}</div>
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
                  onClick={() => deleteResume(i)}
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
            <h2 style={{ marginBottom: "1rem" }}>{editingId ? "Edit Resume" : "New Resume"}</h2>
            <form
              onSubmit={saveResume}
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              <label style={styles.label}>
                Company Name
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Role
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={styles.input}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={styles.label}>
                Resume (PDF/DOC){editingId ? " (leave empty to keep current)" : ""}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                  style={{ marginTop: "0.25rem" }}
                />
              </label>
              <label style={styles.label}>
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
    </div>
  );
}

const styles = {
  page: {
    background: "#000",
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
    gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr 2fr 110px",
    background: "#262626",
    padding: "0.9rem 1rem",
    fontWeight: 700,
    color: "#fff",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr 2fr 110px",
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
  statusSelect: {
    padding: "0.4rem 0.5rem",
    borderRadius: 6,
    border: "1px solid #3a3a3a",
    background: "#2a2a2a",
    color: "#fff",
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
};
