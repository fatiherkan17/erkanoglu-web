"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = [
  ["KENTSEL_DONUSUM", "Kentsel Dönüşüm"],
  ["TADILAT_RENOVASYON", "Tadilat / Renovasyon"],
  ["KONUT", "Konut"],
  ["VILLA", "Villa"],
  ["TICARI", "Ticari Yapı"],
  ["KARMA", "Karma Kullanım"],
  ["ENDUSTRIYEL", "Endüstriyel"],
  ["MEVCUT_YAPI", "Mevcut Yapı"],
] as const;

export default function NewReferenceProjectPage() {
  const router = useRouter();
  const [projectNo, setProjectNo] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("KENTSEL_DONUSUM");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("TAMAMLANDI");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectNo: projectNo.trim(),
          name: name.trim(),
          category,
          status,
          publicTitle: name.trim(),
          publicSummary: summary.trim(),
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || "Referans proje oluşturulamadı.");
      }

      const id = result?.data?.id;
      if (!id) throw new Error("Proje oluşturuldu ancak proje numarası alınamadı.");
      router.replace(`/admin/projects/${id}/media`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Referans proje oluşturulamadı.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-6 py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/projects" className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          ← Referans Projeler
        </Link>

        <header className="mt-10 border-b border-neutral-300 pb-8">
          <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">Yeni Referans</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight">Geçmiş bir işi ekle</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Bu kayıt müşteriden gelen talebe bağlı değildir. Önce işi oluşturacağız, ardından fotoğrafları bu projeye topluca yükleyeceğiz.
          </p>
        </header>

        <form onSubmit={submit} className="mt-8 border border-neutral-300 bg-[#faf9f6] p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Proje Kodu" value={projectNo} onChange={setProjectNo} placeholder="Örn. REF-001" />
            <Field label="Proje Adı" value={name} onChange={setName} placeholder="Örn. Çanakkale Kentsel Dönüşüm Projesi" />

            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Kategori</label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full border border-neutral-400 bg-transparent px-4 py-3 text-sm outline-none">
                {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Durum</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full border border-neutral-400 bg-transparent px-4 py-3 text-sm outline-none">
                <option value="TAMAMLANDI">Tamamlandı</option>
                <option value="AKTIF">Devam ediyor</option>
                <option value="BEKLEMEDE">Beklemede</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Kısa Açıklama</label>
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={5} placeholder="İşin kapsamı, sizin rolünüz ve kısa proje özeti" className="mt-2 w-full resize-y border border-neutral-400 bg-transparent px-4 py-3 text-sm outline-none" />
          </div>

          {error && <p className="mt-5 text-xs text-red-700">{error}</p>}

          <div className="mt-7 flex items-center justify-between gap-4 border-t border-neutral-200 pt-6">
            <p className="text-xs text-neutral-500">Kaydettikten sonra doğrudan fotoğraf yükleme ekranına geçeceksiniz.</p>
            <button type="submit" disabled={saving} className="rounded-full bg-black px-6 py-3 text-sm text-white disabled:opacity-50">
              {saving ? "Oluşturuluyor..." : "Projeyi Oluştur →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">{label}</label>
      <input required value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full border border-neutral-400 bg-transparent px-4 py-3 text-sm outline-none" />
    </div>
  );
}
