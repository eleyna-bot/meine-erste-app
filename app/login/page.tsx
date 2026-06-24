"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [laden, setLaden] = useState(false);
  const [meldung, setMeldung] = useState("");

  async function einloggen() {
    setLaden(true);
    setMeldung("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });
    if (error) {
      setMeldung("Login fehlgeschlagen: " + error.message);
    } else {
      router.push("/");
    }
    setLaden(false);
  }

  async function registrieren() {
    setLaden(true);
    setMeldung("");
    const { error } = await supabase.auth.signUp({ email, password: passwort });
    if (error) {
      setMeldung("Registrierung fehlgeschlagen: " + error.message);
    } else {
      setMeldung("Registrierung erfolgreich! Bitte E-Mail bestätigen, dann einloggen.");
    }
    setLaden(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8, color: "#0f172a" }}>Rechnungs-Scanner</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Bitte einloggen oder registrieren.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 15 }}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 15 }}
        />
        <button
          onClick={einloggen}
          disabled={laden}
          style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, cursor: "pointer" }}
        >
          {laden ? "..." : "Einloggen"}
        </button>
        <button
          onClick={registrieren}
          disabled={laden}
          style={{ background: "white", color: "#2563eb", border: "1px solid #2563eb", borderRadius: 8, padding: "12px", fontSize: 15, cursor: "pointer" }}
        >
          {laden ? "..." : "Neu registrieren"}
        </button>
      </div>

      {meldung && (
        <p style={{ marginTop: 20, color: meldung.startsWith("Registrierung erfolgreich") ? "#16a34a" : "#dc2626", fontSize: 14 }}>
          {meldung}
        </p>
      )}
    </div>
  );
}
