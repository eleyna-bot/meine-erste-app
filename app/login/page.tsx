"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0f1e; font-family: 'Inter', sans-serif; }
  .input-field {
    width: 100%; padding: 12px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; color: #e2e8f0; font-size: 15px;
    outline: none; transition: border-color 0.2s;
  }
  .input-field:focus { border-color: rgba(0,200,150,0.5); }
  .input-field::placeholder { color: #4a5580; }
  .btn-primary {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #00c896, #0066ff);
    color: white; border: none; border-radius: 10px;
    font-size: 15px; font-weight: 600; cursor: pointer;
    box-shadow: 0 0 20px rgba(0,200,150,0.25);
    transition: opacity 0.2s;
  }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary {
    width: 100%; padding: 13px;
    background: transparent;
    color: #00c896; border: 1px solid rgba(0,200,150,0.4);
    border-radius: 10px; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .btn-secondary:hover { background: rgba(0,200,150,0.08); }
  .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
`;

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
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e 0%, #0d1628 50%, #0a1525 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 26, fontWeight: 700, background: "linear-gradient(135deg, #00c896, #0066ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>
              Rechnungs-Scanner
            </div>
            <p style={{ color: "#4a5580", fontSize: 14 }}>Melde dich an oder erstelle ein Konto</p>
          </div>

          {/* Card */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 36, backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                className="input-field"
                type="email"
                placeholder="E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="input-field"
                type="password"
                placeholder="Passwort"
                value={passwort}
                onChange={(e) => setPasswort(e.target.value)}
              />
              <div style={{ height: 4 }} />
              <button className="btn-primary" onClick={einloggen} disabled={laden}>
                {laden ? "..." : "Einloggen"}
              </button>
              <button className="btn-secondary" onClick={registrieren} disabled={laden}>
                {laden ? "..." : "Neu registrieren"}
              </button>
            </div>

            {meldung && (
              <p style={{ marginTop: 20, color: meldung.startsWith("Registrierung erfolgreich") ? "#00c896" : "#f87171", fontSize: 13, textAlign: "center" }}>
                {meldung}
              </p>
            )}
          </div>

          <p style={{ textAlign: "center", color: "#2a3350", fontSize: 12, marginTop: 24 }}>
            Sicher & DSGVO-konform · Deine Daten gehören dir
          </p>
        </div>
      </div>
    </>
  );
}
