"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "./AuthContext";

const PUBLIC_PATHS = ["/login", "/register"];

export default function AppShell({ children }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (status === "anon" && !isPublic) router.replace("/login");
    if (status === "authed" && isPublic) router.replace("/");
  }, [status, isPublic, router]);

  if (status === "loading") {
    return (
      <div style={fullscreen}>
        <p style={{ color: "#fff" }}>loading…</p>
      </div>
    );
  }

  if (status === "anon" && !isPublic) return null;
  if (status === "authed" && isPublic) return null;

  if (isPublic) {
    return (
      <div style={fullscreen}>
        <main style={{ width: "100%", maxWidth: 420, padding: "1.5rem" }}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          padding: "1rem",
          position: "relative",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/tractor-working-green-field.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            zIndex: 10,
            color: "#fff",
            fontSize: "0.9rem",
          }}
        >
          <a
            href="mailto:srijareddy327m@gmail.com"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            quries: srijareddy327m@gmail.com
          </a>
          <span
            style={{ fontSize: "1.75rem", lineHeight: 1 }}
            aria-label="India"
            title="India"
          >
            🇮🇳
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}

const fullscreen = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage:
    "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/tractor-working-green-field.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};
