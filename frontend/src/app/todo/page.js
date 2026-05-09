"use client";

import { useState, useEffect } from "react";

const API = "http://localhost:8000/api/tasks/";

export default function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error("failed to load");
        return r.json();
      })
      .then((data) => setTasks(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function addTask(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("failed to add");
      const created = await res.json();
      setTasks([created, ...tasks]);
      setInput("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>To Do</h1>
      <form onSubmit={addTask} style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="add a task"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Add</button>
      </form>
      {error && <p style={{ color: "tomato" }}>{error}</p>}
      {loading ? (
        <p>loading...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((t) => (
            <li key={t.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #333" }}>
              {t.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
