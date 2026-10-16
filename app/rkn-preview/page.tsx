"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function RknAiPreviewPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Merhaba, ben RKN AI. Erkanoğlu İnşaat hakkında doğrulanmış firma bilgilerimle yardımcı olabilirim. Ne öğrenmek istersin?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/rkn-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const raw = await response.text();
      let data: { answer?: string; error?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(`Sohbet API'si JSON yerine yanıt verdi (HTTP ${response.status}). Deployment veya API rotası kontrol edilmeli.`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Sohbet API'si hata döndürdü (HTTP ${response.status}).`);
      }
      if (typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error("API isteği başarılı görünüyor ancak yanıt metni gelmedi.");
      }
      setMessages((current) => [...current, { role: "assistant", content: data.answer! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1020] px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Erkanoğlu İnşaat</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">RKN AI</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Firma bilgilerini temel alan yapay zekâ çalışma alanı.</p>
          </div>
          <span className="w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-200">Sohbet etkin</span>
        </header>
        <section className="mt-8 grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <p className="text-sm font-medium text-cyan-200">Çalışma alanı</p>
            <h2 className="mt-2 text-xl font-semibold">Firma asistanı</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Sorularını yaz. RKN AI, doğrulanmış firma bilgilerini genel bilgilerden ayırır ve bilmediği firma detaylarını uydurmaz.</p>

            <div className="mt-6 flex min-h-72 flex-col gap-3 rounded-xl border border-white/10 bg-[#070b16] p-4" aria-live="polite">
              <div className="flex-1 space-y-3">
                {messages.map((message, index) => (
                  <div key={index} className={`max-w-[95%] whitespace-pre-wrap rounded-xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-cyan-300/15 text-cyan-50" : "mr-auto border border-white/10 bg-white/[0.04] text-slate-200"}`}>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{message.role === "user" ? "Sen" : "RKN AI"}</p>
                    {message.content}
                  </div>
                ))}
                {loading && <p className="text-sm text-cyan-200">RKN AI yanıt hazırlıyor…</p>}
              </div>
            </div>

            <form onSubmit={sendMessage} className="mt-3">
              <label htmlFor="rkn-message" className="mb-2 block text-sm text-slate-300">Mesajın</label>
              <textarea id="rkn-message" value={input} onChange={(event) => setInput(event.target.value)} rows={3} maxLength={4000} placeholder="Örn. Erkanoğlu İnşaat hangi alanlarda hizmet veriyor?" className="w-full resize-y rounded-lg border border-white/10 bg-[#070b16] px-3 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-300/60" />
              {error && <p role="alert" className="mt-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Mesajlar bu sekmede tutulur; kalıcı kayıt henüz yok.</p>
                <button type="submit" disabled={loading || !input.trim()} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Gönderiliyor…" : "Gönder →"}</button>
              </div>
            </form>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-semibold">Durum</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>✓ Sohbet arayüzü etkin.</li>
                <li>✓ Firma hafızası için doğrulanmış temel bilgiler eklendi.</li>
                <li>✓ API anahtarı yalnızca sunucu tarafında kullanılır.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-semibold">Notlar</h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-slate-400">
                <li>Model: OpenAI gpt-4o-mini.</li>
                <li>Firma bilgisi olmayan ayrıntılar doğrulanmış gibi sunulmaz.</li>
                <li>Kalıcı hafıza ve giriş koruması sonraki adımda tamamlanacak.</li>
              </ul>
            </div>
          </aside>
        </section>
        <footer className="mt-8 border-t border-white/10 pt-4 text-xs text-slate-500">RKN AI · Önizleme alanı · Canlı yönetici girişi değiştirilmedi.</footer>
      </div>
    </main>
  );
}
