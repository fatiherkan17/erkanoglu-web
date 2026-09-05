"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

type Media = {
  id: number;
  url: string;
  pathname: string;
  originalName: string;
  contentType: string;
  size: number;
  placement: string;
  sortOrder: number;
  createdAt: string;
};

const placementOptions = [
  ["BEKLEMEDE", "Beklemede"],
  ["KAPAK", "Kapak"],
  ["GALERI", "Galeri"],
  ["UYGULAMA", "Uygulama"],
  ["IMALAT", "İmalat"],
] as const;

function formatSize(size: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectMediaPage() {
  const params = useMemo(() => ({ id: window.location.pathname.split("/").filter(Boolean).at(-2) || "" }), []);
  const projectId = params.id;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [projectName, setProjectName] = useState("Proje");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMedia() {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/media`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Medya alınamadı.");
      setMedia(result.data.media || []);
      setProjectName(result.data.project?.publicTitle || result.data.project?.name || "Proje");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Medya alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, [projectId]);

  async function uploadFiles(files: FileList | File[]) {
    const items = Array.from(files).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (!items.length) {
      setError("JPG, PNG veya WebP fotoğraf seçmelisin.");
      return;
    }

    setError("");
    for (let index = 0; index < items.length; index += 1) {
      const file = items[index];
      try {
        setUploading(index + 1);
        await upload(`projects/${projectId}/media/${file.name}`, file, {
          access: "public",
          handleUploadUrl: `/api/projects/${projectId}/media/upload`,
          clientPayload: JSON.stringify({ originalName: file.name, size: file.size }),
          multipart: file.size > 10 * 1024 * 1024,
        });
      } catch (err) {
        setError(`${file.name}: ${err instanceof Error ? err.message : "yüklenemedi."}`);
      }
    }
    setUploading(0);
    await loadMedia();
  }

  async function updatePlacement(id: number, placement: string) {
    const response = await fetch(`/api/projects/${projectId}/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placement }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Yerleşim güncellenemedi.");
      return;
    }
    setMedia((items) => items.map((item) => (item.id === id ? result.data : item)));
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href={`/admin/projects/${projectId}`} className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          ← Projeye Dön
        </Link>

        <div className="mt-8 border-b border-neutral-300 pb-7">
          <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">Medya Havuzu</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-tight">{projectName}</h1>
              <p className="mt-2 text-sm text-neutral-500">Fotoğrafları topluca yükle. Yerlerini sonra belirle.</p>
            </div>
            <div className="text-xs text-neutral-500">{media.length} fotoğraf</div>
          </div>
        </div>

        <section
          className={`mt-7 border-2 border-dashed p-10 text-center transition ${dragging ? "border-neutral-800 bg-[#efede8]" : "border-neutral-300 bg-[#faf9f6]"}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); void uploadFiles(event.dataTransfer.files); }}
        >
          <p className="text-lg font-light">Fotoğrafları buraya sürükle bırak</p>
          <p className="mt-2 text-sm text-neutral-500">veya bilgisayardan topluca seç</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={Boolean(uploading)}
            className="mt-6 rounded-full bg-[#151515] px-6 py-3 text-sm text-white disabled:opacity-50"
          >
            {uploading ? `${uploading} / seçilen yükleniyor...` : "Fotoğrafları Seç →"}
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files); event.currentTarget.value = ""; }} />
          <p className="mt-4 text-[11px] text-neutral-400">JPG, PNG, WebP · Dosya adı değiştirmek gerekmiyor</p>
        </section>

        {error && <p className="mt-5 text-xs text-red-700">{error}</p>}

        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Arşiv</p>
            <p className="text-[11px] text-neutral-400">Varsayılan: Beklemede</p>
          </div>

          {loading ? (
            <div className="border border-neutral-300 bg-[#faf9f6] p-8 text-sm text-neutral-500">Medya yükleniyor...</div>
          ) : media.length === 0 ? (
            <div className="border border-neutral-300 bg-[#faf9f6] p-8 text-sm text-neutral-500">Henüz fotoğraf yüklenmedi.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <article key={item.id} className="overflow-hidden border border-neutral-300 bg-[#faf9f6]">
                  <div className="aspect-[4/3] bg-neutral-100">
                    <img src={item.url} alt={item.originalName} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="truncate text-xs text-neutral-700" title={item.originalName}>{item.originalName}</p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-neutral-400">{formatSize(item.size)}</span>
                      <select value={item.placement} onChange={(event) => void updatePlacement(item.id, event.target.value)} className="border border-neutral-400 bg-transparent px-3 py-2 text-xs outline-none">
                        {placementOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
