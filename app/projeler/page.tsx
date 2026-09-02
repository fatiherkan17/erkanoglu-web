"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PublicProject = {
  id: number;
  projectNo: string;
  category: string;
  publicTitle: string | null;
  publicSummary: string | null;
  coverImageUrl: string | null;
  galleryImages: string | null;
  status: string;
};

const categoryLabels: Record<string, string> = {
  KONUT: "Konut",
  VILLA: "Villa",
  TICARI: "Ticari Yapı",
  KARMA: "Karma Kullanım",
  ENDUSTRIYEL: "Endüstriyel",
  MEVCUT_YAPI: "Mevcut Yapı",
};

function parseGallery(value: string | null) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  } catch {
    return [] as string[];
  }
}

const applicationArchive = [
  "Mimari uygulama projeleri",
  "Statik uygulama projeleri",
  "Detay ve imalat çizimleri",
  "Güçlendirme ve mevcut yapı çizimleri",
  "Tadilat ve renovasyon projeleri",
];

const manufacturingArchive = [
  "Temel, betonarme ve çelik imalatlar",
  "Kaba yapı uygulamaları",
  "Çatı ve cephe imalatları",
  "İnce işler ve iç mekân uygulamaları",
  "Tadilat, yenileme ve dönüşüm işleri",
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public-projects", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setProjects(result?.data ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#151515]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
          <Link href="/" className="text-lg font-semibold tracking-[0.2em]">ERKANOĞLU</Link>
          <div className="flex items-center gap-4"><Link href="#uygulama-projeleri" className="hidden text-xs uppercase tracking-[0.2em] text-black/45 md:inline">Uygulamalar</Link><Link href="#imalat-arsivi" className="hidden text-xs uppercase tracking-[0.2em] text-black/45 md:inline">İmalatlar</Link><Link href="/proje-talebi" className="rounded-full bg-[#151515] px-5 py-3 text-sm text-white">Projenizi Konuşalım →</Link></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
        <span className="text-xs uppercase tracking-[0.3em] text-black/40">Referans İşler</span>
        <h1 className="mt-7 max-w-5xl text-6xl font-medium leading-[0.92] tracking-[-0.055em] md:text-8xl">
          Projeden uygulamaya,
          <br />
          <span className="text-black/35">işin tamamı.</span>
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-8 text-black/55">
          Erkanoğlu’nun gerçek projelerini, uygulama çizimlerini ve sahadaki imalat deneyimini tek bir referans arşivinde topluyoruz.
          Yayına alınan içerikler gerçek iş kayıtlarından oluşturulur.
        </p>
      </section>

      <section id="referans-projeler" className="border-y border-black/10 bg-[#181818] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div><span className="text-xs uppercase tracking-[0.3em] text-white/35">01 · Referans Projeler</span><h2 className="mt-6 text-4xl font-medium tracking-[-0.045em] md:text-6xl">Gerçek işler,<br />gerçek hikâyeler.</h2></div>
            {!loading && <div className="text-sm text-white/35">{projects.length} yayınlanan proje</div>}
          </div>

          {loading && <div className="border-t border-white/15 py-14 text-sm text-white/50">Projeler yükleniyor...</div>}
          {!loading && projects.length === 0 && <div className="border-t border-white/15 py-14"><p className="max-w-2xl text-lg leading-8 text-white/55">Henüz kamuya açık referans proje bulunmuyor. Gerçek projeler yayına alındıkça burada görünecek.</p></div>}
          {!loading && projects.length > 0 && <div className="grid gap-6 md:grid-cols-2">{projects.map((project) => { const images = parseGallery(project.galleryImages); const image = project.coverImageUrl || images[0]; return <Link key={project.id} href={`/projeler/${project.id}`} className="group border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]"><article><div className="aspect-[16/10] overflow-hidden bg-white/5">{image ? <img src={image} alt={project.publicTitle || `${project.projectNo} projesi`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/25">Görsel hazırlanıyor</div>}</div><div className="p-7"><div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-white/35"><span>{categoryLabels[project.category] ?? project.category}</span><span>{project.status === "TAMAMLANDI" ? "Tamamlandı" : "Devam ediyor"}</span></div><h3 className="mt-5 text-2xl font-medium">{project.publicTitle || project.projectNo}</h3><p className="mt-4 text-sm leading-7 text-white/50">{project.publicSummary || "Proje detayları yakında yayınlanacaktır."}</p><div className="mt-6 text-xs uppercase tracking-[0.2em] text-white/45">Projeyi incele →</div></div></article></Link>; })}</div>}
        </div>
      </section>

      <section id="uygulama-projeleri" className="bg-[#dedbd3]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-end"><div><span className="text-xs uppercase tracking-[0.3em] text-black/40">02 · Uygulama Projeleri</span><h2 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">Çizimden<br />sahaya.</h2></div><p className="max-w-2xl text-xl leading-8 text-black/55">Projenin sadece sunum görsellerinden ibaret olmadığını; uygulamaya yön veren teknik çizim ve detaylarla gösteriyoruz.</p></div>
          <div className="mt-16 grid border-t border-black/15 md:grid-cols-2">{applicationArchive.map((item, index) => <div key={item} className="flex items-center justify-between border-b border-black/15 py-6 md:px-6 md:first:pl-0"><div className="flex items-center gap-6"><span className="text-xs text-black/30">{String(index + 1).padStart(2, "0")}</span><span className="text-lg">{item}</span></div><span className="text-black/25">→</span></div>)}</div>
          <div className="mt-10 border border-black/10 bg-white/35 p-7 text-sm leading-7 text-black/50">Bu arşiv, gerçek projelerden seçilmiş pafta ve detayların yayınlanacağı alan olacak. Teknik dokümanların tamamı kamuya açık olmak zorunda değildir; yayına uygun seçilmiş bölümler kullanılacaktır.</div>
        </div>
      </section>

      <section id="imalat-arsivi" className="border-y border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]"><div><span className="text-xs uppercase tracking-[0.3em] text-black/40">03 · İmalat Arşivi</span><h2 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">Sahadaki gerçek<br /><span className="text-black/35">üretim.</span></h2><p className="mt-8 max-w-2xl text-lg leading-8 text-black/55">Kaba yapıdan ince işlere, tadilattan yenilemeye kadar yapılan imalatları proje ve saha fotoğraflarıyla zaman içinde arşivliyoruz.</p></div><div className="border-t border-black/15 pt-6 text-sm text-black/45">Fotoğraf arşivi; proje, imalat türü ve uygulama aşamasına göre ilişkilendirilecek.</div></div>
          <div className="mt-16 grid border-t border-black/15 md:grid-cols-2">{manufacturingArchive.map((item, index) => <div key={item} className="border-b border-black/15 p-7 md:min-h-[150px] md:p-9"><span className="text-xs text-black/30">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-7 text-xl font-medium">{item}</h3></div>)}</div>
          <div className="mt-10 rounded-none border border-black/10 bg-[#f4f2ed] p-7"><p className="text-sm leading-7 text-black/50">İlk aşamada bu bölüm, gerçek fotoğraf ve iş kayıtları geldikçe doldurulacak. Uydurma veya temsili imalat görselleri kullanılmayacak.</p></div>
        </div>
      </section>

      <section className="bg-[#151515] text-white"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><span className="text-xs uppercase tracking-[0.3em] text-white/35">Bir sonraki iş</span><h2 className="mt-6 max-w-4xl text-4xl font-medium tracking-[-0.045em] md:text-6xl">Projenizi, uygulamayı veya dönüşümü birlikte değerlendirelim.</h2><Link href="/proje-talebi" className="mt-10 inline-flex rounded-full bg-white px-7 py-4 text-sm text-black">Projenizi Konuşalım →</Link></div></section>

      <footer className="bg-[#151515] text-white/40"><div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-6 py-8 text-sm md:flex-row md:justify-between lg:px-10"><span className="tracking-[0.2em] text-white">ERKANOĞLU</span><span>Mimarlık · Mühendislik · Yapı · Uygulama</span><span>Çanakkale · Türkiye</span></div></footer>
    </main>
  );
}
