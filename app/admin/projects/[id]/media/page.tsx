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
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);

  async function loadMedia() {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/media`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Medya alınamadı.");
      setMedia(result.data.media || []);
      setProjectName(result.data.project?.publicTitle || result.data.project?.name || "Proje");
      setOrderDirty(false);
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

  function changePhotoNumber(id: number, value: string) {
    const number = Number(value);
    setMedia((items) =>
      items.map((item) => (item.id === id ? { ...item, sortOrder: Number.isInteger(number) && number > 0 ? number - 1 : -1 } : item)),
    );
    setOrderDirty(true);
    setError("");
  }

  async function saveManualOrder() {
    const invalid = media.some((item) => !Number.isInteger(item.sortOrder) || item.sortOrder < 0);
    if (invalid) {
      setError("Her fotoğrafa 1 veya daha büyük bir sıra numarası vermelisin.");
      return;
    }

    const numbers = media.map((item) => item.sortOrder + 1);
    if (new Set(numbers).size !== numbers.length) {
      setError("Aynı sıra numarasını iki fotoğrafa veremezsin.");
      return;
    }

    try {
      setSavingOrder(true);
      setError("");
      const ordered = [...media].sort((a, b) => a.sortOrder - b.sortOrder);
      const response = await fetch(`/api/projects/${projectId}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: ordered.map((item) => item.id) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Sıralama kaydedilemedi.");
      setMedia(result.data);
      setOrderDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sıralama kaydedilemedi.");
      await loadMedia();
    } finally {
      setSavingOrder(false);
    }
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
              <p className="mt-2 text-sm text-neutral-500">Fotoğrafları yükle ve her fotoğrafa istediğin sıra numarasını ver.</p>
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
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Fotoğraf Sıralaması</p><p className="mt-1 text-xs text-neutral-400">Numarayı kendin belirle. 1 en başta, 2 ikinci sırada olacak.</p></div>
              <button type="button" onClick={() => void saveManualOrder()} disabled={!orderDirty || savingOrder || uploading || Boolean(deletingId)} className="rounded-full bg-[#151515] px-5 py-3 text-sm text-white disabled:opacity-40">
                {savingOrder ? "Sıra kaydediliyor..." : "Sıralamayı Kaydet →"}
              </button>
            </div>

            {loading ? <div className="border border-neutral-300 bg-[#faf9f6] p-8 text-sm text-neutral-500">Fotoğraflar yükleniyor...</div> : media.length === 0 ? <div className="border border-neutral-300 bg-[#faf9f6] p-8 text-sm text-neutral-500">Henüz fotoğraf yüklenmedi.</div> : <div className="space-y-4">{media.map((item) => {
              const displayNumber = item.sortOrder >= 0 ? item.sortOrder + 1 : "";
              return <article key={item.id} className="grid grid-cols-[72px_150px_1fr] items-center gap-4 border border-neutral-300 bg-[#faf9f6] p-3">
                <label className="flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.15em] text-neutral-400">
                  Sıra
                  <input type="number" min={1} value={displayNumber} onChange={(event) => changePhotoNumber(item.id, event.target.value)} disabled={Boolean(deletingId) || uploading} className="w-16 border border-neutral-400 bg-white px-2 py-2 text-center text-sm text-neutral-900 outline-none" />
                </label>
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100"><img src={item.url} alt={item.originalName} className="h-full w-full object-cover" loading="lazy"/></div>
                <div className="min-w-0"><p className="truncate text-sm" title={item.originalName}>{item.originalName}</p><p className="mt-1 text-[10px] text-neutral-400">{formatSize(item.size)}</p><div className="mt-3 flex flex-wrap items-center gap-2"><select value={item.placement} onChange={(event) => void changePlacement(item.id, event.target.value as Media["placement"])} disabled={Boolean(deletingId)} className="border border-neutral-400 bg-transparent px-3 py-2 text-xs"><option value="PROJE">Proje Fotoğrafı</option><option value="INSAI">İnşai Faaliyet</option></select><button type="button" onClick={() => void deleteMedia(item)} disabled={Boolean(deletingId) || uploading} className="border border-red-300 px-3 py-2 text-xs text-red-700 disabled:opacity-50">{deletingId === item.id ? "Siliniyor..." : "Sil"}</button></div></div>
              </article>;
            })}</div>}
          </section>

          <aside className="h-fit border border-neutral-300 bg-[#faf9f6] p-6">
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Nasıl kullanacaksın?</p>
            <div className="mt-5 space-y-5 text-sm leading-6 text-neutral-600"><div><strong className="text-neutral-900">01</strong> · Fotoğrafları yükle.</div><div><strong className="text-neutral-900">02</strong> · Her fotoğrafa istediğin numarayı ver.</div><div><strong className="text-neutral-900">03</strong> · Örneğin yıkım <b>1</b>, temel <b>2</b>, donatı <b>3</b>, kalıp <b>4</b>, beton <b>5</b> şeklinde.</div><div><strong className="text-neutral-900">04</strong> · <b>Sıralamayı Kaydet</b> dediğinde site bu sırayı kullanır.</div></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
