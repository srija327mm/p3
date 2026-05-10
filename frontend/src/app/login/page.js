"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Log in</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          autoFocus
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        {error && <p style={{ color: "tomato", margin: 0 }}>{error}</p>}
        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "…" : "Log in"}
        </button>
      </form>
      <p style={styles.helper}>
        No account? <Link href="/register" style={styles.link}>Register</Link>
      </p>
      <a
        href="/Personal-Hub-Demo.pdf"
        target="_blank"
        rel="noopener noreferrer"
        style={styles.demoBtn}
      >
        📄 See what&apos;s inside (demo PDF)
      </a>
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(20,20,20,0.85)",
    color: "#fff",
    padding: "1.75rem",
    borderRadius: 12,
    boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
  },
  title: { margin: "0 0 1rem", fontSize: "1.6rem", fontWeight: 800 },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  input: {
    padding: "0.65rem 0.85rem",
    background: "#2a2a2a",
    border: "1px solid #3a3a3a",
    borderRadius: 6,
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
  },
  button: {
    padding: "0.7rem 1.25rem",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    cursor: "pointer",
  },
  helper: { marginTop: "1rem", fontSize: "0.9rem", color: "#d1d5db" },
  link: { color: "#34d399", textDecoration: "none", fontWeight: 600 },
  demoBtn: {
    display: "block",
    textAlign: "center",
    marginTop: "1rem",
    padding: "0.65rem 1rem",
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.4)",
    borderRadius: 8,
    color: "#34d399",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
};
