"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { upload } from "@vercel/blob/client";

type Media = {
  id: number;
  url: string;
  pathname: string;
  originalName: string;
  contentType: string;
  size: number;
  placement: "PROJE" | "INSAI";
  sortOrder: number;
  createdAt: string;
};

function formatSize(size: number) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectMediaPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id || "";
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [projectName, setProjectName] = useState("Proje");
  const [draggingFile, setDraggingFile] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

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
    void loadMedia();
  }, [projectId]);

  async function uploadFiles(files: FileList | File[]) {
    const items = Array.from(files).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (!items.length) {
      setError("JPG, PNG veya WebP fotoğraf seçmelisin.");
      return;
    }
    setError("");
    setUploading(true);
    for (const file of items) {
      try {
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
    setUploading(false);
    await loadMedia();
  }

  async function changePlacement(id: number, placement: Media["placement"]) {
    const response = await fetch(`/api/projects/${projectId}/media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: id, placement }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message || "Fotoğraf türü güncellenemedi.");
      return;
    }
    setMedia((items) => items.map((item) => (item.id === id ? result.data : item)));
  }

  async function saveOrder(items: Media[]) {
    try {
      setSavingOrder(true);
      const response = await fetch(`/api/projects/${projectId}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: items.map((item) => item.id) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Sıralama kaydedilemedi.");
      setMedia(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sıralama kaydedilemedi.");
      await loadMedia();
    } finally {
      setSavingOrder(false);
    }
  }

  function reorder(draggedId: number, targetId: number) {
    if (draggedId === targetId) return;
    const current = [...media];
    const from = current.findIndex((item) => item.id === draggedId);
    const to = current.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved);
    const normalized = current.map((item, index) => ({ ...item, sortOrder: index }));
    setMedia(normalized);
    void saveOrder(normalized);
  }

  async function deleteMedia(item: Media) {
    if (!window.confirm(`“${item.originalName}” fotoğrafını kalıcı olarak silmek istiyor musun?`)) return;
    try {
      setDeletingId(item.id);
      setError("");
      const response = await fetch(`/api/projects/${projectId}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Fotoğraf silinemedi.");
      setMedia((items) => items.filter((mediaItem) => mediaItem.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fotoğraf silinemedi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href={`/admin/projects/${projectId}`} className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">← Projeye Dön</Link>

        <div className="mt-8 border-b border-neutral-300 pb-7">
          <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">Referans Proje · Fotoğraf Arşivi</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-tight">{projectName}</h1>
              <p className="mt-2 text-sm text-neutral-500">Fotoğrafları yükle, türünü belirle ve sırasını sürükleyerek oluştur.</p>
            </div>
            <div className="text-xs text-neutral-500">{media.length} fotoğraf</div>
          </div>
        </div>

        <section
          className={`mt-7 border-2 border-dashed p-10 text-center transition ${draggingFile ? "border-neutral-800 bg-[#efede8]" : "border-neutral-300 bg-[#faf9f6]"}`}
          onDragOver={(event) => { event.preventDefault(); setDraggingFile(true); }}
          onDragLeave={() => setDraggingFile(false)}
          onDrop={(event) => { event.preventDefault(); setDraggingFile(false); void uploadFiles(event.dataTransfer.files); }}
        >
          <p className="text-lg font-light">Fotoğrafları buraya bırak</p>
          <p className="mt-2 text-sm text-neutral-500">Hepsini bir seferde yükleyebilirsin.</p>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading || savingOrder || Boolean(deletingId)} className="mt-6 rounded-full bg-[#151515] px-6 py-3 text-sm text-white disabled:opacity-50">
            {uploading ? "Fotoğraflar yükleniyor..." : "Fotoğrafları Seç →"}
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files); event.currentTarget.value = ""; }} />
          <p className="mt-4 text-[11px] text-neutral-400">JPG, PNG, WebP · dosya adı değiştirmen gerekmiyor</p>
        </section>

        {error && <p className="mt-5 text-xs text-red-700">{error}</p>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div><p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Sıralı Arşiv</p><p className="mt-1 text-xs text-neutral-400">Kartı sürükleyip başka kartın üzerine bırak.</p></div>
              {savingOrder && <span className="text-xs text-neutral-400">Sıra kaydediliyor...</span>}
            </div>
            {loading ? <div className="border border-neutral-300 bg-[#faf9f6] p-8 text-sm text-neutral-500">Fotoğraflar yükleniyor...</div> : media.length === 0 ? <div className="border border-neutral-300 bg-[#faf9f6] p-8 text-sm text-neutral-500">Henüz fotoğraf yüklenmedi.</div> : <div className="space-y-4">{media.map((item,index) => <article key={item.id} draggable onDragStart={() => setDraggingId(item.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); reorder(draggingId || item.id, item.id); setDraggingId(null); }} className={`grid grid-cols-[56px_150px_1fr] items-center gap-4 border border-neutral-300 bg-[#faf9f6] p-3 ${draggingId === item.id ? "opacity-40" : ""}`}>
                <div className="text-center text-sm text-neutral-400">{String(index + 1).padStart(2, "0")}</div>
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100"><img src={item.url} alt={item.originalName} className="h-full w-full object-cover" loading="lazy"/></div>
                <div className="min-w-0"><p className="truncate text-sm" title={item.originalName}>{item.originalName}</p><p className="mt-1 text-[10px] text-neutral-400">{formatSize(item.size)}</p><div className="mt-3 flex flex-wrap items-center gap-2"><select value={item.placement} onChange={(event) => void changePlacement(item.id, event.target.value as Media["placement"])} disabled={Boolean(deletingId)} className="border border-neutral-400 bg-transparent px-3 py-2 text-xs"><option value="PROJE">Proje Fotoğrafı</option><option value="INSAI">İnşai Faaliyet</option></select><button type="button" onClick={() => void deleteMedia(item)} disabled={Boolean(deletingId) || uploading} className="border border-red-300 px-3 py-2 text-xs text-red-700 disabled:opacity-50">{deletingId === item.id ? "Siliniyor..." : "Sil"}</button></div></div>
              </article>)}</div>}
          </section>

          <aside className="h-fit border border-neutral-300 bg-[#faf9f6] p-6">
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Bu proje için akış</p>
            <div className="mt-5 space-y-5 text-sm leading-6 text-neutral-600"><div><strong className="text-neutral-900">01</strong> · Önce bütün fotoğrafları yükle.</div><div><strong className="text-neutral-900">02</strong> · Yapının genel görüntülerini <b>Proje Fotoğrafı</b> yap.</div><div><strong className="text-neutral-900">03</strong> · Yıkım, temel, betonarme, duvar, çatı ve diğer saha karelerini <b>İnşai Faaliyet</b> yap.</div><div><strong className="text-neutral-900">04</strong> · Üstten alta doğru sürükleyerek istediğin hikâye sırasını oluştur.</div></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
