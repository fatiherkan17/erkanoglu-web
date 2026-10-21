import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `Sen RKN AI'sın; Erkanoğlu İnşaat için Türkçe çalışan firma asistanısın.
Doğrulanmış firma hafızası:
- Firma adı: Erkanoğlu İnşaat.
- Faaliyet alanları: mühendislik, proje çizimi, inşaat/taahhüt ve yaşam alanları.
- Web sitesinde Mimarlık, Mühendislik, İnşaat ve Yaşam Alanları başlıkları kullanılıyor.
- Firma MSM Mobilya ile iş ortaklığı/bayilik ilişkisi üzerinde çalışıyor; güncel ticari koşulları sorulursa ayrıntıları doğrulanmış gibi sunma.
Kurallar:
- Yalnızca yukarıdaki firma hafızasında bulunan bilgileri doğrulanmış firma bilgisi olarak söyle.
- Bilmediğin şirket bilgilerini, fiyatları, adresleri, telefonları, referans projeleri veya sözleşme koşullarını uydurma. Bilinmiyorsa açıkça "Bu bilgi firma hafızamda doğrulanmış olarak bulunmuyor" de.
- Genel konularda yardımcı olabilirsin; genel bilgi ile firma hakkında doğrulanmış bilgiyi birbirinden ayır.
- Türkçe, açık ve uygulanabilir yanıtlar ver.`;

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientKey = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = requestCounts.get(clientKey);
  if (current && current.resetAt > now && current.count >= MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json({ error: "Çok sık mesaj gönderildi. Bir dakika sonra tekrar dene." }, { status: 429 });
  }
  if (!current || current.resetAt <= now) requestCounts.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
  else current.count += 1;
  if (requestCounts.size > 5000) {
    for (const [key, value] of requestCounts) if (value.resetAt <= now) requestCounts.delete(key);
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const safeMessages = messages
    .filter((item): item is ChatMessage =>
      item && (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" && item.content.trim().length > 0)
    .slice(-12)
    .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 4000) }));

  if (!safeMessages.length || safeMessages[safeMessages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "Gönderilecek kullanıcı mesajı bulunamadı." }, { status: 400 });
  }

  try {
    // Prefer Gemini when configured; retain OpenAI as a fallback for existing deployments.
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    let answer: unknown;

    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: safeMessages.map((message) => ({
              role: message.role === "assistant" ? "model" : "user",
              parts: [{ text: message.content }],
            })),
            generationConfig: { temperature: 0.3, maxOutputTokens: 700 },
          }),
          signal: AbortSignal.timeout(30000),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        console.error("RKN AI Gemini error:", response.status, data?.error?.message || "Unknown provider error");
        return NextResponse.json(
          { error: response.status === 429
            ? "Gemini ücretsiz kullanım kotasına ulaşıldı. Kota yenilendiğinde tekrar deneyebilirsin."
            : response.status === 401 || response.status === 403
              ? "Gemini API anahtarı geçersiz veya API erişimi etkin değil."
              : "Gemini sağlayıcısından yanıt alınamadı." },
          { status: response.status === 429 ? 429 : 502 },
        );
      }
      answer = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("");
    } else if (openAiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 700,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        console.error("RKN AI OpenAI error:", response.status, data?.error?.message || "Unknown provider error");
        return NextResponse.json(
          { error: response.status === 429
            ? "OpenAI kullanım limiti veya bakiye sınırına ulaşıldı."
            : response.status === 401
              ? "OpenAI API anahtarı geçersiz veya süresi dolmuş."
              : "OpenAI sağlayıcısından yanıt alınamadı." },
          { status: response.status === 429 ? 429 : 502 },
        );
      }
      answer = data?.choices?.[0]?.message?.content;
    } else {
      return NextResponse.json(
        { error: "Bulut modeli henüz bağlanmadı. Vercel Preview ortamına GEMINI_API_KEY ekleyerek ücretsiz Gemini katmanını etkinleştir." },
        { status: 503 },
      );
    }

    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Yapay zekâ boş yanıt döndürdü." }, { status: 502 });
    }
    return NextResponse.json({ answer: answer.trim() });
  } catch (error) {
    console.error("RKN AI request failed:", error);
    return NextResponse.json({ error: "Yapay zekâya bağlanırken zaman aşımı veya ağ hatası oluştu." }, { status: 502 });
  }
}
