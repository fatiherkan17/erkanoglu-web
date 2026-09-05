import Link from "next/link";

const projectTypes = ["Konut", "Villa", "Ticari Yapılar", "Karma Kullanım", "Endüstriyel Yapılar", "Mevcut Yapılar"];

const serviceLines = [
  ["01", "Mimarlık", "Mimari tasarım, ruhsat ve uygulama projeleri; yeni yapılar, mevcut yapılar ve yaşam alanları."],
  ["02", "Mühendislik", "Statik proje, betonarme ve çelik çözümler, güçlendirme ve mevcut yapı değerlendirmeleri."],
  ["03", "Danışmanlık", "Arsa ve yapı ön değerlendirmesi, fizibilite, maliyet ve yapım öncesi teknik danışmanlık."],
  ["04", "Müteahhitlik", "Projenin uygulamaya dönüşmesi için anahtar teslimden belirli imalatlara kadar yapım çözümleri."],
  ["05", "Tadilat & Renovasyon", "Mevcut mekânların yenilenmesi, dönüşümü ve ihtiyaçlara göre yeniden ele alınması."],
  ["06", "Şantiye Yönetimi", "İş programı, imalat kontrolü, kalite, hakediş ve ekip koordinasyonu ile sahada yönetim."],
];

export default function HomePage() {
  return (
    <main className="bg-[#f4f2ed] text-[#151515]">
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="flex items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="text-xl font-semibold tracking-[0.22em] text-white mix-blend-difference">ERKANOĞLU</Link>
          <nav className="hidden items-center gap-7 text-sm text-white mix-blend-difference md:flex">
            <a href="#hizmetler">Hizmetler</a>
            <Link href="/projeler#referans-projeler">Referans Projeler</Link>
            <Link href="/projeler#uygulama-projeleri">Uygulama Projeleri</Link>
            <Link href="/projeler#imalat-arsivi">İmalat Arşivi</Link>
            <Link href="/is-birligi">Çözüm Ortakları</Link>
            <a href="#iletisim">İletişim</a>
          </nav>
          <Link href="/proje-talebi" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">Projenizi Konuşalım</Link>
        </div>
      </header>

      <section className="relative min-h-screen overflow-hidden bg-black">
        <img src="/hero-erkanoglu.png" alt="Erkanoğlu Mimarlık, Mühendislik ve Yapı" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/30" /><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="relative flex min-h-screen items-end px-6 pb-16 lg:px-10 lg:pb-24"><div className="w-full">
          <div className="mb-8 flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-white/60"><span>Çanakkale</span><span className="h-px w-12 bg-white/40" /><span>Mimarlık · Mühendislik · Yapı</span></div>
          <h1 className="max-w-6xl text-6xl font-medium leading-[0.9] tracking-[-0.055em] text-white md:text-8xl lg:text-[9rem]">Fikirden<br /><span className="text-white/55">uygulamaya.</span></h1>
          <div className="mt-12 flex flex-col justify-between gap-8 md:flex-row md:items-end"><p className="max-w-2xl text-lg leading-8 text-white/75">Erkanoğlu; mimarlık, mühendislik, danışmanlık, yapım, tadilat ve şantiye yönetimini aynı proje anlayışı içerisinde buluşturur.</p><a href="#hizmetler" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/40 text-2xl text-white transition hover:bg-white hover:text-black">↓</a></div>
        </div></div>
      </section>

      <section id="hizmetler" className="border-b border-black/10"><div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40"><div className="grid gap-16 lg:grid-cols-[0.65fr_1.35fr]"><div><span className="text-xs uppercase tracking-[0.3em] text-black/40">Hizmetler</span></div><div><h2 className="max-w-5xl text-4xl font-medium leading-[1.05] tracking-[-0.045em] md:text-6xl lg:text-7xl">Bir projeyi sadece<br />çizmiyor, <span className="text-black/35">hayata geçiriyoruz.</span></h2><p className="mt-10 max-w-2xl text-lg leading-8 text-black/55">İhtiyaca göre tasarım, mühendislik, danışmanlık ve uygulama süreçlerini bir araya getiriyor; gerektiğinde çözüm ortaklarımızla birlikte tek bir proje ekibi gibi çalışıyoruz.</p><Link href="/proje-talebi" className="mt-10 inline-flex border-b border-black pb-2 text-sm font-medium">Projenizi birlikte değerlendirelim →</Link></div></div></div></section>

      <section className="bg-[#181818] text-white"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><div className="flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><span className="text-xs uppercase tracking-[0.3em] text-white/35">Çalışma alanları</span><h2 className="mt-6 text-4xl font-medium tracking-[-0.04em] md:text-6xl">Her proje,<br />kendi çözümünü ister.</h2></div><p className="max-w-md text-white/50">Yeni yapıdan tadilata, statik projeden şantiye yönetimine kadar ihtiyaç duyulan noktada sürece dahil oluyoruz.</p></div><div className="mt-20 grid border-t border-white/15 md:grid-cols-2">{serviceLines.map(([number, title, text]) => <div key={number} className="border-b border-white/15 p-8 md:min-h-[260px] md:p-10"><span className="text-xs text-white/25">{number}</span><h3 className="mt-8 text-2xl font-light md:text-3xl">{title}</h3><p className="mt-4 max-w-lg leading-7 text-white/50">{text}</p></div>)}</div></div></section>

      <section><div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36"><div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]"><div><span className="text-xs uppercase tracking-[0.3em] text-black/40">Proje Süreci</span><h2 className="mt-6 text-5xl font-medium tracking-[-0.05em] md:text-7xl">Tasarımdan<br />uygulamaya.</h2></div><div><p className="max-w-3xl text-2xl leading-[1.3] tracking-[-0.025em] md:text-4xl">İhtiyacı anlıyor, doğru hizmetleri bir araya getiriyor, projeyi çözüyor ve sahadaki uygulamayı takip ediyoruz.</p><div className="mt-16 grid border-t border-black/15 sm:grid-cols-2">{[["01","Anlamak","Arsayı, ihtiyacı ve beklentiyi anlamak."],["02","Tasarlamak","Mimariyi ve mühendisliği birlikte kurgulamak."],["03","Planlamak","Ruhsat, maliyet, iş programı ve uygulama kapsamını netleştirmek."],["04","Gerçekleştirmek","Yapımı, tadilatı veya şantiye sürecini sahada yönetmek."]].map(([number,title,text])=><div key={number} className="border-b border-black/15 py-7 sm:px-6 sm:first:pl-0"><span className="text-xs text-black/30">{number}</span><h3 className="mt-7 text-2xl font-medium">{title}</h3><p className="mt-4 leading-7 text-black/55">{text}</p></div>)}</div></div></div></div></section>

      <section className="bg-[#dedbd3]"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><div className="flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><span className="text-xs uppercase tracking-[0.3em] text-black/40">Yaptıklarımız</span><h2 className="mt-6 text-4xl font-medium tracking-[-0.045em] md:text-6xl">Sadece sonuçları değil,<br />işin kendisini de gösteriyoruz.</h2></div><p className="max-w-md text-black/55">Gerçek referans projelerimizi; uygulama projeleri, teknik çizimler, imalatlar ve saha fotoğraflarıyla birlikte zaman içinde arşivliyoruz.</p></div><div className="mt-16 grid gap-4 md:grid-cols-3"><Link href="/projeler#referans-projeler" className="group bg-[#f4f2ed] p-8 transition hover:-translate-y-1"><span className="text-xs uppercase tracking-[0.25em] text-black/35">01 · Referans Projeler</span><h3 className="mt-16 text-3xl font-medium tracking-[-0.04em]">Tamamlanan ve devam eden işler →</h3><p className="mt-4 text-sm leading-7 text-black/50">Projenin bütünü, kapsamı ve seçilmiş görseller.</p></Link><Link href="/projeler#uygulama-projeleri" className="group bg-[#f4f2ed] p-8 transition hover:-translate-y-1"><span className="text-xs uppercase tracking-[0.25em] text-black/35">02 · Uygulama Projeleri</span><h3 className="mt-16 text-3xl font-medium tracking-[-0.04em]">Çizimden sahaya →</h3><p className="mt-4 text-sm leading-7 text-black/50">Seçilmiş mimari, statik ve detay paftaları.</p></Link><Link href="/projeler#imalat-arsivi" className="group bg-[#f4f2ed] p-8 transition hover:-translate-y-1"><span className="text-xs uppercase tracking-[0.25em] text-black/35">03 · İmalat Arşivi</span><h3 className="mt-16 text-3xl font-medium tracking-[-0.04em]">Sahadaki gerçek üretim →</h3><p className="mt-4 text-sm leading-7 text-black/50">Kaba yapıdan tadilat ve ince işlere kadar uygulama kayıtları.</p></Link></div></div></section>

      <section className="border-y border-black/10 bg-[#181818] text-white"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><div className="grid gap-6 md:grid-cols-2"><Link href="/projeler" className="border border-white/15 p-8 transition hover:bg-white hover:text-black"><span className="text-xs uppercase tracking-[0.25em] text-white/40">Referans İşler</span><h2 className="mt-12 text-3xl font-medium">Projeleri ve uygulamaları inceleyin. →</h2></Link><Link href="/is-birligi" className="border border-white/15 p-8 transition hover:bg-white hover:text-black"><span className="text-xs uppercase tracking-[0.25em] text-white/40">Çözüm Ortakları</span><h2 className="mt-12 text-3xl font-medium">İhtiyaca göre ekibi büyütüyoruz. →</h2></Link></div></div></section>

      <section id="iletisim" className="bg-[#151515] text-white"><div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40"><span className="text-xs uppercase tracking-[0.3em] text-white/35">İlk adım</span><h2 className="mt-8 max-w-5xl text-5xl font-medium leading-[0.95] tracking-[-0.055em] md:text-7xl lg:text-8xl">Bir yapı,<br />bir dönüşüm<br /><span className="text-white/35">veya bir fikriniz varsa konuşalım.</span></h2><p className="mt-10 max-w-2xl text-lg leading-8 text-white/55">İhtiyacınızı anlatın. Önce birlikte değerlendirelim; gerekiyorsa ofisimizde yüz yüze görüşelim.</p><div className="mt-14 flex flex-col gap-5 sm:flex-row"><Link href="/proje-talebi" className="rounded-full bg-white px-8 py-5 text-center text-sm font-medium text-black">Projenizi Konuşalım →</Link><Link href="/evimi-hesapla" className="rounded-full border border-white/25 px-8 py-5 text-center text-sm text-white">Yapı Maliyetini Hesapla</Link></div></div></section>
      <footer className="bg-[#151515] text-white/40"><div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-white/10 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between lg:px-10"><span className="tracking-[0.2em] text-white">ERKANOĞLU</span><span>Mimarlık · Mühendislik · Yapı · Uygulama</span><span>Çanakkale · Türkiye</span></div></footer>
    </main>
  );
}
