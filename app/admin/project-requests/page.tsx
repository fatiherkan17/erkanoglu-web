"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectRequest = {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  neighborhood: string;
  buildingType: string;
  projectStage: string;
  approximateArea: string | null;
  interestAreas: string;
  status: string;
  source: string;
  priority: string;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  project?: {
    id: number;
    projectNo: string;
    status: string;
    quotes?: { status: string; quoteDate: string }[];
    meetingNotes?: { meetingAt: string }[];
  } | null;
};

const statusLabels: Record<string, string> = {
  YENI: "Yeni",
  INCELENIYOR: "İnceleniyor",
  GORUSME_YAPILDI: "Görüşme Yapıldı",
  TEKLIF_HAZIRLANIYOR: "Teklif Hazırlanıyor",
  TEKLIF_GONDERILDI: "Teklif Gönderildi",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
  PROJE_OLUSTURULDU: "Projeye Dönüştürüldü",
};
const sourceLabels: Record<string, string> = { direct: "Doğrudan", calculator: "Maliyet", collaboration: "İş Birliği" };
const priorityLabels: Record<string, string> = { DUSUK: "Düşük", NORMAL: "Normal", YUKSEK: "Yüksek", ACIL: "Acil" };
const quoteLabels: Record<string, string> = { TASLAK: "Taslak", HAZIRLANIYOR: "Hazırlanıyor", GONDERILDI: "Gönderildi", KABUL_EDILDI: "Kabul edildi", REDDEDILDI: "Reddedildi" };

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

function priorityClass(priority: string) {
  if (priority === "ACIL") return "border-black bg-black text-white";
  if (priority === "YUKSEK") return "border-black/30 bg-black/5 text-black";
  return "border-[#c9c2b6] text-[#6f685e]";
}

export default function ProjectRequestsPage() {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true); setError("");
        const response = await fetch("/api/project-requests", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Proje talepleri alınamadı.");
        const data = Array.isArray(result) ? result : result?.data ?? result?.projectRequests ?? [];
        setRequests(data);
      } catch (reason) {
        console.error("Project requests list error:", reason);
        setError(reason instanceof Error ? reason.message : "Proje talepleri alınamadı.");
      } finally { setLoading(false); }
    }
    loadRequests();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f2eb] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-[#d8d3c8] pb-8">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#8d8579]">Erkanoğlu Yönetim</p>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><h1 className="text-4xl font-light tracking-[-0.04em]">Proje Talepleri</h1><p className="mt-3 text-sm text-[#777064]">Gelen talepleri satış fırsatı olarak takip edin.</p></div>
            <Link href="/admin/projects" className="border border-[#aaa398] px-5 py-3 text-[10px] uppercase tracking-[0.18em] hover:bg-black hover:text-white">Projeler →</Link>
          </div>
        </div>

        {loading && <div className="py-16 text-sm text-[#777064]">Proje talepleri yükleniyor...</div>}
        {!loading && error && <div className="mt-8 border border-red-300 bg-red-50 p-5 text-sm text-red-800">{error}</div>}
        {!loading && !error && requests.length === 0 && <div className="mt-8 border border-[#d8d3c8] bg-[#f8f5ef] p-8 text-sm text-[#777064]">Henüz proje talebi bulunmuyor.</div>}

        {!loading && !error && requests.length > 0 && (
          <div className="mt-8 overflow-hidden border border-[#d8d3c8] bg-[#f8f5ef]">
            <div className="hidden grid-cols-[1.45fr_0.9fr_0.8fr_0.8fr_1.1fr_auto] border-b border-[#d8d3c8] px-6 py-4 text-[9px] uppercase tracking-[0.18em] text-[#8d8579] lg:grid">
              <span>Müşteri</span><span>Kaynak / Öncelik</span><span>Durum</span><span>Teklif</span><span>Takip</span><span></span>
            </div>
            {requests.map((request) => {
              const latestQuote = request.project?.quotes?.[0];
              const latestMeeting = request.project?.meetingNotes?.[0];
              return (
                <Link key={request.id} href={`/admin/project-requests/${request.id}`} className="grid gap-5 border-b border-[#ddd8ce] px-6 py-6 transition hover:bg-[#eee9df] last:border-b-0 lg:grid-cols-[1.45fr_0.9fr_0.8fr_0.8fr_1.1fr_auto] lg:items-center">
                  <div><p className="text-base">{request.fullName}</p><p className="mt-1 text-xs text-[#8d8579]">#{request.id} · {request.buildingType} · {request.approximateArea ? `${request.approximateArea} m²` : "Alan yok"}</p><p className="mt-1 text-xs text-[#9a9287]">{request.province} / {request.district}</p></div>
                  <div><p className="text-xs text-[#5f594f]">{sourceLabels[request.source] ?? request.source}</p><span className={`mt-2 inline-flex border px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${priorityClass(request.priority)}`}>{priorityLabels[request.priority] ?? request.priority}</span></div>
                  <div><span className="inline-flex border border-[#c9c2b6] px-3 py-2 text-[9px] uppercase tracking-[0.1em]">{statusLabels[request.status] ?? request.status}</span></div>
                  <div><p className="text-xs">{latestQuote ? quoteLabels[latestQuote.status] ?? latestQuote.status : "Teklif yok"}</p><p className="mt-1 text-[10px] text-[#9a9287]">{latestQuote ? formatDate(latestQuote.quoteDate) : ""}</p></div>
                  <div><p className="text-xs">Son: {request.lastContactAt ? formatDate(request.lastContactAt) : latestMeeting ? formatDate(latestMeeting.meetingAt) : "—"}</p><p className="mt-1 text-xs text-[#777064]">Takip: {formatDate(request.nextFollowUpAt)}</p></div>
                  <span className="text-lg text-[#777064]">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
