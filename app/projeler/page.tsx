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
          Mimarlık, mühendislik ve yapı süreçlerinde geliştirdiğimiz işleri bir araya getiriyoruz.
          Yayına alınan projeler gerçek proje kayıtlarından oluşturulur.
        </p>
      </section>

      <section className="border-y border-black/10 bg-[#181818] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/35">Portföy</span>
              <h2 className="mt-6 text-4xl font-medium tracking-[-0.045em] md:text-6xl">Gerçek işler,<br />gerçek hikâyeler.</h2>
            </div>
            {!loading && <div className="text-sm text-white/35">{projects.length} yayınlanan proje</div>}
          </div>

          {loading && <div className="border-t border-white/15 py-14 text-sm text-white/50">Projeler yükleniyor...</div>}

          {!loading && projects.length === 0 && (
            <div className="border-t border-white/15 py-14">
              <p className="max-w-2xl text-lg leading-8 text-white/55">Henüz kamuya açık referans proje bulunmuyor. İlk projeler yayınlandıkça burada görünecek.</p>
            </div>
          )}

          {!loading && projects.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => {
                const images = parseGallery(project.galleryImages);
                const image = project.coverImageUrl || images[0];
                return (
                  <Link key={project.id} href={`/projeler/${project.id}`} className="group border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]">
                    <article>
                      <div className="aspect-[16/10] overflow-hidden bg-white/5">
                        {image ? <img src={image} alt={project.publicTitle || `${project.projectNo} projesi`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/25">Görsel hazırlanıyor</div>}
                      </div>
                      <div className="p-7">
                        <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-white/35"><span>{categoryLabels[project.category] ?? project.category}</span><span>{project.status === "TAMAMLANDI" ? "Tamamlandı" : "Devam ediyor"}</span></div>
                        <h3 className="mt-5 text-2xl font-medium">{project.publicTitle || project.projectNo}</h3>
                        <p className="mt-4 text-sm leading-7 text-white/50">{project.publicSummary || "Proje detayları yakında yayınlanacaktır."}</p>
                        <div className="mt-6 text-xs uppercase tracking-[0.2em] text-white/45">Projeyi incele →</div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
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
