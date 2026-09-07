"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Media = {
  id: number;
  url: string;
  originalName: string;
  placement: string;
  sortOrder: number;
};

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
  ENDUSTRIYEL: "Endüstriyel Yapı",
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
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const photos = useMemo(
    () => [...(project?.media ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [project],
  );

  useEffect(() => {
    if (!galleryOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGalleryOpen(false);
      if (event.key === "ArrowRight" && photos.length > 0) setActiveIndex((index) => (index + 1) % photos.length);
      if (event.key === "ArrowLeft" && photos.length > 0) setActiveIndex((index) => (index - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [galleryOpen, photos.length]);

  if (loading) return <main className="min-h-screen bg-[#f4f2ed] px-6 py-20 text-sm text-black/45">Proje yükleniyor...</main>;

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f4f2ed] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/projeler" className="text-xs uppercase tracking-[0.2em] text-black/45">← Referans Projeler</Link>
          <p className="mt-14 text-sm text-red-700">{error || "Proje bulunamadı."}</p>
        </div>
      </main>
    );
  }

  const cover = photos[0]?.url || null;

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#151515]">
      <header className="border-b border-black/10 bg-[#f4f2ed]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="text-lg font-semibold tracking-[0.2em]">ERKANOĞLU</Link>
          <div className="flex items-center gap-3">
            <Link href="/projeler" className="hidden rounded-full border border-black/15 px-5 py-3 text-sm sm:inline-flex">← Referans İşler</Link>
            <Link href="/proje-talebi" className="rounded-full bg-[#151515] px-5 py-3 text-sm text-white">Projenizi Anlatın →</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-20">
        <Link href="/projeler" className="text-xs uppercase tracking-[0.25em] text-black/40">← Referans Projeler</Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-16">
          <div>
            <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-black/40">
              <span>{categoryLabels[project.category] ?? project.category}</span>
              <span>·</span>
              <span>{project.projectNo}</span>
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">{project.publicTitle || project.projectNo}</h1>
            {project.publicSummary && <p className="mt-8 max-w-xl text-lg leading-8 text-black/55">{project.publicSummary}</p>}
            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => { setActiveIndex(0); setGalleryOpen(true); }}
                className="mt-9 inline-flex rounded-full bg-[#151515] px-6 py-4 text-sm text-white transition hover:opacity-85"
              >
                Tüm fotoğrafları gör · {photos.length} fotoğraf →
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (photos.length === 0) return;
              setActiveIndex(0);
              setGalleryOpen(true);
            }}
            disabled={photos.length === 0}
            className="group relative aspect-[16/10] overflow-hidden bg-black/5 text-left disabled:cursor-default"
            aria-label="Projenin tüm fotoğraflarını aç"
          >
            {cover ? (
              <>
                <img src={cover} alt={project.publicTitle || project.projectNo} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 via-black/25 to-transparent px-6 pb-5 pt-16 text-sm text-white">
                  <span>Proje fotoğrafları</span>
                  <span>Görüntüle →</span>
                </span>
              </>
            ) : (
              <span className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/25">Görsel yok</span>
            )}
          </button>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#181818] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-8 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/35">Proje arşivi</p>
            <p className="mt-2 text-sm text-white/55">Bu işe ait tüm fotoğraflar tek galeride.</p>
          </div>
          {photos.length > 0 && <button type="button" onClick={() => { setActiveIndex(0); setGalleryOpen(true); }} className="rounded-full border border-white/20 px-5 py-3 text-sm">Galeriyi Aç →</button>}
        </div>
      </section>

      <section className="bg-[#151515] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <span className="text-xs uppercase tracking-[0.3em] text-white/35">Bir sonraki iş</span>
          <h2 className="mt-6 max-w-4xl text-4xl font-medium tracking-[-0.045em] md:text-6xl">Projenizi birlikte değerlendirelim.</h2>
          <Link href="/proje-talebi" className="mt-10 inline-flex rounded-full bg-white px-7 py-4 text-sm text-black">Projenizi Konuşalım →</Link>
        </div>
      </section>

      <footer className="bg-[#151515] text-white/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-6 py-8 text-sm md:flex-row md:justify-between lg:px-10">
          <span className="tracking-[0.2em] text-white">ERKANOĞLU</span>
          <span>Mimarlık · Mühendislik · Yapı</span>
          <span>Çanakkale · Türkiye</span>
        </div>
      </footer>

      {galleryOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 text-white">
          <div className="flex h-full flex-col p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">{project.publicTitle || project.projectNo}</p>
                <p className="mt-1 text-sm text-white/60">{activeIndex + 1} / {photos.length}</p>
              </div>
              <button type="button" onClick={() => setGalleryOpen(false)} className="rounded-full border border-white/20 px-4 py-2 text-sm">Kapat ✕</button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center py-5">
              <img src={photos[activeIndex].url} alt={photos[activeIndex].originalName || `${project.publicTitle || project.projectNo} fotoğrafı`} className="max-h-full max-w-full object-contain" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => setActiveIndex((index) => (index - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 px-4 py-3 text-lg sm:left-5" aria-label="Önceki fotoğraf">←</button>
                  <button type="button" onClick={() => setActiveIndex((index) => (index + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 px-4 py-3 text-lg sm:right-5" aria-label="Sonraki fotoğraf">→</button>
                </>
              )}
            </div>

            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-3 pb-2">
                {photos.map((photo, index) => (
                  <button key={photo.id} type="button" onClick={() => setActiveIndex(index)} className={`h-20 w-28 overflow-hidden border-2 ${index === activeIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`} aria-label={`${index + 1}. fotoğraf`}>
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
