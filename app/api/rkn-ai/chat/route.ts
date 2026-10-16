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

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY sunucu ortamında tanımlı değil. Vercel Environment Variables ayarını kontrol edin." },
      { status: 503 },
    );
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
      item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" &&
      item.content.trim().length > 0,
    )
    .slice(-12)
    .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 4000) }));

  if (!safeMessages.length || safeMessages[safeMessages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "Gönderilecek kullanıcı mesajı bulunamadı." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...safeMessages,
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const providerMessage =
        typeof data?.error?.message === "string" ? data.error.message : "OpenAI isteği başarısız oldu.";
      console.error("RKN AI provider error:", response.status, providerMessage);
      return NextResponse.json(
        { error: response.status === 401
            ? "OpenAI API anahtarı geçersiz veya süresi dolmuş."
            : response.status === 429
              ? "OpenAI kullanım limiti veya bakiye sınırına ulaşıldı."
              : "Yapay zekâ sağlayıcısından yanıt alınamadı." },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Yapay zekâ boş yanıt döndürdü." }, { status: 502 });
    }

    return NextResponse.json({ answer: answer.trim() });
  } catch (error) {
    console.error("RKN AI request failed:", error);
    return NextResponse.json({ error: "Yapay zekâya bağlanırken zaman aşımı veya ağ hatası oluştu." }, { status: 502 });
  }
}
