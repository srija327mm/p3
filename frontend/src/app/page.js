"use client";

import { useAuth } from "./AuthContext";

export default function A() {
  const { user } = useAuth();
  return (
    <div
      style={{
        padding: "1.5rem",
        color: "white",
        textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
        minHeight: "100%",
      }}
    >
      <h1>hi</h1>
      <div>
        <h1>welocome {user?.username || "friend"}! 🎉</h1>
      </div>
    </div>
  );
}
