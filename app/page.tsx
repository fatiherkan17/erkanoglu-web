import Link from "next/link";

const architectureServices = [
  "Mimari Tasarım", "Ruhsat Projesi", "Uygulama Projesi", "Statik Proje", "Elektrik Projesi", "Mekanik Proje", "Harita / Aplikasyon", "Zemin ve Temel Etüdü", "Yangın Projesi", "Isı ve Su Yalıtımı", "Akustik", "Asansör", "Peyzaj",
];
const projectTypes = ["Konut", "Villa", "Ticari Yapılar", "Karma Kullanım", "Endüstriyel Yapılar", "Mevcut Yapılar"];

export default function HomePage() {
  return (
    <main className="bg-[#f4f2ed] text-[#151515]">
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="flex items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="text-xl font-semibold tracking-[0.22em] text-white mix-blend-difference">ERKANOĞLU</Link>
          <nav className="hidden items-center gap-7 text-sm text-white mix-blend-difference md:flex">
            <a href="#mimarlik">Mimarlık</a><a href="#proje">Ruhsat Projesi</a><Link href="/projeler">Projeler</Link><Link href="/is-birligi">İş Birliği</Link><a href="#iletisim">İletişim</a>
          </nav>
          <Link href="/proje-talebi" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">Projenizi Anlatın</Link>
        </div>
      </header>

      <section id="mimarlik" className="relative min-h-screen overflow-hidden bg-black">
        <img src="/hero-erkanoglu.png" alt="Erkanoğlu Mimarlık" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/30" /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="relative flex min-h-screen items-end px-6 pb-16 lg:px-10 lg:pb-24"><div className="w-full">
          <div className="mb-8 flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-white/60"><span>Çanakkale</span><span className="h-px w-12 bg-white/40" /><span>Mimarlık · Mühendislik · Yapı</span></div>
          <h1 className="max-w-6xl text-6xl font-medium leading-[0.9] tracking-[-0.055em] text-white md:text-8xl lg:text-[9rem]">Mekânı<br /><span className="text-white/55">hayal edin.</span></h1>
          <div className="mt-12 flex flex-col justify-between gap-8 md:flex-row md:items-end"><p className="max-w-xl text-lg leading-8 text-white/75">İyi bir yapı yalnızca inşa edilmez. Bir fikirle başlar, doğru tasarım ve mühendislikle gerçeğe dönüşür.</p><a href="#mimarlik-giris" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/40 text-2xl text-white transition hover:bg-white hover:text-black">↓</a></div>
        </div></div>
      </section>

      <section id="mimarlik-giris" className="border-b border-black/10"><div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40"><div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]"><div><span className="text-xs uppercase tracking-[0.3em] text-black/40">Mimarlık</span></div><div><h2 className="max-w-5xl text-4xl font-medium leading-[1.05] tracking-[-0.045em] md:text-6xl lg:text-7xl">Bir yapının karakteri,<br />daha ilk çizgide<br /><span className="text-black/35">ortaya çıkar.</span></h2><p className="mt-10 max-w-2xl text-lg leading-8 text-black/55">Tasarımı yalnızca estetik bir karar olarak görmüyoruz. Arsanın koşulları, ışık, kullanım, malzeme, mühendislik, maliyet ve yapının geleceği aynı tasarımın parçalarıdır.</p><Link href="/proje-talebi" className="mt-10 inline-flex border-b border-black pb-2 text-sm font-medium">Mimari projenizi anlatın →</Link></div></div></div></section>

      <section className="bg-[#181818] text-white"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><div className="flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><span className="text-xs uppercase tracking-[0.3em] text-white/35">Çalışma alanları</span><h2 className="mt-6 text-4xl font-medium tracking-[-0.04em] md:text-6xl">Her yapı,<br />kendi hikâyesini taşır.</h2></div><p className="max-w-md text-white/50">Konutlardan ticari yapılara, yeni yapılardan mevcut yapıların dönüşümüne kadar farklı ölçeklerde çözümler geliştiriyoruz.</p></div><div className="mt-20 grid border-t border-white/15 md:grid-cols-2">{projectTypes.map((type, index) => <div key={type} className="group flex items-center justify-between border-b border-white/15 py-8 md:px-6 md:first:pl-0"><div className="flex items-center gap-8"><span className="text-xs text-white/25">0{index + 1}</span><span className="text-2xl font-light md:text-3xl">{type}</span></div><span className="text-xl text-white/30 transition group-hover:translate-x-2 group-hover:text-white">→</span></div>)}</div></div></section>

      <section id="proje"><div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40"><div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]"><div><span className="text-xs uppercase tracking-[0.3em] text-black/40">Proje</span><h2 className="mt-6 text-5xl font-medium tracking-[-0.05em] md:text-7xl">Ruhsat<br />Projesi.</h2></div><div><p className="max-w-3xl text-2xl leading-[1.3] tracking-[-0.025em] md:text-4xl">Tasarımın yapı ruhsatına dönüşmesi için gereken tüm disiplinleri tek bir süreç içerisinde koordine ediyoruz.</p><div className="mt-16 grid border-t border-black/15 sm:grid-cols-2">{architectureServices.map((item, index) => <div key={item} className="flex items-center gap-5 border-b border-black/15 py-5"><span className="text-xs text-black/30">{String(index + 1).padStart(2, "0")}</span><span className="text-sm">{item}</span></div>)}</div><Link href="/proje-talebi" className="mt-12 inline-flex rounded-full bg-[#151515] px-7 py-4 text-sm text-white">Ruhsat Projesi İçin Teklif Al →</Link></div></div></div></section>

      <section className="border-y border-black/10 bg-[#dedbd3]"><div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36"><div className="max-w-3xl"><span className="text-xs uppercase tracking-[0.3em] text-black/40">Yaklaşım</span><h2 className="mt-6 text-4xl font-medium leading-tight tracking-[-0.045em] md:text-6xl">Tasarımdan<br />uygulamaya.</h2></div><div className="mt-20 grid border-t border-black/15 md:grid-cols-4">{[["01","Anlamak","Arsayı, ihtiyacı ve beklentiyi anlamak."],["02","Tasarlamak","Fikri mekâna ve projeye dönüştürmek."],["03","Çözmek","Mimariyi mühendislik ile bütünleştirmek."],["04","Gerçekleştirmek","Projeyi sahada hayata geçirmek."]].map(([number,title,text])=><div key={number} className="border-b border-black/15 py-8 md:border-b-0 md:border-r md:px-7 md:first:pl-0"><span className="text-xs text-black/35">{number}</span><h3 className="mt-10 text-2xl font-medium">{title}</h3><p className="mt-4 leading-7 text-black/55">{text}</p></div>)}</div></div></section>

      <section><div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36"><div className="grid gap-16 lg:grid-cols-2"><div><span className="text-xs uppercase tracking-[0.3em] text-black/40">Mühendislik</span><h2 className="mt-6 text-5xl font-medium tracking-[-0.05em] md:text-7xl">Güzel olanın<br /><span className="text-black/35">sağlam olması gerekir.</span></h2></div><div className="flex items-end"><p className="max-w-xl text-lg leading-8 text-black/55">Mimari tasarımın teknik gerçeklerle buluştuğu noktada mühendislik başlar. Yapının güvenliği, performansı ve uygulanabilirliği tasarımın ayrılmaz parçalarıdır.</p></div></div></div></section>

      <section className="border-y border-black/10 bg-[#181818] text-white"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><div className="grid gap-6 md:grid-cols-2"><Link href="/projeler" className="border border-white/15 p-8 transition hover:bg-white hover:text-black"><span className="text-xs uppercase tracking-[0.25em] text-white/40">Referans Projeler</span><h2 className="mt-12 text-3xl font-medium">Gerçek işler,<br />gerçek hikâyeler. →</h2></Link><Link href="/is-birligi" className="border border-white/15 p-8 transition hover:bg-white hover:text-black"><span className="text-xs uppercase tracking-[0.25em] text-white/40">İş Birliği</span><h2 className="mt-12 text-3xl font-medium">İyi projeler,<br />iyi ekiplerle başlar. →</h2></Link></div></div></section>

      <section id="iletisim" className="bg-[#151515] text-white"><div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40"><span className="text-xs uppercase tracking-[0.3em] text-white/35">İlk adım</span><h2 className="mt-8 max-w-5xl text-5xl font-medium leading-[0.95] tracking-[-0.055em] md:text-7xl lg:text-8xl">Bir yapı<br />hayaliniz varsa,<br /><span className="text-white/35">konuşalım.</span></h2><div className="mt-14 flex flex-col gap-5 sm:flex-row"><Link href="/proje-talebi" className="rounded-full bg-white px-8 py-5 text-center text-sm font-medium text-black">Proje İçin Teklif Al →</Link><Link href="/evimi-hesapla" className="rounded-full border border-white/25 px-8 py-5 text-center text-sm text-white">Yapı Maliyetini Hesapla</Link></div></div></section>
      <footer className="bg-[#151515] text-white/40"><div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-white/10 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between lg:px-10"><span className="tracking-[0.2em] text-white">ERKANOĞLU</span><span>Mimarlık · Mühendislik · Yapı</span><span>Çanakkale · Türkiye</span></div></footer>
    </main>
  );
}
