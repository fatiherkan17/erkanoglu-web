import Link from "next/link";

export const metadata = {
  title: "Projeler | Erkanoğlu Mimarlık · Mühendislik · Yapı",
  description: "Erkanoğlu tarafından geliştirilen mimarlık, mühendislik ve yapı projeleri.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#151515]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
          <Link href="/" className="text-lg font-semibold tracking-[0.2em]">ERKANOĞLU</Link>
          <Link href="/proje-talebi" className="rounded-full bg-[#151515] px-5 py-3 text-sm text-white">Projenizi Anlatın →</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
        <span className="text-xs uppercase tracking-[0.3em] text-black/40">Referans Projeler</span>
        <h1 className="mt-7 max-w-5xl text-6xl font-medium leading-[0.92] tracking-[-0.055em] md:text-8xl">
          Yapının fikrinden
          <br />
          <span className="text-black/35">gerçeğine.</span>
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-8 text-black/55">
          Mimarlık, mühendislik ve yapı süreçlerinde geliştirdiğimiz işleri burada bir araya getiriyoruz.
          Yeni referanslarımızı gerçek proje bilgileri ve görselleriyle yayınlayacağız.
        </p>
      </section>

      <section className="border-y border-black/10 bg-[#181818] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/35">Portföy</span>
              <h2 className="mt-6 text-4xl font-medium tracking-[-0.045em] md:text-6xl">Gerçek işler,<br />gerçek hikâyeler.</h2>
            </div>
            <div className="border-t border-white/15 pt-8">
              <p className="max-w-2xl text-lg leading-8 text-white/60">
                Portföyümüzü doğrulanabilir proje kayıtları üzerinden oluşturuyoruz. Henüz kamuya açık referans olarak yayınlanmaya hazır proje bulunmadığı için bu alanı boş bırakıyoruz; temsili veya hayali işler göstermiyoruz.
              </p>
              <div className="mt-10 inline-flex border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/55">Yeni projeler hazırlanıyor</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-6 md:grid-cols-3">
          {["Konut · Villa", "Ticari Yapılar", "Mimarlık · Mühendislik"].map((item, index) => (
            <div key={item} className="border border-black/10 bg-white/40 p-7">
              <span className="text-xs text-black/30">0{index + 1}</span>
              <h3 className="mt-12 text-xl font-medium">{item}</h3>
              <p className="mt-4 text-sm leading-6 text-black/50">Gerçek proje kayıtları yayınlandıkça bu kategori altında yer alacaktır.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#dedbd3]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <span className="text-xs uppercase tracking-[0.3em] text-black/40">Bir sonraki proje</span>
          <h2 className="mt-6 max-w-4xl text-4xl font-medium tracking-[-0.045em] md:text-6xl">Projenizin hikâyesini birlikte yazalım.</h2>
          <Link href="/proje-talebi" className="mt-10 inline-flex rounded-full bg-[#151515] px-7 py-4 text-sm text-white">Proje İçin Teklif Al →</Link>
        </div>
      </section>

      <footer className="bg-[#151515] text-white/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm md:flex-row md:justify-between lg:px-10">
          <span className="tracking-[0.2em] text-white">ERKANOĞLU</span><span>Mimarlık · Mühendislik · Yapı</span><span>Çanakkale · Türkiye</span>
        </div>
      </footer>
    </main>
  );
}
