export const metadata = {
  title: "RKN AI | Erkanoğlu İnşaat",
  robots: { index: false, follow: false },
};

export default function RknAiPreviewPage() {
  return (
    <main className="min-h-screen bg-[#0b1020] px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Erkanoğlu İnşaat
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              RKN AI
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Firma bilgilerini temel alan özel yapay zekâ çalışma alanı.
            </p>
          </div>
          <span className="w-fit rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-medium text-amber-200">
            Önizleme · Model bağlantısı bekleniyor
          </span>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <p className="text-sm font-medium text-cyan-200">Çalışma alanı</p>
            <h2 className="mt-2 text-xl font-semibold">Firma asistanı</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Bu özel sayfanın arayüzü hazırlanıyor. Gerçek sohbeti açmadan önce
              model sağlayıcısı, firma hafızası ve erişim kontrolleri sunucu
              tarafında bağlanacak. Bu önizleme henüz yapay zekâya istek göndermez.
            </p>
            <div className="mt-6 rounded-xl border border-white/10 bg-[#070b16] p-4">
              <label htmlFor="rkn-message" className="mb-2 block text-sm text-slate-300">
                Mesaj örneği
              </label>
              <textarea
                id="rkn-message"
                disabled
                rows={3}
                placeholder="Model bağlantısı tamamlandığında buradan RKN AI ile konuşabileceksin."
                className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-slate-400 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg bg-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-100/50"
                >
                  Bağlantı bekleniyor
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-semibold">Güvenlik durumu</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                  Sayfa yönetici alanı altında
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                  Model API bağlantısı henüz yok
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                  Firma hafızası henüz bağlanmadı
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-semibold">Sıradaki adımlar</h2>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-400">
                <li>Ücretsiz veya mevcut yerel model bağlantısını seçmek</li>
                <li>API anahtarlarını yalnızca sunucu tarafında tutmak</li>
                <li>Firma hafızasını doğruluk kurallarıyla bağlamak</li>
                <li>Önizlemede test edip sonra yayınlamak</li>
              </ol>
            </div>
          </aside>
        </section>

        <footer className="mt-8 border-t border-white/10 pt-4 text-xs text-slate-500">
          RKN AI · Özel yönetici alanı · Bu sayfa henüz canlı sohbet sunmaz.
        </footer>
      </div>
    </main>
  );
}
