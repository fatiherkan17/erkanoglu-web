"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Media = { id: number; url: string; originalName: string; placement: string; sortOrder: number };
type Project = { id: number; projectNo: string; name: string | null; publicTitle: string | null; publicSummary: string | null; published: boolean };

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [published, setPublished] = useState(false);
  const [mediaCount, setMediaCount] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        setLoading(true);
        const [projectResponse, mediaResponse] = await Promise.all([
          fetch(`/api/projects/${id}`, { cache: "no-store" }),
          fetch(`/api/projects/${id}/media`, { cache: "no-store" }),
        ]);
        const projectResult = await projectResponse.json();
        const mediaResult = await mediaResponse.json();
        if (!projectResponse.ok) throw new Error(projectResult?.message || "Proje alınamadı.");
        const data = projectResult.data as Project;
        setProject(data);
        setTitle(data.publicTitle || data.name || "");
        setSummary(data.publicSummary || "");
        setPublished(Boolean(data.published));
        setMediaCount(Array.isArray(mediaResult?.data?.media) ? mediaResult.data.media.length : 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Proje alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function save() {
    if (!project || saving) return;
    try {
      setSaving(true);
      setError("");
      const mediaResponse = await fetch(`/api/projects/${project.id}/media`, { cache: "no-store" });
      const mediaResult = await mediaResponse.json();
      if (!mediaResponse.ok) throw new Error(mediaResult?.message || "Fotoğraflar alınamadı.");
      const media = (mediaResult?.data?.media || []) as Media[];
      const ordered = [...media].sort((a, b) => a.sortOrder - b.sortOrder);
      const cover = ordered.find((item) => item.placement === "KAPAK");
      const gallery = ordered.filter((item) => item.placement === "GALERI").map((item) => item.url);
      const applications = ordered.filter((item) => item.placement === "UYGULAMA").map((item) => ({ title: item.originalName, url: item.url }));
      const workmanship = ordered.filter((item) => item.placement === "IMALAT").map((item) => ({ title: item.originalName, url: item.url, category: "İmalat" }));
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          published,
          publicTitle: title.trim() || project.name || project.projectNo,
          publicSummary: summary.trim() || null,
          coverImageUrl: cover?.url || null,
          galleryImages: JSON.stringify(gallery),
          applicationProjects: JSON.stringify(applications),
          workmanshipArchive: JSON.stringify(workmanship),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Proje kaydedilemedi.");
      setProject(result.data as Project);
      setMediaCount(media.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proje kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="min-h-screen bg-[#f7f5f0] px-6 py-16"><div className="mx-auto max-w-4xl text-sm text-neutral-500">Proje yükleniyor...</div></main>;
  if (!project) return <main className="min-h-screen bg-[#f7f5f0] px-6 py-16"><div className="mx-auto max-w-4xl"><Link href="/admin/projects" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">← Referans Projeler</Link><p className="mt-10 text-sm text-red-700">{error || "Proje bulunamadı."}</p></div></main>;

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-14"><div className="mx-auto max-w-4xl">
    <Link href="/admin/projects" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">← Referans Projeler</Link>
    <div className="mt-10 border-b border-neutral-300 pb-8"><p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">Referans Proje</p><h1 className="mt-3 text-4xl font-light tracking-tight">{project.name || project.publicTitle || project.projectNo}</h1><p className="mt-2 text-sm text-neutral-500">{project.projectNo}</p></div>

    <section className="mt-7 border border-neutral-300 bg-[#faf9f6] p-7"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Fotoğraflar</p><h2 className="mt-2 text-2xl font-light">{mediaCount} fotoğraf hazır</h2><p className="mt-2 text-sm text-neutral-500">Yükle, yerini seç ve sırasını belirle.</p></div><Link href={`/admin/projects/${project.id}/media`} className="inline-flex rounded-full bg-black px-5 py-3 text-sm text-white">Fotoğrafları Yönet →</Link></div></section>

    <section className="mt-7 border border-neutral-300 bg-[#faf9f6] p-7"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Yayın</p><h2 className="mt-2 text-2xl font-light">Hazırsa yayına al</h2><p className="mt-2 text-sm text-neutral-500">Sadece başlık, kısa özet ve yayın durumu yeterli.</p></div><label className="flex items-center gap-3 border border-neutral-300 px-4 py-3 text-sm"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4"/><span>{published ? "Yayında" : "Taslak"}</span></label></div>
      <div className="mt-7 space-y-5"><Field label="Başlık" value={title} onChange={setTitle} placeholder="Proje başlığı"/><Field label="Kısa Özet" value={summary} onChange={setSummary} placeholder="İşin kapsamını 2-4 cümlede anlatın." multiline/></div>
      {error && <p className="mt-5 text-xs text-red-700">{error}</p>}
      <div className="mt-7 flex justify-end border-t border-neutral-200 pt-6"><button type="button" onClick={save} disabled={saving} className="rounded-full bg-black px-6 py-3 text-sm text-white disabled:opacity-50">{saving ? "Kaydediliyor..." : "Kaydet ve Yayına Al →"}</button></div>
    </section>
  </div></main>;
}

function Field({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean }) {
  return <div><label className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">{label}</label>{multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={6} className="mt-2 w-full resize-y border border-neutral-400 bg-transparent px-4 py-3 text-sm outline-none" /> : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full border border-neutral-400 bg-transparent px-4 py-3 text-sm outline-none" />}</div>;
}
