"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

type ArchiveItem = { title: string; url: string; category?: string };
type PublicProject = {
  id: number;
  projectNo: string;
  category: string;
  publicTitle: string | null;
  publicSummary: string | null;
  coverImageUrl: string | null;
  galleryImages: string | null;
  applicationProjects: string | null;
  workmanshipArchive: string | null;
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

function parseJsonArray(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseGallery(value: string | null) {
  return parseJsonArray(value).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

function parseArchive(value: string | null): ArchiveItem[] {
  return parseJsonArray(value)
    .filter(
      (item): item is ArchiveItem =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof (item as Record<string, unknown>).title === "string" &&
            typeof (item as Record<string, unknown>).url === "string",
        ),
    )
    .map((item) => ({
      title: item.title,
      url: item.url,
      category: item.category,
    }));
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
      .then(setProject)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : "Proje alınamadı."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const gallery = useMemo(() => parseGallery(project?.galleryImages ?? null), [project?.galleryImages]);
  const applications = useMemo(() => parseArchive(project?.applicationProjects ?? null), [project?.applicationProjects]);
  const workmanship = useMemo(() => parseArchive(project?.workmanshipArchive ?? null), [project?.workmanshipArchive]);
  const cover = project?.coverImageUrl || gallery[0] || null;
  const galleryImages = gallery.filter((image) => image !== cover);

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
          <Link href="/projeler" className="text-xs uppercase tracking-[0.2em] text-black/45">
            ← Referans Projeler
          </Link>
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

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <Link href="/projeler" className="text-xs uppercase tracking-[0.25em] text-black/40">← Referans Projeler</Link>
        <div className="mt-12 grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-black/40">
              <span>{categoryLabels[project.category] ?? project.category}</span>
              <span>·</span>
              <span>{project.projectNo}</span>
            </div>
            <h1 className="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">{project.publicTitle || project.projectNo}</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-black/55">{project.publicSummary || "Proje özeti hazırlanıyor."}</p>
          </div>
          <div className="aspect-[16/10] overflow-hidden bg-black/5">
            {cover ? <img src={cover} alt={project.publicTitle || project.projectNo} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/25">Kapak görseli yok</div>}
          </div>
        </div>
      </section>

      {galleryImages.length > 0 && (
        <PhotoRail title="Proje Fotoğrafları" items={galleryImages} dark />
      )}

      {(applications.length > 0 || workmanship.length > 0) && (
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="space-y-12">
            {applications.length > 0 && (
              <PhotoArchive title="Uygulama Fotoğrafları" subtitle="Yapının uygulamadaki gerçek görünümü." items={applications} />
            )}
            {workmanship.length > 0 && (
              <PhotoArchive title="İnşai Faaliyetler" subtitle="Şantiyede gerçekleştirilen imalatlardan seçmeler." items={workmanship} dark />
            )}
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
          <span className="tracking-[0.2em] text-white">ERKANOĞLU</span>
          <span>Mimarlık · Mühendislik · Yapı</span>
          <span>Çanakkale · Türkiye</span>
        </div>
      </footer>
    </main>
  );
}

function PhotoRail({ title, items, dark = false }: { title: string; items: string[]; dark?: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    railRef.current?.scrollBy({ left: direction === "right" ? 520 : -520, behavior: "smooth" });
  };

  return (
    <section className={`${dark ? "border-y border-black/10 bg-[#181818] text-white" : "border-y border-black/10"}`}>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div><div className={`text-xs uppercase tracking-[0.25em] ${dark ? "text-white/35" : "text-black/40"}`}>{title}</div><p className={`mt-3 max-w-2xl text-sm leading-7 ${dark ? "text-white/45" : "text-black/50"}`}>Fotoğrafları yatay olarak kaydırabilirsiniz.</p></div>
          <div className="hidden gap-2 sm:flex"><button type="button" onClick={() => scroll("left")} className={`h-10 w-10 rounded-full border ${dark ? "border-white/20 text-white" : "border-black/15 text-black"}`}>←</button><button type="button" onClick={() => scroll("right")} className={`h-10 w-10 rounded-full border ${dark ? "border-white/20 text-white" : "border-black/15 text-black"}`}>→</button></div>
        </div>
        <div ref={railRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {items.map((image, index) => <figure key={`${image}-${index}`} className="min-w-[82%] snap-start overflow-hidden bg-white/5 sm:min-w-[62%] lg:min-w-[48%]"><img src={image} alt={`${title} ${index + 1}`} className="block aspect-[16/10] h-full w-full object-cover" loading="lazy" /></figure>)}
        </div>
      </div>
    </section>
  );
}

function PhotoArchive({ title, subtitle, items, dark = false }: { title: string; subtitle: string; items: ArchiveItem[]; dark?: boolean }) {
  const images = items.filter((item) => item.url.trim());
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    railRef.current?.scrollBy({ left: direction === "right" ? 480 : -480, behavior: "smooth" });
  };

  return (
    <section className={`border p-7 lg:p-9 ${dark ? "border-black/10 bg-[#181818] text-white" : "border-black/10 bg-white/30"}`}>
      <div className="flex items-end justify-between gap-6">
        <div><span className={`text-[10px] uppercase tracking-[0.25em] ${dark ? "text-white/35" : "text-black/40"}`}>{title}</span><h2 className="mt-4 text-3xl font-medium tracking-[-0.04em]">{title}</h2><p className={`mt-3 text-sm leading-7 ${dark ? "text-white/45" : "text-black/50"}`}>{subtitle}</p></div>
        <div className="hidden gap-2 sm:flex"><button type="button" onClick={() => scroll("left")} className={`h-10 w-10 rounded-full border ${dark ? "border-white/20 text-white" : "border-black/15 text-black"}`}>←</button><button type="button" onClick={() => scroll("right")} className={`h-10 w-10 rounded-full border ${dark ? "border-white/20 text-white" : "border-black/15 text-black"}`}>→</button></div>
      </div>
      <div ref={railRef} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
        {images.map((item, index) => (
          <figure key={`${item.url}-${index}`} className="min-w-[78%] snap-start overflow-hidden sm:min-w-[54%] lg:min-w-[38%]">
            <img src={item.url} alt={item.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <figcaption className={`mt-3 text-xs leading-5 ${dark ? "text-white/55" : "text-black/55"}`}>{item.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
