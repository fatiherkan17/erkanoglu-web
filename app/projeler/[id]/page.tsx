"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Media = { id: number; url: string; originalName: string; placement: "PROJE" | "INSAI"; sortOrder: number };
type PublicProject = {
  id: number;
  projectNo: string;
  category: string;
  publicTitle: string | null;
  publicSummary: string | null;
  status: string;
  media: Media[];
};

const categoryLabels: Record<string, string> = {
  KONUT: "Konut",
  VILLA: "Villa",
  TICARI: "Ticari Yapı",
  KARMA: "Karma Kullanım",
  ENDUSTRIYEL: "Endüstriyel",
  MEVCUT_YAPI: "Mevcut Yapı",
  KENTSEL_DONUSUM: "Kentsel Dönüşüm",
  TADILAT_RENOVASYON: "Tadilat / Renovasyon",
};

export default function PublicProjectDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/public-projects/${id}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Proje alınamadı.");
        return result.data as PublicProject;
      })
      .then(setProject)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Proje alınamadı."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="min-h-screen bg-[#f4f2ed] px-6 py-20 text-sm text-black/45">Proje yükleniyor...</main>;
  if (!project) return <main className="min-h-screen bg-[#f4f2ed] px-6 py-20"><div className="mx-auto max-w-5xl"><Link href="/projeler" className="text-xs uppercase tracking-[0.2em] text-black/45">← Referans Projeler</Link><p className="mt-14 text-sm text-red-700">{error || "Proje bulunamadı."}</p></div></main>;

  const projectPhotos = project.media.filter((item) => item.placement === "PROJE");
  const constructionPhotos = project.media.filter((item) => item.placement === "INSAI");
  const cover = projectPhotos[0]?.url || project.media[0]?.url || null;

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#151515]">
      <header className="border-b border-black/10"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10"><Link href="/" className="text-lg font-semibold tracking-[0.2em]">ERKANOĞLU</Link><Link href="/proje-talebi" className="rounded-full bg-[#151515] px-5 py-3 text-sm text-white">Projenizi Anlatın →</Link></div></header>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <Link href="/projeler" className="text-xs uppercase tracking-[0.25em] text-black/40">← Referans Projeler</Link>
        <div className="mt-12 grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div><div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-black/40"><span>{categoryLabels[project.category] ?? project.category}</span><span>·</span><span>{project.projectNo}</span></div><h1 className="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">{project.publicTitle || project.projectNo}</h1><p className="mt-8 max-w-xl text-lg leading-8 text-black/55">{project.publicSummary || "Proje özeti hazırlanıyor."}</p></div>
          <div className="aspect-[16/10] overflow-hidden bg-black/5">{cover ? <img src={cover} alt={project.publicTitle || project.projectNo} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/25">Görsel yok</div>}</div>
        </div>
      </section>

      {projectPhotos.length > 0 && <PhotoRail title="Proje Fotoğrafları" subtitle="Projenin genel görünümü." items={projectPhotos} dark />}
      {constructionPhotos.length > 0 && <PhotoRail title="İnşai Faaliyetler" subtitle="Yıkım ve yapım sürecinden seçilmiş saha fotoğrafları." items={constructionPhotos} />}

      <section className="bg-[#151515] text-white"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"><span className="text-xs uppercase tracking-[0.3em] text-white/35">Bir sonraki iş</span><h2 className="mt-6 max-w-4xl text-4xl font-medium tracking-[-0.045em] md:text-6xl">Projenizi birlikte değerlendirelim.</h2><Link href="/proje-talebi" className="mt-10 inline-flex rounded-full bg-white px-7 py-4 text-sm text-black">Projenizi Konuşalım →</Link></div></section>
      <footer className="bg-[#151515] text-white/40"><div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-6 py-8 text-sm md:flex-row md:justify-between lg:px-10"><span className="tracking-[0.2em] text-white">ERKANOĞLU</span><span>Mimarlık · Mühendislik · Yapı</span><span>Çanakkale · Türkiye</span></div></footer>
    </main>
  );
}

function PhotoRail({ title, subtitle, items, dark = false }: { title: string; subtitle: string; items: Media[]; dark?: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => railRef.current?.scrollBy({ left: direction === "right" ? 600 : -600, behavior: "smooth" });
  return <section className={`${dark ? "border-y border-black/10 bg-[#181818] text-white" : "border-y border-black/10 bg-[#f4f2ed]"}`}>
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <div className="mb-8 flex items-end justify-between gap-6"><div><div className={`text-xs uppercase tracking-[0.25em] ${dark ? "text-white/40" : "text-black/40"}`}>{title}</div><p className={`mt-3 text-sm ${dark ? "text-white/45" : "text-black/50"}`}>{subtitle}</p></div><div className="hidden gap-2 sm:flex"><button type="button" onClick={() => scroll("left")} className={`h-10 w-10 rounded-full border ${dark ? "border-white/20" : "border-black/15"}`}>←</button><button type="button" onClick={() => scroll("right")} className={`h-10 w-10 rounded-full border ${dark ? "border-white/20" : "border-black/15"}`}>→</button></div></div>
      <div ref={railRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {items.map((item, index) => <figure key={`${item.id}-${item.url}`} className="min-w-[86%] snap-start overflow-hidden sm:min-w-[62%] lg:min-w-[48%]"><img src={item.url} alt={`${title} ${index + 1}`} className="block aspect-[16/10] w-full object-cover" loading="lazy" /></figure>)}
      </div>
      <div className={`mt-3 text-[10px] uppercase tracking-[0.2em] ${dark ? "text-white/25" : "text-black/30"}`}>{items.length} fotoğraf · yatay kaydır</div>
    </div>
  </section>;
}
