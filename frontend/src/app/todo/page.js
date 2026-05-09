"use client";

import { useState } from "react";

export default function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  function addTask(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTasks([...tasks, { id: Date.now(), text }]);
    setInput("");
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
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
          <li key={t.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #333" }}>
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
