"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

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
  const router = useRouter();
  const [datei, setDatei] = useState<File | null>(null);
  const [laden, setLaden] = useState(false);
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);
  const [historie, setHistorie] = useState<Ergebnis[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authGeprueft, setAuthGeprueft] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        setUserId(data.session.user.id);
        ladeHistorie();
        setAuthGeprueft(true);
      }
    });
  }, []);

  async function ladeHistorie() {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setHistorie(data);
  }

  async function ausloggen() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function scannen() {
    if (!datei) return;
    setLaden(true);
    setErgebnis(null);
    const form = new FormData();
    form.append("file", datei);
    const res = await fetch("/api/scan", { method: "POST", body: form });
    const daten = await res.json();
    setErgebnis(daten);
    if (!daten.error && userId) {
      const { error: insertFehler } = await supabase.from("invoices").insert({
        id: Date.now(),
        user_id: userId,
        absender: daten.absender,
        rechnungsdatum: daten.rechnungsdatum,
        rechnungsnummer: daten.rechnungsnummer,
        gesamtbetrag: daten.gesamtbetrag,
        waehrung: daten.waehrung,
        positionen: daten.positionen,
      });
      if (insertFehler) console.error("Insert Fehler:", insertFehler.message);
      ladeHistorie();
    }
    setLaden(false);
  }

  if (!authGeprueft) return null;

  return (
    <>
      {/* Hintergrund */}
      <div className="bg-scene">
        <div className="aurora-l" />
        <div className="aurora-l2" />
        <div className="aurora-r" />
        <div className="aurora-r2" />
        <div className="aurora-mid" />
        <div className="bg-grid" />
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>

        {/* Header */}
        <div className="header">
          <div className="logo">⚡ Rechnungs-Scanner</div>
          <div className="nav">
            <span className="nav-item active">Übersicht</span>
            <span className="nav-item">Scans</span>
            <span className="nav-item">Einstellungen</span>
          </div>
          <button className="logout-btn" onClick={ausloggen}>Abmelden</button>
        </div>

        {/* Hero */}
        <div className="hero">
          <h1>
            Rechnungen automatisch<br />
            <span className="grad">erfassen.</span>
          </h1>
          <p>Lade eine Rechnung hoch — die KI extrahiert alle Daten strukturiert, sicher und in Sekunden.</p>
        </div>

        {/* Upload */}
        <div className="upload-wrap">
          <div className="upload-card">
            <div className="upload-icon-ring">☁️</div>
            {datei
              ? <p className="file-chosen">{datei.name}</p>
              : <>
                  <p className="upload-title">Datei hierher ziehen oder klicken</p>
                  <p className="upload-sub">JPG, PNG, PDF · bis 20 MB</p>
                </>
            }
            <label className="file-select-label">
              Datei auswählen
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setDatei(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
            </label>
            <br />
            <button className="scan-btn" onClick={scannen} disabled={!datei || laden}>
              ⚡ {laden ? "Wird analysiert..." : "Rechnung scannen"}
            </button>
          </div>
        </div>

        {/* Demo-Banner */}
        {ergebnis?.demo && (
          <div className="demo-banner">
            <div className="demo-banner-inner">
              Demo-Modus aktiv — KI-Antwort konnte nicht geladen werden. Es werden Beispieldaten angezeigt.
            </div>
          </div>
        )}

        {/* Fehler */}
        {ergebnis?.error && (
          <div className="error-wrap">
            <div className="error-inner">Fehler: {ergebnis.error}</div>
          </div>
        )}

        {/* Ergebnis — nur wenn wirklich gescannt */}
        {ergebnis && !ergebnis.error && (
          <div className="result-wrap">
            <div className="result-card">
              <div className="result-head">
                <span className="result-title">Erkannte Daten</span>
                <span className="badge">KI extrahiert</span>
              </div>
              {[
                ["Absender", ergebnis.absender],
                ["Rechnungsdatum", ergebnis.rechnungsdatum],
                ["Rechnungsnummer", ergebnis.rechnungsnummer],
                ["Gesamtbetrag", ergebnis.gesamtbetrag ? `${ergebnis.gesamtbetrag} ${ergebnis.waehrung ?? ""}` : null],
              ].map(([label, wert]) => (
                <div key={label} className="result-row">
                  <span className="result-label">{label}</span>
                  <span className="result-value">{wert ?? "–"}</span>
                </div>
              ))}
              {ergebnis.positionen && ergebnis.positionen.length > 0 && (
                <>
                  <p className="pos-title">Positionen</p>
                  {ergebnis.positionen.map((p, i) => (
                    <div key={i} className="pos-row">
                      <span className="pos-name">{p.beschreibung}</span>
                      <span className="pos-amount">{p.betrag}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Verlauf */}
        {historie.length > 0 && (
          <div className="history-wrap">
            <div className="history-head">
              <h2>Bisherige Scans</h2>
              <span className="history-count">{historie.length} {historie.length === 1 ? "Eintrag" : "Einträge"}</span>
            </div>
            {historie.map((eintrag: Ergebnis & { id?: number }, i) => (
              <div key={i} className="history-card">
                <div>
                  <div className="history-name">{eintrag.absender ?? "Unbekannt"}</div>
                  <div className="history-meta">📅 {eintrag.rechnungsdatum ?? "–"} &nbsp;·&nbsp; # {eintrag.rechnungsnummer ?? "–"}</div>
                </div>
                <span className="history-amount">{eintrag.gesamtbetrag ? `${eintrag.gesamtbetrag} ${eintrag.waehrung ?? ""}` : "–"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Badges */}
        <div className="footer-wrap">
          {[
            ["🛡️", "Sicher & DSGVO-konform", "Deine Daten sind geschützt."],
            ["⚡", "In Sekunden erfasst", "KI-gestützt & blitzschnell."],
            ["✅", "Hohe Genauigkeit", "Strukturierte Ergebnisse."],
            ["☁️", "Überall verfügbar", "Webbasiert & flexibel."],
          ].map(([icon, label, sub]) => (
            <div key={label} className="footer-badge">
              <div className="footer-icon-ring">{icon}</div>
              <div className="footer-label">{label}</div>
              <div className="footer-sublabel">{sub}</div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
