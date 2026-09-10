"use client";
import { useEffect, useState } from "react";

type SketchFile = { name: string; type: string; size: number; previewUrl: string; dataUrl?: string };
const MAX_SIZE = 12 * 1024 * 1024;
const MAX_EDGE = 1800;

async function compressImage(file: File): Promise<string> {
  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Kroki görüntüsü okunamadı."));
    img.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, MAX_EDGE / Math.max(source.naturalWidth, source.naturalHeight));
  const width = Math.max(1, Math.round(source.naturalWidth * scale));
  const height = Math.max(1, Math.round(source.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Görüntü hazırlanamıyor.");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

export default function ApplicationSketchInput({ value, onChange }: { value: SketchFile | null; onChange: (file: SketchFile | null) => void }) {
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (value?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(value.previewUrl);
  }, [value]);

  function handleFile(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("PDF, JPG, PNG veya WEBP yükleyebilirsin."); return; }
    if (file.size > MAX_SIZE) { setError("Dosya 12 MB'dan küçük olmalı."); return; }
    if (value?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(value.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) {
      compressImage(file).then((dataUrl) => onChange({ name: file.name, type: file.type, size: file.size, previewUrl, dataUrl })).catch((e) => setError(e instanceof Error ? e.message : "Görüntü hazırlanamadı."));
    } else {
      onChange({ name: file.name, type: file.type, size: file.size, previewUrl });
    }
  }

  return (
    <div className="mt-5 border border-black/10 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-[9px] font-semibold tracking-[0.16em] text-black/40">APLIKASYON KROKİSİ</p><p className="mt-1 text-sm leading-6 text-black/65">Parsel sınırını ve mevcut ölçüleri gösteren krokiyi yükle.</p></div>
        <label className="inline-flex cursor-pointer items-center justify-center border border-black bg-black px-4 py-3 text-[10px] font-semibold tracking-[0.12em] text-white">KROKİ YÜKLE<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])}/></label>
      </div>
      {value ? <div className="mt-5 overflow-hidden border border-black/10 bg-[#f8f7f2]">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm">{value.name}</p><p className="mt-1 text-[10px] text-black/40">{(value.size / 1024 / 1024).toFixed(1)} MB</p></div><button type="button" onClick={() => onChange(null)} className="shrink-0 text-[10px] font-semibold tracking-[0.1em] text-black/45">KALDIR</button></div>
        {value.type === "application/pdf" ? <iframe src={value.previewUrl} title={value.name} className="h-[420px] w-full bg-white" /> : <img src={value.previewUrl} alt="Aplikasyon krokisi önizleme" className="max-h-[420px] w-full object-contain bg-white p-4" />}
      </div> : <label className="mt-4 flex min-h-[150px] cursor-pointer items-center justify-center border border-dashed border-black/20 bg-[#f8f7f2] px-6 text-center text-sm leading-6 text-black/45">Dosyayı buraya bırak veya seç.<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])}/></label>}
      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
      <p className="mt-3 text-[10px] leading-5 text-black/35">Görsel krokiler AI tasarımına gönderilecek şekilde küçültülür; PDF bu aşamada yalnızca görüntülenir.</p>
    </div>
  );
}
