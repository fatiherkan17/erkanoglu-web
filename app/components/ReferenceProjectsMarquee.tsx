"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PublicMedia = {
  id: number;
  url: string;
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

export default function ReferenceProjectsMarquee() {
  const [projects, setProjects] = useState<PublicProject[]>([]);

  useEffect(() => {
    fetch("/api/public-projects", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setProjects(result?.data ?? []))
      .catch(() => setProjects([]));
  }, []);

  if (projects.length === 0) {
    return null;
  }

  const loopProjects = [...projects, ...projects];

  return (
    <section id="referans-projeler" className="overflow-hidden border-b border-black/10 bg-[#f4f2ed]">
      <div className="mx-auto max-w-[1500px] px-6 py-7 lg:px-10 lg:py-9">
        <div className="mb-5 flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-black/40">
              Referans Projeler
            </p>
            <h2 className="mt-1 max-w-xl text-xl font-medium leading-none tracking-[-0.03em] md:text-2xl">
              Seçili işler. <span className="text-black/30">Fikirden uygulamaya.</span>
            </h2>
          </div>

          <Link
            href="/projeler"
            className="hidden shrink-0 border-b border-black/30 pb-2 text-xs font-medium uppercase tracking-[0.16em] transition hover:border-black md:block"
          >
            Tüm projeler →
          </Link>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f4f2ed] to-transparent lg:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f4f2ed] to-transparent lg:w-28" />

          <div className="reference-marquee group">
            <div className="reference-track">
              {loopProjects.map((project, index) => {
                const ordered = [...(project.media || [])].sort(
                  (a, b) => a.sortOrder - b.sortOrder,
                );
                const image =
                  ordered.find((item) => item.placement === "PROJE") || ordered[0];

                return (
                  <Link
                    key={`${project.id}-${index}`}
                    href={`/projeler/${project.id}`}
                    className="reference-card group/card"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#dedbd3]">
                      {image ? (
                        <img
                          src={image.url}
                          alt={project.publicTitle || `${project.projectNo} projesi`}
                          className="h-full w-full object-cover transition duration-700 group-hover/card:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-black/30">
                          Görsel hazırlanıyor
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/65">
                          {categoryLabels[project.category] ?? project.category}
                        </span>
                        <span className="text-xl">↗</span>
                      </div>
                    </div>

                    <div className="border-x border-b border-black/10 bg-white/50 px-3 py-2">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-black/35">
                        {project.projectNo}
                      </p>
                      <h3 className="mt-1 text-sm font-medium tracking-[-0.015em]">
                        {project.publicTitle || project.projectNo}
                      </h3>
                      {project.publicSummary && (
                        <p className="hidden">
                          {project.publicSummary}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <Link
          href="/projeler"
          className="mt-4 inline-flex border-b border-black/30 pb-2 text-xs font-medium uppercase tracking-[0.16em] md:hidden"
        >
          Tüm projeler →
        </Link>
      </div>

      <style jsx>{`
        .reference-marquee {
          overflow: hidden;
        }

        .reference-track {
          display: flex;
          width: max-content;
          gap: 10px;
          animation: reference-scroll 42s linear infinite;
        }

        .reference-marquee:hover .reference-track {
          animation-play-state: paused;
        }

        .reference-card {
          width: min(58vw, 220px);
          flex: 0 0 auto;
        }

        @media (min-width: 768px) {
          .reference-card {
            width: min(17vw, 250px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reference-track {
            animation: none;
          }
        }

        @keyframes reference-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 8px));
          }
        }
      `}</style>
    </section>
  );
}
