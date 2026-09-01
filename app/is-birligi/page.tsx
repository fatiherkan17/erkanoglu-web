import Link from "next/link";

export const metadata = {
  title: "İş Birliği | Erkanoğlu Mimarlık · Mühendislik · Yapı",
  description: "Erkanoğlu ile mimarlık, mühendislik, uygulama, tedarik ve yatırım alanlarında iş birliği.",
};

const collaborationTypes = [
  ["01", "Mimarlar", "Tasarım ekipleri, proje ortaklıkları ve birlikte geliştirilen işler."],
  ["02", "Mühendisler", "Yapının farklı disiplinlerini aynı proje sürecinde buluşturmak."],
  ["03", "Uygulama Ekipleri", "Sahadaki uzmanlık ve uygulama kabiliyetlerini projelere dahil etmek."],
  ["04", "Markalar · Tedarikçiler", "Yapı ve malzeme dünyasındaki nitelikli çözüm ortaklarıyla çalışmak."],
  ["05", "Yatırımcılar", "Yeni yapı ve gayrimenkul fikirlerini doğru proje ekibiyle buluşturmak."],
  ["06", "Gayrimenkul Profesyonelleri", "Arsa, mülk ve proje fırsatlarında birlikte değer üretmek."],
];

export default function CollaborationPage() {
  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#151515]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
          <Link href="/" className="text-lg font-semibold tracking-[0.2em]">ERKANOĞLU</Link>
          <Link href="/proje-talebi" className="rounded-full bg-[#151515] px-5 py-3 text-sm text-white">Projenizi Anlatın →</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
        <span className="text-xs uppercase tracking-[0.3em] text-black/40">İş Birliği</span>
        <h1 className="mt-7 max-w-5xl text-6xl font-medium leading-[0.92] tracking-[-0.055em] md:text-8xl">
          İyi projeler,
          <br />
          <span className="text-black/35">iyi ekiplerle başlar.</span>
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-8 text-black/55">
          Mimarlık, mühendislik ve yapı süreçlerinde farklı uzmanlıkları bir araya getiriyoruz. Birlikte üretmek, yeni bir proje geliştirmek veya çözümünüzü projelerimize dahil etmek istiyorsanız sizinle tanışmak isteriz.
        </p>
      </section>

      <section className="bg-[#181818] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="mb-16 max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-white/35">Çözüm ortakları</span>
            <h2 className="mt-6 text-4xl font-medium tracking-[-0.045em] md:text-6xl">Kimlerle çalışıyoruz?</h2>
          </div>
          <div className="grid border-t border-white/15 md:grid-cols-2">
            {collaborationTypes.map(([number, title, text]) => (
              <div key={number} className="border-b border-white/15 py-8 md:px-7 md:first:pl-0">
                <span className="text-xs text-white/30">{number}</span>
                <h3 className="mt-7 text-2xl font-light">{title}</h3>
                <p className="mt-4 max-w-md leading-7 text-white/50">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
          <span className="text-xs uppercase tracking-[0.3em] text-black/40">Birlikte üretelim</span>
          <div>
            <h2 className="max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.045em] md:text-6xl">Projeniz, uzmanlığınız veya çözümünüz varsa konuşalım.</h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-black/55">İş birliği tekliflerini değerlendirmek için kapsamı, uzmanlık alanınızı ve birlikte geliştirebileceğimiz fikri paylaşabilirsiniz.</p>
            <a href="mailto:info@erkanoglu.com.tr" className="mt-10 inline-flex rounded-full bg-[#151515] px-7 py-4 text-sm text-white">İş birliği teklifinizi gönderin →</a>
          </div>
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
