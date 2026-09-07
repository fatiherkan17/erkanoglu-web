"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PublicMedia = { id: number; url: string; placement: string; sortOrder: number };
type PublicProject = {
  id: number;
  projectNo: string;
  category: string;
  publicTitle: string | null;
  publicSummary: string | null;
  status: string;
  media: PublicMedia[];
};

const categoryLabels: Record<string, string> = {
  KONUT: "Konut",
  VILLA: "Villa",
  TICARI: "Ticari Yapı",
  KARMA: "Karma Kullanım",
  ENDUSTRIYEL: "Endüstriyel",
  MEVCUT_YAPI: "Mevcut Yapı",
  KENTSEL_DONUSUM: "Kentsel Dönüşüm",
  TADILAT_RENOVASYON: "Tadilat & Renovasyon",
};

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
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f2ed]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
          <Link href="/" className="text-lg font-semibold tracking-[0.2em]">ERKANOĞLU</Link>
          <nav className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.16em] text-black/55 md:flex">
            <Link href="/" className="hover:text-black">Ana Sayfa</Link>
            <Link href="/is-birligi" className="hover:text-black">Çözüm Ortakları</Link>
            <Link href="/proje-talebi" className="hover:text-black">Projenizi Konuşalım</Link>
          </nav>
          <Link href="/proje-talebi" className="rounded-full bg-[#151515] px-5 py-3 text-sm text-white">Projenizi Konuşalım →</Link>
        </div>
      </header>

      <section className="border-b border-black/10 bg-[#181818] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <span className="text-xs uppercase tracking-[0.3em] text-white/35">Referans İşler</span>
          <div className="mt-7 flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <div>
              <h1 className="max-w-5xl text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">Yaptığımız işler.</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/55">Tamamlanan gerçek projeleri; sonuçları, proje fotoğrafları ve inşai faaliyet aşamalarıyla birlikte inceleyin.</p>
            </div>
            {!loading && <div className="text-sm text-white/35">{projects.length} yayınlanan proje</div>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        {loading && <div className="py-16 text-sm text-black/45">Projeler yükleniyor...</div>}
        {!loading && projects.length === 0 && <div className="border border-black/10 bg-white/30 p-10"><p className="max-w-2xl text-lg leading-8 text-black/55">Henüz yayınlanmış referans iş bulunmuyor.</p></div>}
        {!loading && projects.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2">
            {projects.map((project) => {
              const ordered = [...(project.media || [])].sort((a, b) => a.sortOrder - b.sortOrder);
              const projectImage = ordered.find((item) => item.placement === "PROJE") || ordered[0];
              return (
                <Link key={project.id} href={`/projeler/${project.id}`} className="group overflow-hidden border border-black/10 bg-white/40 transition hover:-translate-y-1">
                  <article>
                    <div className="aspect-[16/10] overflow-hidden bg-black/5">
                      {projectImage ? <img src={projectImage.url} alt={project.publicTitle || `${project.projectNo} projesi`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/25">Görsel hazırlanıyor</div>}
                    </div>
                    <div className="p-7 md:p-8">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-black/35">{categoryLabels[project.category] ?? project.category}</div>
                      <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em]">{project.publicTitle || project.projectNo}</h2>
                      {project.publicSummary && <p className="mt-4 text-sm leading-7 text-black/55">{project.publicSummary}</p>}
                      <div className="mt-7 text-xs uppercase tracking-[0.2em] text-black/45">İşi incele →</div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-[#151515] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <span className="text-xs uppercase tracking-[0.3em] text-white/35">Bir sonraki iş</span>
          <h2 className="mt-6 max-w-4xl text-4xl font-medium tracking-[-0.045em] md:text-6xl">Sıradaki projeyi birlikte konuşalım.</h2>
          <Link href="/proje-talebi" className="mt-10 inline-flex rounded-full bg-white px-7 py-4 text-sm text-black">Projenizi Konuşalım →</Link>
        </div>
      </section>

      <footer className="bg-[#151515] text-white/40"><div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-6 py-8 text-sm md:flex-row md:justify-between lg:px-10"><span className="tracking-[0.2em] text-white">ERKANOĞLU</span><span>Mimarlık · Mühendislik · Yapı · Uygulama</span><span>Çanakkale · Türkiye</span></div></footer>
    </main>
  );
}
