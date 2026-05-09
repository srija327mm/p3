"use client";

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";

const API_BASE = "http://localhost:8000";
const API = `${API_BASE}/api/projects/`;

const STATUS_OPTIONS = [
  { value: "", label: "--None--" },
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "archived", label: "Archived" },
];

const STATUS_LABEL = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

export default function ProjectsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setItems)
      .catch((e) => setError(`Failed to load projects: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.tech_stack?.toLowerCase().includes(q) ||
        STATUS_LABEL[i.status]?.toLowerCase().includes(q)
    );
  }, [items, search]);

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

  function handleSaved(project, wasEdit) {
    if (wasEdit) {
      setItems((list) => list.map((i) => (i.id === project.id ? project : i)));
    } else {
      setItems([project, ...items]);
    }
    closeModal();
  }

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

  async function deleteProject(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      const res = await fetch(`${API}${item.id}/`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setItems((list) => list.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Projects</h1>

      <div style={styles.headerCard}>
        <div style={styles.breadcrumb}>
          <span style={{ fontWeight: 700 }}>Projects</span>
          <span style={{ color: "#9ca3af" }}>›</span>
          <span style={{ fontWeight: 700 }}>All Projects</span>
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
          New Project
        </button>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.col}>Project Name</div>
          <div style={styles.col}>Status</div>
          <div style={styles.col}>Tech Stack</div>
          <div style={styles.col}>Notes</div>
          <div style={styles.col}>Actions</div>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            No projects yet. Click &quot;New Project&quot; to add one.
          </div>
        ) : (
          filtered.map((i) => (
            <div key={i.id} style={styles.row}>
              <div style={styles.col}>{i.name}</div>
              <div style={styles.col}>
                <select
                  value={i.status || ""}
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
              <div style={styles.col}>{i.tech_stack || "—"}</div>
              <div
                style={{ ...styles.col, ...styles.notesPreview }}
                dangerouslySetInnerHTML={{
                  __html: i.notes || "<span style='color:#9ca3af'>—</span>",
                }}
              />
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
                  onClick={() => deleteProject(i)}
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
        <ProjectModal
          editing={editingItem}
          onClose={closeModal}
          onSaved={handleSaved}
          onError={setError}
        />
      )}
    </div>
  );
}

function ProjectModal({ editing, onClose, onSaved, onError }) {
  const isEdit = !!editing;
  const [name, setName] = useState(editing?.name || "");
  const [status, setStatus] = useState(editing?.status || "");
  const [techStack, setTechStack] = useState(editing?.tech_stack || "");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  useLayoutEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = editing?.notes || "";
    }
  }, [editing]);

  function exec(cmd, value = null) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }

  function wrapInline(tag) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text = range.toString();
    if (!text) {
      document.execCommand("insertHTML", false, `<${tag}>​</${tag}>`);
    } else {
      document.execCommand("insertHTML", false, `<${tag}>${escapeHtml(text)}</${tag}>`);
    }
    editorRef.current?.focus();
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function pickAndInsertImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const url = await readAsDataUrl(f);
      editorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${url}" alt="${escapeHtml(f.name)}" style="max-width:100%;border-radius:4px;margin:0.25rem 0" />`
      );
    };
    input.click();
  }

  async function pickAndInsertPdf() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const url = await readAsDataUrl(f);
      editorRef.current?.focus();
      const safeName = escapeHtml(f.name);
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${url}" download="${safeName}" target="_blank" rel="noreferrer" style="color:#2563eb;text-decoration:underline">📎 ${safeName}</a>&nbsp;`
      );
    };
    input.click();
  }

  async function save(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const notesHtml = editorRef.current?.innerHTML || "";
    try {
      const url = isEdit ? `${API}${editing.id}/` : API;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          status,
          tech_stack: techStack,
          notes: notesHtml,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      onSaved(saved, isEdit);
    } catch (err) {
      onError(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const toolbarBtn = {
    background: "transparent",
    border: "none",
    padding: "0.35rem 0.6rem",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "#fff",
  };

  return (
    <div style={styles.modalBackdrop} onClick={() => !saving && onClose()}>
      <div
        style={{ ...styles.modal, width: "min(800px, 95vw)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h2 style={{ flex: 1, textAlign: "center" }}>{isEdit ? "Edit Project" : "New Project"}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{ ...toolbarBtn, fontSize: "1.25rem", color: "#6b7280" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={save} style={{ padding: "1rem 1.25rem 1.25rem" }}>
          <div style={styles.sectionHeader}>Basic Information</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <label style={styles.label}>
              Project Name <span style={{ color: "#dc2626" }}>*</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
          </div>

          <label style={{ ...styles.label, marginBottom: "1rem" }}>
            Tech Stack
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g. Next.js, Django, Postgres"
              style={styles.input}
            />
          </label>

          <div style={styles.sectionHeader}>Notes</div>

          <div style={styles.editorWrap}>
            <div style={styles.toolbar}>
              <button type="button" style={{ ...toolbarBtn, fontWeight: 700 }} onClick={() => exec("bold")} title="Bold">B</button>
              <button type="button" style={{ ...toolbarBtn, fontStyle: "italic" }} onClick={() => exec("italic")} title="Italic">I</button>
              <button type="button" style={{ ...toolbarBtn, textDecoration: "line-through" }} onClick={() => exec("strikeThrough")} title="Strikethrough">S</button>
              <span style={styles.toolbarSep} />
              <button type="button" style={toolbarBtn} onClick={() => exec("formatBlock", "<h1>")} title="Heading 1">H1</button>
              <button type="button" style={toolbarBtn} onClick={() => exec("formatBlock", "<h2>")} title="Heading 2">H2</button>
              <span style={styles.toolbarSep} />
              <button type="button" style={toolbarBtn} onClick={() => exec("insertUnorderedList")} title="Bullet list">•</button>
              <button type="button" style={toolbarBtn} onClick={() => exec("insertOrderedList")} title="Numbered list">1.</button>
              <span style={styles.toolbarSep} />
              <button type="button" style={toolbarBtn} onClick={() => exec("formatBlock", "<blockquote>")} title="Quote">&ldquo;</button>
              <button type="button" style={toolbarBtn} onClick={() => wrapInline("code")} title="Code">&lt;/&gt;</button>
              <span style={styles.toolbarSep} />
              <button type="button" style={toolbarBtn} onClick={pickAndInsertImage} title="Insert image">🖼</button>
              <button type="button" style={toolbarBtn} onClick={pickAndInsertPdf} title="Attach PDF">📎</button>
              <span style={styles.toolbarSep} />
              <button type="button" style={toolbarBtn} onClick={() => exec("undo")} title="Undo">↶</button>
              <button type="button" style={toolbarBtn} onClick={() => exec("redo")} title="Redo">↷</button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              style={styles.editor}
            />
          </div>

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
    gridTemplateColumns: "1.4fr 1fr 1.2fr 2fr 110px",
    background: "#262626",
    padding: "0.9rem 1rem",
    fontWeight: 700,
    color: "#fff",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1.2fr 2fr 110px",
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
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "3vh",
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
  sectionHeader: {
    background: "#262626",
    color: "#fff",
    padding: "0.75rem 1rem",
    fontWeight: 700,
    borderRadius: 6,
    marginBottom: "1rem",
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
    fontFamily: "inherit",
    background: "#2a2a2a",
    color: "#fff",
    outline: "none",
  },
  editorWrap: {
    border: "1px solid #3a3a3a",
    borderRadius: 8,
    overflow: "hidden",
    background: "#1a1a1a",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "0.15rem",
    padding: "0.4rem 0.6rem",
    background: "#262626",
    borderBottom: "1px solid #3a3a3a",
    flexWrap: "wrap",
  },
  toolbarSep: {
    width: 1,
    height: 20,
    background: "#3a3a3a",
    margin: "0 0.4rem",
  },
  editor: {
    minHeight: 200,
    padding: "1rem",
    outline: "none",
    fontSize: "0.95rem",
    color: "#fff",
    background: "#1a1a1a",
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
