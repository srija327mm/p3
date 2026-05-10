"use client";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmBg = variant === "danger" ? "#ef4444" : "#2563eb";

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          color: "#0f172a",
          borderRadius: 10,
          padding: "1.5rem 1.5rem 1.25rem",
          width: "min(440px, 92vw)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
          {title}
        </h2>
        {message && (
          <p style={{ marginTop: "0.75rem", color: "#475569", fontSize: "0.95rem", lineHeight: 1.5 }}>
            {message}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "#fff",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
              padding: "0.55rem 1.4rem",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            style={{
              background: confirmBg,
              color: "#fff",
              border: "none",
              padding: "0.55rem 1.6rem",
              borderRadius: 6,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
