"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ParcelData = Record<string, string>;
type Draft = {
  summary?: string;
  feasibility?: string;
  calculations?: { theoreticalEmsalAreaM2: number | null; theoreticalTaksFootprintM2: number | null; notes: string[] };
  program?: { name: string; count: number | null; areaM2: number | null }[];
  layoutAlternatives?: { title: string; description: string }[];
  risks?: string[];
  professionalChecks?: string[];
  clientDeliverable?: string[];
};

type RequestData = {
  id: number;
  fullName: string;
  buildingType: string;
  projectStage: string;
  approximateArea: string | null;
  interestAreas: string;
  description: string | null;
  parcelData: ParcelData | null;
  aiDraft: Draft | null;
};

const fields: [keyof ParcelData, string, string][] = [
  ["parcelAreaM2", "Parsel Alanı (m²)", "Örn. 600"],
  ["emsal", "Emsal (KAKS)", "Örn. 1.50"],
  ["taks", "TAKS", "Örn. 0.30"],
  ["kaks", "KAKS / Emsal (tekrar)", "İsteğe bağlı"],
  ["floors", "Kat Adedi", "Örn. 4"],
  ["frontageM", "Parsel Cephesi (m)", "Örn. 20"],
  ["depthM", "Parsel Derinliği (m)", "Örn. 30"],
  ["buildingSetbackFrontM", "Ön Bahçe Çekme (m)", "İsteğe bağlı"],
  ["buildingSetbackSideM", "Yan Bahçe Çekme (m)", "İsteğe bağlı"],
  ["buildingSetbackRearM", "Arka Bahçe Çekme (m)", "İsteğe bağlı"],
  ["roadWidthM", "Yol Genişliği (m)", "İsteğe bağlı"],
  ["zoningPlan", "İmar / Plan Notları", "Varsa temel notları yaz"],
  ["notes", "Diğer Bilgiler", "Otopark, kot, cephe, özel istek vb."],
];

