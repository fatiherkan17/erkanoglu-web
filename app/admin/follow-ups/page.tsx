"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lead = {
  id: number;
  fullName: string;
  phone: string;
  district: string;
  status: string;
  priority: string;
  nextFollowUpAt: string | null;
};

const priorityLabels: Record<string, string> = { ACIL: "Acil", YUKSEK: "Yüksek", NORMAL: "Normal", DUSUK: "Düşük" };
const statusLabels: Record<string, string> = { YENI: "Yeni", INCELENIYOR: "İnceleniyor", GORUSME_YAPILDI: "Görüşme Yapıldı", TEKLIF_HAZIRLANIYOR: "Teklif Hazırlanıyor", TEKLIF_GONDERILDI: "Teklif Gönderildi", KAZANILDI: "Kazanıldı", KAYBEDILDI: "Kaybedildi", PROJE_OLUSTURULDU: "Projeye Dönüştürüldü" };
const priorityRank: Record<string, number> = { ACIL: 0, YUKSEK: 1, NORMAL: 2, DUSUK: 3 };

function formatDate(value: string | null) {
  if (!value) return "Takip tarihi yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Geçersiz tarih";
  return date.toLocaleString("tr-TR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
}

function localInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function FollowUpsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true); setError("");
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Takipler alınamadı.");
      const items = (result.data?.dueLeads ?? []) as Lead[];
      setLeads(items.sort((a, b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9) || (new Date(a.nextFollowUpAt ?? 0).getTime() - new Date(b.nextFollowUpAt ?? 0).getTime())));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Takipler alınamadı.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function followUpAction(id: number, action: "complete" | "reschedule", nextFollowUpAt?: string, message?: string) {
    try {
      setWorkingId(id); setError(""); setSuccess("");
      const response = await fetch(`/api/project-requests/${id}/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, nextFollowUpAt }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || "Takip güncellenemedi.");
      setSuccess(message || result.message || "Takip güncellendi.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Takip güncellenemedi.");
    } finally { setWorkingId(null); }
  }

  function completeFollowUp(lead: Lead) {
    void followUpAction(lead.id, "complete", undefined, `${lead.fullName} için takip tamamlandı.`);
  }

  function snooze(lead: Lead, days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    void followUpAction(lead.id, "reschedule", localInput(date), `${lead.fullName} için takip ${days} gün sonrasına alındı.`);
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb] px-6 py-12 text-[#171717] md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-[#d8d3c8] pb-8">
          <Link href="/admin" className="text-[9px] uppercase tracking-[0.2em] text-[#8d8579] hover:text-black">← Yönetim</Link>
          <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><p className="text-[9px] uppercase tracking-[0.25em] text-[#8d8579]">Satış Takibi</p><h1 className="mt-3 text-4xl font-light tracking-[-0.04em]">Takip Merkezi</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#777064]">Bugün veya daha önce yapılması gereken müşteri takiplerini tek ekrandan yönetin.</p></div>
            <Link href="/admin/project-requests" className="border border-[#aaa398] px-4 py-3 text-[10px] uppercase tracking-[0.16em] hover:bg-black hover:text-white">Tüm Talepler →</Link>
          </div>
        </header>

        {success && <div className="mt-6 border border-black/10 bg-[#f8f5ef] px-5 py-4 text-sm">{success}</div>}
        {error && <div className="mt-6 border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800">{error}</div>}

        <section className="mt-8 border border-[#d8d3c8] bg-[#f8f5ef]">
          <div className="border-b border-[#d8d3c8] px-6 py-5"><p className="text-[9px] uppercase tracking-[0.2em] text-[#8d8579]">Bekleyen Takipler</p><p className="mt-2 text-sm text-[#777064]">Öncelik sırasına göre düzenlenmiştir.</p></div>
          {loading ? <div className="px-6 py-14 text-sm text-[#8d8579]">Takipler yükleniyor...</div> : leads.length === 0 ? <div className="px-6 py-14 text-sm text-[#8d8579]">Şu anda takip bekleyen lead yok.</div> : (
            <div>{leads.map((lead) => {
              const busy = workingId === lead.id;
              return <article key={lead.id} className="border-b border-[#e2ddd4] px-6 py-6 last:border-b-0">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-medium">{lead.fullName}</h2><span className="border border-[#c9c2b6] px-2 py-1 text-[9px] uppercase tracking-[0.12em]">{priorityLabels[lead.priority] ?? lead.priority}</span></div><p className="mt-2 text-xs text-[#777064]">{lead.district} · {statusLabels[lead.status] ?? lead.status}</p><p className="mt-2 text-sm">Takip: <strong className="font-medium">{formatDate(lead.nextFollowUpAt)}</strong></p></div>
                  <div className="flex flex-wrap gap-2"><a href={`tel:${lead.phone}`} className="border border-[#aaa398] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] hover:bg-black hover:text-white">Ara</a><a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="border border-[#aaa398] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] hover:bg-black hover:text-white">WhatsApp</a><Link href={`/admin/project-requests/${lead.id}`} className="border border-[#aaa398] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] hover:bg-black hover:text-white">Detay</Link><button type="button" disabled={busy} onClick={() => snooze(lead, 1)} className="border border-[#aaa398] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] disabled:opacity-40">+1 GÜN</button><button type="button" disabled={busy} onClick={() => snooze(lead, 3)} className="border border-[#aaa398] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] disabled:opacity-40">+3 GÜN</button><button type="button" disabled={busy} onClick={() => completeFollowUp(lead)} className="border border-black bg-black px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40">{busy ? "KAYDEDİLİYOR..." : "TAKİBİ TAMAMLA"}</button></div>
                </div>
              </article>;
            })}</div>
          )}
        </section>
      </div>
    </main>
  );
}
