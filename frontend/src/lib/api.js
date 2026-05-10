"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let cachedCsrfToken = null;

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

async function getCsrfToken() {
  const cookieToken = getCookie("csrftoken");
  if (cookieToken) return cookieToken;
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const res = await fetch(API_BASE + "/api/auth/csrf/", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    cachedCsrfToken = data.csrfToken || null;
    return cachedCsrfToken;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : API_BASE + path;
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = await getCsrfToken();
    if (token) headers.set("X-CSRFToken", token);
  }
  return fetch(url, { ...options, method, headers, credentials: "include" });
}
