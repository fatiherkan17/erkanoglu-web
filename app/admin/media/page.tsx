"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: number;
  projectNo: string;
  name: string | null;
  publicTitle: string | null;
  category: string;
  status: string;
  published: boolean;
  projectRequest?: { fullName?: string } | null;
};

export default function MediaHubPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Projeler alınamadı.");
        setProjects(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Projeler alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">← Yönetim</Link>
        <div className="mt-8 border-b border-neutral-300 pb-7">
          <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">Medya Havuzu</p>
          <h1 className="mt-3 text-3xl font-light tracking-tight">Proje fotoğrafları</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Önce projeyi seç. Fotoğrafları topluca yükle; daha sonra Kapak, Galeri, Uygulama veya İmalat olarak yerleştir.</p>
        </div>

        {error && <p className="mt-6 text-xs text-red-700">{error}</p>}
        {loading ? (
          <div className="mt-7 border border-neutral-300 bg-[#faf9f6] p-8 text-sm text-neutral-500">Projeler yükleniyor...</div>
        ) : projects.length === 0 ? (
          <div className="mt-7 border border-neutral-300 bg-[#faf9f6] p-8 text-sm text-neutral-500">Henüz proje bulunmuyor.</div>
        ) : (
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/admin/projects/${project.id}/media`} className="group border border-neutral-300 bg-[#faf9f6] p-6 transition hover:border-neutral-700">
                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">{project.projectNo}</p>
                <h2 className="mt-3 text-xl font-light">{project.publicTitle || project.name || project.projectRequest?.fullName || "İsimsiz proje"}</h2>
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                  <span>{project.category}</span>
                  <span className="group-hover:text-neutral-900">Fotoğrafları aç →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
