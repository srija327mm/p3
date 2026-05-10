"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/me/");
      if (res.ok) {
        setUser(await res.json());
        setStatus("authed");
      } else {
        setUser(null);
        setStatus("anon");
      }
    } catch {
      setUser(null);
      setStatus("anon");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username, password) => {
    const res = await apiFetch("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "login failed");
    setUser(data);
    setStatus("authed");
    return data;
  }, []);

  const register = useCallback(async ({ username, password, email }) => {
    const res = await apiFetch("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "register failed");
    setUser(data);
    setStatus("authed");
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout/", { method: "POST" });
    } finally {
      setUser(null);
      setStatus("anon");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
