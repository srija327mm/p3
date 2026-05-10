"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const LINKS = [
  { href: "/", label: "Home", icon: "🏠", color: "#2563eb" },
  { href: "/todo", label: "To Do", icon: "✅", color: "#f59e0b" },
  { href: "/bucketlist", label: "Bucket List", icon: "🎯", color: "#10b981" },
  { href: "/ideas", label: "Ideas", icon: "💡", color: "#eab308" },
  { href: "/resume", label: "Resume", icon: "📄", color: "#0891b2" },
  { href: "/projects", label: "Projects", icon: "🚀", color: "#7c3aed" },
  { href: "/learning", label: "Today's Learning", icon: "📚", color: "#16a34a" },
  { href: "/english", label: "My English Today", icon: "🗣️", color: "#0ea5e9" },
  { href: "/passwords", label: "Passwords", icon: "🔒", color: "#dc2626" },
  { href: "/drawing", label: "Drawing", icon: "🎨", color: "#ec4899" },
];

const STORAGE_KEY = "sidebar:collapsed";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [hoverHref, setHoverHref] = useState(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1") setCollapsed(true);
    } catch {}
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  const width = collapsed ? 72 : 220;

  return (
    <aside
      style={{
        position: "relative",
        width,
        padding: "1rem 0.6rem",
        borderRight: "1px solid #86efac",
        background: "#bbf7d0",
        color: "#111827",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        transition: hydrated ? "width 0.2s ease" : "none",
        flexShrink: 0,
        boxShadow: "1px 0 0 rgba(0,0,0,0.02)",
      }}
    >
      {!collapsed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.4rem 0.6rem 1rem",
            borderBottom: "1px solid #f1f5f9",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg,#10b981,#22c55e)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.95rem",
              boxShadow: "0 2px 6px rgba(16,185,129,0.35)",
            }}
          >
            {(user?.username?.[0] || "?").toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.1 }}>
              {user?.username || "Guest"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Personal Hub</div>
          </div>
        </div>
      )}

      {LINKS.map((link) => {
        const isActive = pathname === link.href;
        const isHover = hoverHref === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            title={collapsed ? link.label : undefined}
            onMouseEnter={() => setHoverHref(link.href)}
            onMouseLeave={() => setHoverHref(null)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: collapsed ? 0 : "0.7rem",
              padding: collapsed ? "0.5rem" : "0.55rem 0.7rem",
              borderRadius: 8,
              color: isActive ? link.color : "#1f2937",
              background: isActive
                ? hexWithAlpha(link.color, 0.12)
                : isHover
                ? "#f3f4f6"
                : "transparent",
              textDecoration: "none",
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.95rem",
              transition: "background 0.15s ease, color 0.15s ease",
              position: "relative",
            }}
          >
            {isActive && !collapsed && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 3,
                  borderRadius: 2,
                  background: link.color,
                }}
              />
            )}
            <span
              style={{
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: 8,
                background: hexWithAlpha(link.color, isActive ? 0.18 : 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.05rem",
              }}
              aria-hidden="true"
            >
              {link.icon}
            </span>
            {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{link.label}</span>}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={logout}
        title="Log out"
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : "0.7rem",
          padding: collapsed ? "0.5rem" : "0.55rem 0.7rem",
          borderRadius: 8,
          color: "#991b1b",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.95rem",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: 8,
            background: "rgba(220,38,38,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.05rem",
          }}
          aria-hidden="true"
        >
          🚪
        </span>
        {!collapsed && <span>Log out</span>}
      </button>

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand" : "Collapse"}
        style={{
          position: "absolute",
          right: -14,
          bottom: 24,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          fontWeight: 700,
          zIndex: 20,
        }}
      >
        {collapsed ? "›" : "‹"}
      </button>
    </aside>
  );
}

function hexWithAlpha(hex, alpha) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
