import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Du bist ein Rechnungs-Scanner. Analysiere dieses Bild und extrahiere folgende Informationen als JSON:
{
  "absender": "Firmenname oder Absender",
  "rechnungsdatum": "Datum der Rechnung",
  "rechnungsnummer": "Rechnungsnummer",
  "gesamtbetrag": "Gesamtbetrag als Zahl",
  "waehrung": "Währung z.B. EUR",
  "positionen": [
    { "beschreibung": "...", "betrag": "..." }
  ]
}
Wenn ein Wert nicht erkennbar ist, schreibe null. Antworte NUR mit dem JSON, kein weiterer Text.`;

  const demo = {
    demo: true,
    absender: "Musterfirma GmbH",
    rechnungsdatum: "24.06.2026",
    rechnungsnummer: "RE-2026-001",
    gesamtbetrag: "99,00",
    waehrung: "EUR",
    positionen: [{ beschreibung: "Webdesign Leistung, 1x", betrag: "99,00 €" }],
  };

  try {
    const result = await Promise.race([
      model.generateContent([prompt, { inlineData: { mimeType: file.type, data: base64 } }]),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
    ]) as Awaited<ReturnType<typeof model.generateContent>>;

    const text = result.response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ ...demo, _debug_error: message });
    }
    return NextResponse.json({ ...demo, _debug_error: message });
  }
}
