"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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
      .then((data) => setProject(data))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Proje alınamadı.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const gallery = useMemo(() => parseGallery(project?.galleryImages ?? null), [project?.galleryImages]);
  const cover = project?.coverImageUrl || gallery[0] || null;
  const additionalImages = cover && gallery[0] === cover ? gallery.slice(1) : gallery;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f2ed] px-6 py-20 text-[#151515] lg:px-10">
        <div className="mx-auto max-w-7xl text-sm text-black/45">Proje yükleniyor...</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f4f2ed] px-6 py-20 text-[#151515] lg:px-10">
        <div className="mx-auto max-w-5xl">
          <Link href="/projeler" className="text-xs uppercase tracking-[0.2em] text-black/45">← Referans Projeler</Link>
          <div className="mt-14 border border-black/10 bg-white/40 p-8">
            <h1 className="text-3xl font-medium">Proje bulunamadı.</h1>
            <p className="mt-4 text-black/55">{error || "Bu proje yayından kaldırılmış veya mevcut değil."}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#151515]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
          <Link href="/" className="text-lg font-semibold tracking-[0.2em]">ERKANOĞLU</Link>
          <Link href="/proje-talebi" className="rounded-full bg-[#151515] px-5 py-3 text-sm text-white">Projenizi Anlatın →</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-18 lg:px-10 lg:py-28">
        <Link href="/projeler" className="text-xs uppercase tracking-[0.25em] text-black/40">← Referans Projeler</Link>
        <div className="mt-12 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-black/40">
              <span>{categoryLabels[project.category] ?? project.category}</span>
              <span>·</span>
              <span>{project.status === "TAMAMLANDI" ? "Tamamlandı" : "Devam ediyor"}</span>
              <span>·</span>
              <span>{project.projectNo}</span>
            </div>
            <h1 className="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">{project.publicTitle || project.projectNo}</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-black/55">{project.publicSummary || "Proje detayları hazırlanıyor."}</p>
          </div>
          <div className="aspect-[16/10] overflow-hidden bg-black/5">
            {cover ? <img src={cover} alt={project.publicTitle || project.projectNo} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/25">Görsel hazırlanıyor</div>}
          </div>
        </div>
      </section>

      {additionalImages.length > 0 && (
        <section className="border-y border-black/10 bg-[#181818] text-white">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <div className="mb-10 text-xs uppercase tracking-[0.25em] text-white/35">Proje Galerisi</div>
            <div className="grid gap-5 md:grid-cols-2">
              {additionalImages.map((image, index) => (
                <figure key={`${image}-${index}`} className="overflow-hidden bg-white/5">
                  <img src={image} alt={`${project.publicTitle || project.projectNo} — ${index + 2}`} className="block aspect-[16/10] h-full w-full object-cover" loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#dedbd3]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <span className="text-xs uppercase tracking-[0.3em] text-black/40">Bir sonraki proje</span>
          <h2 className="mt-6 max-w-4xl text-4xl font-medium tracking-[-0.045em] md:text-6xl">Sizin projeniz için de birlikte çalışalım.</h2>
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