export default function AiOnProjePage() {
  const params = useParams();
  const id = params.id as string;
  const [request, setRequest] = useState<RequestData | null>(null);
  const [parcel, setParcel] = useState<ParcelData>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/project-requests/${id}/ai`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || "Bilgiler alınamadı.");
        setRequest(data.data);
        setParcel(data.data.parcelData || {});
        setDraft(data.data.aiDraft || null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Bilgiler alınamadı."))
      .finally(() => setLoading(false));
  }, [id]);

  function setField(key: string, value: string) {
    setParcel((current) => ({ ...current, [key]: value }));
  }

  async function saveParcel() {
    setSaving(true); setMessage(""); setError("");
    try {
      const response = await fetch(`/api/project-requests/${id}/ai`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parcelData: parcel }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Parsel bilgileri kaydedilemedi.");
      setParcel(data.data.parcelData || {});
      setMessage("Parsel bilgileri kaydedildi.");
    } catch (e) { setError(e instanceof Error ? e.message : "Parsel bilgileri kaydedilemedi."); }
    finally { setSaving(false); }
  }

  async function generate() {
    setGenerating(true); setMessage(""); setError("");
    try {
      const response = await fetch(`/api/project-requests/${id}/ai`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parcelData: parcel }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "AI ön proje üretilemedi.");
      setDraft(data.data.aiDraft || null);
      setParcel(data.data.parcelData || parcel);
      setMessage("AI ön proje taslağı oluşturuldu. Müşteriye vermeden önce mutlaka mimar/mühendis kontrolünden geçirin.");
    } catch (e) { setError(e instanceof Error ? e.message : "AI ön proje üretilemedi."); }
    finally { setGenerating(false); }
  }

  if (loading) return <main className="min-h-screen bg-[#f3f0e9] p-10"><p className="text-sm text-black/50">Yükleniyor...</p></main>;
  if (!request) return <main className="min-h-screen bg-[#f3f0e9] p-10"><p className="text-sm text-red-700">{error || "Talep bulunamadı."}</p></main>;

  return (
    <main className="min-h-screen bg-[#f3f0e9] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div><Link href={`/admin/project-requests/${id}`} className="text-[10px] font-semibold tracking-[0.18em] text-black/45 hover:text-black">← TALEBE DÖN</Link><p className="mt-6 text-[9px] font-semibold tracking-[0.2em] text-black/35">ERKANOĞLU İÇ KULLANIM</p><h1 className="mt-2 text-4xl font-light tracking-[-0.04em]">AI Ön Proje</h1><p className="mt-3 text-sm text-black/50">{request.fullName} · {request.buildingType}</p></div>
          <div className="border border-black/10 bg-white/30 px-5 py-4 text-right"><p className="text-[9px] font-semibold tracking-[0.18em] text-black/35">TALEP</p><p className="mt-1 text-xl">#{request.id}</p></div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="border border-black/10 bg-white/30 p-6 md:p-8">
            <div><p className="text-[9px] font-semibold tracking-[0.18em] text-black/35">1 · PARSEL VERİSİ</p><h2 className="mt-2 text-2xl font-light">Bildigimiz gerçek verileri gir.</h2><p className="mt-3 text-sm leading-6 text-black/50">AI yalnızca verdiğiniz verilerden ön çalışma çıkarır. Resmî imar durumunun yerini tutmaz.</p></div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {fields.map(([key, label, placeholder]) => <div key={key} className={key === "zoningPlan" || key === "notes" ? "sm:col-span-2" : ""}><label className="mb-2 block text-[10px] font-semibold tracking-[0.12em] text-black/45">{label}</label>{key === "zoningPlan" || key === "notes" ? <textarea value={parcel[key] || ""} onChange={(e) => setField(key, e.target.value)} rows={3} placeholder={placeholder} className="w-full resize-none border border-black/15 bg-[#faf8f3] px-4 py-3 text-sm outline-none focus:border-black" /> : <input value={parcel[key] || ""} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder} className="w-full border border-black/15 bg-[#faf8f3] px-4 py-3 text-sm outline-none focus:border-black" />}</div>)}
            </div>
            <div className="mt-7 flex flex-wrap gap-3"><button onClick={saveParcel} disabled={saving || generating} className="border border-black bg-white px-5 py-3 text-[10px] font-semibold tracking-[0.14em] disabled:opacity-40">{saving ? "KAYDEDİLİYOR..." : "PARSELİ KAYDET"}</button><button onClick={generate} disabled={saving || generating} className="bg-black px-6 py-3 text-[10px] font-semibold tracking-[0.14em] text-white disabled:opacity-40">{generating ? "AI ÇALIŞIYOR..." : "AI ÖN PROJE ÜRET →"}</button></div>
            {request.description && <div className="mt-8 border-t border-black/10 pt-6"><p className="text-[9px] font-semibold tracking-[0.18em] text-black/35">MÜŞTERİNİN TALEBİ</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-black/60">{request.description}</p></div>}
          </section>

          <section className="border border-black/10 bg-[#191919] p-6 text-white md:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold tracking-[0.18em] text-white/35">2 · İÇ ÖN ÇALIŞMA</p><h2 className="mt-2 text-2xl font-light">AI taslağı.</h2></div><span className="text-[9px] uppercase tracking-[0.14em] text-white/30">Müşteriye doğrudan gönderilmez</span></div>
            {!draft && <div className="mt-10 border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/45">Henüz taslak üretilmedi. Parsel verilerini kaydedip “AI Ön Proje Üret” butonuna basın.</div>}
            {draft && <div className="mt-8 space-y-8">
              <div><p className="text-[9px] uppercase tracking-[0.18em] text-white/35">SONUÇ</p><p className="mt-3 text-base leading-7 text-white/70">{draft.summary}</p><span className="mt-4 inline-flex border border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-white/60">{draft.feasibility}</span></div>
              {draft.calculations && <div className="border-t border-white/10 pt-6"><p className="text-[9px] uppercase tracking-[0.18em] text-white/35">TEORİK HESAPLAR</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-2xl font-light">{draft.calculations.theoreticalEmsalAreaM2 ?? "—"} m²</p><p className="mt-1 text-[10px] text-white/35">Emsal alanı</p></div><div><p className="text-2xl font-light">{draft.calculations.theoreticalTaksFootprintM2 ?? "—"} m²</p><p className="mt-1 text-[10px] text-white/35">TAKS oturumu</p></div></div>{draft.calculations.notes?.length ? <ul className="mt-4 space-y-2 text-sm text-white/50">{draft.calculations.notes.map((x, i) => <li key={i}>· {x}</li>)}</ul> : null}</div>}
              {draft.program?.length ? <div className="border-t border-white/10 pt-6"><p className="text-[9px] uppercase tracking-[0.18em] text-white/35">ÖNERİLEN PROGRAM</p><div className="mt-4 space-y-3">{draft.program.map((item, i) => <div key={i} className="flex items-center justify-between border-b border-white/10 pb-3 text-sm"><span className="text-white/70">{item.name}</span><span className="text-white/40">{item.count ?? "—"} adet · {item.areaM2 ?? "—"} m²</span></div>)}</div></div> : null}
              {draft.layoutAlternatives?.length ? <div className="border-t border-white/10 pt-6"><p className="text-[9px] uppercase tracking-[0.18em] text-white/35">TASLAK ALTERNATİFLER</p><div className="mt-4 space-y-4">{draft.layoutAlternatives.map((x, i) => <div key={i}><p className="text-sm text-white/75">{x.title}</p><p className="mt-1 text-sm leading-6 text-white/45">{x.description}</p></div>)}</div></div> : null}
              {draft.professionalChecks?.length ? <div className="border-t border-white/10 pt-6"><p className="text-[9px] uppercase tracking-[0.18em] text-white/35">SİZİN KONTROL LİSTENİZ</p><ul className="mt-4 space-y-2 text-sm leading-6 text-white/55">{draft.professionalChecks.map((x, i) => <li key={i}>· {x}</li>)}</ul></div> : null}
              {draft.clientDeliverable?.length ? <div className="border-t border-white/10 pt-6"><p className="text-[9px] uppercase tracking-[0.18em] text-white/35">SATILABİLİR ÇIKTI</p><ul className="mt-4 space-y-2 text-sm leading-6 text-white/55">{draft.clientDeliverable.map((x, i) => <li key={i}>· {x}</li>)}</ul></div> : null}
            </div>}
          </section>
        </div>

        {(message || error) && <div className={`mt-6 border px-5 py-4 text-sm ${error ? "border-red-300 bg-red-50 text-red-800" : "border-black/10 bg-white/40 text-black/65"}`}>{error || message}</div>}
        <div className="mt-8 border border-amber-300/60 bg-amber-50 p-5 text-xs leading-6 text-amber-900">Bu ekran bir tasarım ve ön fizibilite yardımcısıdır. Kesin imar hakkı, ruhsat uygunluğu, mimari proje veya statik proje yerine geçmez. Parsel ve mevzuat verileri uzman tarafından doğrulanmadan müşteriye bağlayıcı çıktı verilmemelidir.</div>
      </div>
    </main>
  );
}
