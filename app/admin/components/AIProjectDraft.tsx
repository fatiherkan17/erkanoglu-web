"use client";

import { useEffect, useMemo, useState } from "react";

type ParcelData = {
  parcelAreaM2: string;
  emsal: string;
  taks: string;
  kaks: string;
  floors: string;
  frontageM: string;
  depthM: string;
  buildingSetbackFrontM: string;
  buildingSetbackSideM: string;
  buildingSetbackRearM: string;
  roadWidthM: string;
  zoningPlan: string;
  notes: string;
};

type AIDraft = {
  summary?: string;
  feasibility?: "UYGUN GÖRÜNÜYOR" | "İNCELENMELİ" | "VERİ YETERSİZ" | string;
  calculations?: {
    theoreticalEmsalAreaM2?: number | null;
    theoreticalTaksFootprintM2?: number | null;
    notes?: string[];
  };
  program?: { name: string; count: number | null; areaM2: number | null }[];
  layoutAlternatives?: { title: string; description: string }[];
  risks?: string[];
  professionalChecks?: string[];
  clientDeliverable?: string[];
};

const emptyParcel: ParcelData = {
  parcelAreaM2: "",
  emsal: "",
  taks: "",
  kaks: "",
  floors: "",
  frontageM: "",
  depthM: "",
  buildingSetbackFrontM: "",
  buildingSetbackSideM: "",
  buildingSetbackRearM: "",
  roadWidthM: "",
  zoningPlan: "",
  notes: "",
};

const fieldMeta: { key: keyof ParcelData; label: string; placeholder?: string }[] = [
  { key: "parcelAreaM2", label: "PARSEL ALANI (m²)", placeholder: "Örn. 750" },
  { key: "emsal", label: "EMSAL / KAKS", placeholder: "Örn. 1.20" },
  { key: "taks", label: "TAKS", placeholder: "Örn. 0.30" },
  { key: "kaks", label: "KAKS", placeholder: "Varsa emsal ile aynı" },
  { key: "floors", label: "KAT ADEDİ", placeholder: "Örn. 4" },
  { key: "frontageM", label: "CEPHE (m)", placeholder: "Örn. 20" },
  { key: "depthM", label: "DERİNLİK (m)", placeholder: "Örn. 30" },
  { key: "buildingSetbackFrontM", label: "ÖN ÇEKME (m)", placeholder: "Örn. 5" },
  { key: "buildingSetbackSideM", label: "YAN ÇEKME (m)", placeholder: "Örn. 3" },
  { key: "buildingSetbackRearM", label: "ARKA ÇEKME (m)", placeholder: "Örn. 3" },
  { key: "roadWidthM", label: "YOL GENİŞLİĞİ (m)", placeholder: "Örn. 10" },
];

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function fmt(value: number | null | undefined) {
  const n = number(value);
  return n === null ? "—" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n);
}

