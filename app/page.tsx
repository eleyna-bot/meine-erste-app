"use client";

import { useState } from "react";

type Position = { beschreibung: string; betrag: string };
type Ergebnis = {
  demo?: boolean;
  absender?: string;
  rechnungsdatum?: string;
  rechnungsnummer?: string;
  gesamtbetrag?: string;
  waehrung?: string;
  positionen?: Position[];
  error?: string;
};

export default function Home() {
  const [datei, setDatei] = useState<File | null>(null);
  const [laden, setLaden] = useState(false);
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);

  async function scannen() {
    if (!datei) return;
    setLaden(true);
    setErgebnis(null);

    const form = new FormData();
    form.append("file", datei);

    const res = await fetch("/api/scan", { method: "POST", body: form });
    const daten = await res.json();
    setErgebnis(daten);
    setLaden(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Rechnungs-Scanner</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Lade eine Rechnung hoch – die KI liest die Daten automatisch aus.</p>

      <div style={{ border: "2px dashed #ccc", borderRadius: 12, padding: 32, textAlign: "center", marginBottom: 24 }}>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setDatei(e.target.files?.[0] ?? null)}
          style={{ marginBottom: 16, display: "block", margin: "0 auto 16px" }}
        />
        {datei && <p style={{ color: "#444", marginBottom: 16 }}>Ausgewählt: {datei.name}</p>}
        <button
          onClick={scannen}
          disabled={!datei || laden}
          style={{
            background: datei && !laden ? "#2563eb" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontSize: 16,
            cursor: datei && !laden ? "pointer" : "not-allowed",
          }}
        >
          {laden ? "Wird analysiert..." : "Rechnung scannen"}
        </button>
      </div>

      {ergebnis?.demo && (
        <div style={{ background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: 10, padding: "12px 20px", marginBottom: 16, color: "#92400e" }}>
          Demo-Modus aktiv – KI-Antwort konnte nicht geladen werden. Es werden Beispieldaten angezeigt.
        </div>
      )}

      {ergebnis && !ergebnis.error && (
        <div style={{ background: "#ffffff", borderRadius: 12, padding: 28, border: "1px solid #cbd5e1", color: "#1e293b" }}>
          <h2 style={{ marginBottom: 20, fontSize: 20, color: "#0f172a" }}>Erkannte Rechnungsdaten</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Absender / Firma", ergebnis.absender],
                ["Rechnungsdatum", ergebnis.rechnungsdatum],
                ["Rechnungsnummer", ergebnis.rechnungsnummer],
                ["Gesamtbetrag", ergebnis.gesamtbetrag ? `${ergebnis.gesamtbetrag} ${ergebnis.waehrung ?? ""}` : null],
              ].map(([label, wert]) => (
                <tr key={label} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 0", color: "#475569", width: 180, fontWeight: 500 }}>{label}</td>
                  <td style={{ padding: "10px 0", color: "#0f172a", fontWeight: 600 }}>{wert ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {ergebnis.positionen && ergebnis.positionen.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, color: "#0f172a" }}>Positionen</h3>
              {ergebnis.positionen.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0", color: "#1e293b" }}>
                  <span>{p.beschreibung}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{p.betrag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {ergebnis?.error && (
        <div style={{ background: "#fef2f2", borderRadius: 12, padding: 20, color: "#dc2626" }}>
          Fehler: {ergebnis.error}
        </div>
      )}
    </div>
  );
}
