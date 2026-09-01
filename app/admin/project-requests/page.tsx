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
  createdAt: string;
  project?: { id: number; projectNo: string; status: string } | null;
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectRequestsPage() {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/project-requests", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Proje talepleri alınamadı.");
        const data = Array.isArray(result) ? result : result?.data ?? result?.projectRequests ?? [];
        setRequests(data);
      } catch (err) {
        console.error("Project requests list error:", err);
        setError(err instanceof Error ? err.message : "Proje talepleri alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#171717] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-[#d8d3c8] pb-8">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#8d8579]">Erkanoğlu Yönetim</p>
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-[-0.04em]">Proje Talepleri</h1>
              <p className="mt-3 text-sm text-[#777064]">Web sitesinden gelen proje taleplerini yönetin.</p>
            </div>
            <Link href="/admin/projects" className="border border-[#aaa398] px-5 py-3 text-[10px] uppercase tracking-[0.18em] hover:bg-black hover:text-white">Projeler →</Link>
          </div>
        </div>

        {loading && <div className="py-16 text-sm text-[#777064]">Proje talepleri yükleniyor...</div>}
        {!loading && error && <div className="mt-8 border border-red-300 bg-red-50 p-5 text-sm text-red-800">{error}</div>}

        {!loading && !error && requests.length === 0 && (
          <div className="mt-8 border border-[#d8d3c8] bg-[#f8f5ef] p-8 text-sm text-[#777064]">Henüz proje talebi bulunmuyor.</div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="mt-8 overflow-hidden border border-[#d8d3c8] bg-[#f8f5ef]">
            <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_auto] border-b border-[#d8d3c8] px-6 py-4 text-[9px] uppercase tracking-[0.18em] text-[#8d8579] md:grid">
              <span>Müşteri</span><span>Konum</span><span>Yapı</span><span>Durum</span><span></span>
            </div>
            {requests.map((request) => (
              <Link key={request.id} href={`/admin/project-requests/${request.id}`} className="grid gap-4 border-b border-[#ddd8ce] px-6 py-6 transition hover:bg-[#eee9df] last:border-b-0 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:items-center">
                <div><p className="text-base">{request.fullName}</p><p className="mt-1 text-xs text-[#8d8579]">#{request.id} · {formatDate(request.createdAt)}</p></div>
                <div><p className="text-sm">{request.province} / {request.district}</p><p className="mt-1 text-xs text-[#8d8579]">{request.neighborhood}</p></div>
                <div><p className="text-sm">{request.buildingType}</p><p className="mt-1 text-xs text-[#8d8579]">{request.approximateArea ? `${request.approximateArea} m²` : "Alan belirtilmedi"}</p></div>
                <div><span className="inline-flex border border-[#c9c2b6] px-3 py-2 text-[9px] uppercase tracking-[0.12em]">{request.project ? request.project.projectNo : statusLabels[request.status] ?? request.status}</span></div>
                <span className="text-lg text-[#777064]">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