export default function AIProjectDraft({ requestId }: { requestId: string }) {
  const [parcel, setParcel] = useState<ParcelData>(emptyParcel);
  const [draft, setDraft] = useState<AIDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canGenerate = useMemo(() => Boolean(parcel.parcelAreaM2 && parcel.emsal && parcel.taks && parcel.floors), [parcel]);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/project-requests/${requestId}/ai`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "AI çalışma alanı alınamadı.");
        if (data.data?.parcelData) setParcel({ ...emptyParcel, ...data.data.parcelData });
        if (data.data?.aiDraft) setDraft(data.data.aiDraft as AIDraft);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "AI çalışma alanı alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [requestId]);

  function update(key: keyof ParcelData, value: string) {
    setParcel((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
  }

  async function saveParcel() {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = await fetch(`/api/project-requests/${requestId}/ai`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelData: parcel }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Parsel bilgileri kaydedilemedi.");
      setMessage("Parsel bilgileri kaydedildi.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Parsel bilgileri kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function generate() {
    if (!canGenerate || generating) return;
    try {
      setGenerating(true);
      setError("");
      setMessage("");
      const response = await fetch(`/api/project-requests/${requestId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelData: parcel }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "AI ön proje üretilemedi.");
      setParcel({ ...emptyParcel, ...(data.data?.parcelData || parcel) });
      setDraft((data.data?.aiDraft || null) as AIDraft | null);
      setMessage("AI ön proje taslağı oluşturuldu.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "AI ön proje üretilemedi.");
    } finally {
      setGenerating(false);
    }
  }

  function printDraft() {
    window.print();
  }

  return (
    <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8 print:hidden">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">AI ÖN PROJE ÇALIŞMA ALANI</p>
          <h2 className="mt-3 text-2xl font-light">Parseli değerlendir, içeride taslak oluştur.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">Bu alan müşteriye otomatik gönderim yapmaz. Girilen imar/parsel verilerinden iç kullanım için ön fizibilite ve taslak proje raporu üretir.</p>
        </div>
        <button type="button" onClick={printDraft} disabled={!draft} className="border border-black/20 px-5 py-3 text-[10px] font-semibold tracking-[0.16em] disabled:opacity-30">RAPORU YAZDIR →</button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border border-black/10 bg-[#f8f5ef] p-5 md:p-6">
          <p className="text-[9px] font-semibold tracking-[0.18em] text-black/40">PARSEL / İMAR GİRDİLERİ</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {fieldMeta.map(({ key, label, placeholder }) => (
              <label key={key} className="block">
                <span className="mb-2 block text-[9px] font-semibold tracking-[0.15em] text-black/40">{label}</span>
                <input value={parcel[key]} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} className="w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black" />
              </label>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-[9px] font-semibold tracking-[0.15em] text-black/40">İMAR PLANI / PLAN NOTLARI</span>
            <textarea value={parcel.zoningPlan} onChange={(event) => update("zoningPlan", event.target.value)} rows={3} placeholder="Plan adı, kullanım kararı, özel plan notları..." className="w-full resize-y border border-black/15 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-black" />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-[9px] font-semibold tracking-[0.15em] text-black/40">EK NOTLAR</span>
            <textarea value={parcel.notes} onChange={(event) => update("notes", event.target.value)} rows={3} placeholder="Otopark, manzara, mevcut yapı, müşteri beklentisi gibi ek bilgiler..." className="w-full resize-y border border-black/15 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-black" />
          </label>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={saveParcel} disabled={saving || loading} className="flex-1 border border-black/20 px-5 py-3 text-[10px] font-semibold tracking-[0.16em] hover:bg-black hover:text-white disabled:opacity-40">{saving ? "KAYDEDİLİYOR..." : "PARSELİ KAYDET"}</button>
            <button type="button" onClick={generate} disabled={!canGenerate || generating || saving} className="flex-1 bg-black px-5 py-3 text-[10px] font-semibold tracking-[0.16em] text-white disabled:opacity-35">{generating ? "AI HAZIRLIYOR..." : "AI ÖN PROJE ÜRET →"}</button>
          </div>
          {!canGenerate && <p className="mt-3 text-[11px] leading-5 text-black/40">Üretim için en az parsel alanı, emsal, TAKS ve kat adedi gereklidir.</p>}
          {message && <div className="mt-4 border border-black/10 bg-white px-4 py-3 text-sm">{message}</div>}
          {error && <div className="mt-4 border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        </div>

        <div className="border border-black/10 bg-[#181818] p-5 text-white md:p-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.18em] text-white/35">AI TASLAK SONUCU</p>
              <h3 className="mt-3 text-2xl font-light">Ön proje raporu</h3>
            </div>
            {draft?.feasibility && <span className="border border-white/20 px-3 py-2 text-[9px] uppercase tracking-[0.13em] text-white/65">{draft.feasibility}</span>}
          </div>

          {draft ? (
            <div className="mt-7 space-y-7">
              <div className="border-t border-white/10 pt-5"><p className="text-[9px] tracking-[0.16em] text-white/35">ÖZET</p><p className="mt-3 text-sm leading-7 text-white/75">{draft.summary || "—"}</p></div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Metric label="Teorik emsal alanı" value={draft.calculations?.theoreticalEmsalAreaM2 != null ? `${fmt(draft.calculations.theoreticalEmsalAreaM2)} m²` : "—"} />
                <Metric label="Teorik TAKS oturumu" value={draft.calculations?.theoreticalTaksFootprintM2 != null ? `${fmt(draft.calculations.theoreticalTaksFootprintM2)} m²` : "—"} />
              </div>

              {draft.program?.length ? <div><p className="text-[9px] tracking-[0.16em] text-white/35">PROGRAM</p><div className="mt-3 divide-y divide-white/10 border-y border-white/10">{draft.program.map((item, index) => <div key={`${item.name}-${index}`} className="grid gap-2 py-4 sm:grid-cols-[1fr_90px_90px]"><span className="text-sm text-white/80">{item.name}</span><span className="text-sm text-white/55">{item.count == null ? "—" : `${item.count} adet`}</span><span className="text-sm text-white/55">{item.areaM2 == null ? "—" : `${fmt(item.areaM2)} m²`}</span></div>)}</div></div> : null}

              {draft.layoutAlternatives?.length ? <div><p className="text-[9px] tracking-[0.16em] text-white/35">TASLAK ALTERNATİFLER</p><div className="mt-3 space-y-3">{draft.layoutAlternatives.map((item, index) => <div key={`${item.title}-${index}`} className="border border-white/10 px-4 py-4"><p className="text-sm font-medium text-white/85">{item.title}</p><p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p></div>)}</div></div> : null}

              {draft.calculations?.notes?.length ? <BulletSection title="HESAPLAMA NOTLARI" items={draft.calculations.notes} /> : null}
              {draft.risks?.length ? <BulletSection title="RİSKLER / KONTROL GEREKTİRENLER" items={draft.risks} /> : null}
              {draft.professionalChecks?.length ? <BulletSection title="MİMAR / MÜHENDİS KONTROLÜ" items={draft.professionalChecks} /> : null}
              {draft.clientDeliverable?.length ? <BulletSection title="MÜŞTERİYE SATILABİLİR ÇALIŞMA KAPSAMI" items={draft.clientDeliverable} /> : null}
            </div>
          ) : (
            <div className="mt-8 border border-white/10 px-5 py-8 text-sm leading-7 text-white/45">Henüz AI ön proje üretilmedi. Parsel bilgilerini girip üretim başlatın.</div>
          )}
        </div>
      </div>

      {draft && (
        <div id="ai-print-report" className="hidden print:block print:bg-white print:text-black">
          <div className="p-10">
            <div className="border-b border-black pb-6"><p className="text-xs tracking-[0.22em]">ERKANOĞLU MİMARLIK · MÜHENDİSLİK</p><h1 className="mt-4 text-4xl">Ön Proje ve Parsel Fizibilite Çalışması</h1><p className="mt-3 text-sm text-black/55">Talep #{requestId}</p></div>
            <ReportSection title="Parsel Bilgileri"><ReportRow label="Parsel alanı" value={parcel.parcelAreaM2 ? `${parcel.parcelAreaM2} m²` : "—"}/><ReportRow label="Emsal" value={parcel.emsal || "—"}/><ReportRow label="TAKS" value={parcel.taks || "—"}/><ReportRow label="Kat adedi" value={parcel.floors || "—"}/><ReportRow label="Plan / notlar" value={parcel.zoningPlan || "—"}/></ReportSection>
            <ReportSection title="Ön Değerlendirme"><p className="text-sm leading-7">{draft.summary || "—"}</p></ReportSection>
            <ReportSection title="Teorik Alanlar"><ReportRow label="Teorik emsal alanı" value={draft.calculations?.theoreticalEmsalAreaM2 != null ? `${fmt(draft.calculations.theoreticalEmsalAreaM2)} m²` : "—"}/><ReportRow label="Teorik TAKS oturumu" value={draft.calculations?.theoreticalTaksFootprintM2 != null ? `${fmt(draft.calculations.theoreticalTaksFootprintM2)} m²` : "—"}/></ReportSection>
            {draft.program?.length ? <ReportSection title="Yapı Programı"><ul className="list-disc space-y-2 pl-5 text-sm leading-6">{draft.program.map((item,index)=><li key={index}>{item.name} — {item.count == null ? "adet belirtilmedi" : `${item.count} adet`}{item.areaM2 == null ? "" : ` / ${fmt(item.areaM2)} m²`}</li>)}</ul></ReportSection> : null}
            {draft.layoutAlternatives?.length ? <ReportSection title="Taslak Alternatifler">{draft.layoutAlternatives.map((item,index)=><div key={index} className="mb-4"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-sm leading-6">{item.description}</p></div>)}</ReportSection> : null}
            {draft.risks?.length ? <ReportSection title="Riskler / Kontrol Gerektirenler"><ul className="list-disc space-y-2 pl-5 text-sm leading-6">{draft.risks.map((item,index)=><li key={index}>{item}</li>)}</ul></ReportSection> : null}
            {draft.professionalChecks?.length ? <ReportSection title="Uzman Kontrol Listesi"><ul className="list-disc space-y-2 pl-5 text-sm leading-6">{draft.professionalChecks.map((item,index)=><li key={index}>{item}</li>)}</ul></ReportSection> : null}
            <div className="mt-10 border-t border-black/20 pt-5 text-xs leading-5 text-black/55">Bu çalışma yapay zekâ destekli ön fizibilite ve taslak çalışmasıdır. Kesin imar hakkı, ruhsat projesi, statik proje veya uygulanabilirlik garantisi değildir. Nihai değerlendirme yetkili mimar ve mühendis tarafından yapılmalıdır.</div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="border border-white/10 px-4 py-4"><p className="text-[9px] tracking-[0.13em] text-white/35">{label}</p><p className="mt-2 text-lg text-white/85">{value}</p></div>;
}

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return <div><p className="text-[9px] tracking-[0.16em] text-white/35">{title}</p><ul className="mt-3 space-y-2 text-sm leading-6 text-white/60">{items.map((item,index)=><li key={index} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />{item}</li>)}</ul></div>;
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-8 border-t border-black/15 pt-5"><p className="text-[10px] font-semibold tracking-[0.18em]">{title}</p><div className="mt-4">{children}</div></section>;
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-2 border-b border-black/10 py-3 md:grid-cols-[180px_1fr]"><span className="text-xs font-medium text-black/50">{label}</span><span className="text-sm">{value}</span></div>;
}
