"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lead = {
  id: number;
  fullName: string;
  phone: string;
  district: string;
  buildingType: string;
  status: string;
  priority: string;
  source: string;
  nextFollowUpAt: string | null;
  createdAt: string;
  project?: { id: number; projectNo: string } | null;
};

type DashboardData = {
  stats: {
    totalLeads: number;
    newLeads: number;
    activeLeads: number;
    sentQuotes: number;
    wonLeads: number;
    followUpsDue: number;
    projectCount: number;
  };
  latestLeads: Lead[];
  dueLeads: Pick<Lead, "id" | "fullName" | "phone" | "district" | "status" | "priority" | "nextFollowUpAt">[];
};

const statusLabels: Record<string, string> = {
  YENI: "Yeni Talep",
  INCELENIYOR: "İnceleniyor",
  GORUSME_YAPILDI: "Ofis Görüşmesi",
  TEKLIF_HAZIRLANIYOR: "Teklif",
  TEKLIF_GONDERILDI: "Teklif",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
  PROJE_OLUSTURULDU: "Projeye Dönüştürüldü",
};
const priorityLabels: Record<string, string> = { DUSUK: "Düşük", NORMAL: "Normal", YUKSEK: "Yüksek", ACIL: "Acil" };
const sourceLabels: Record<string, string> = { direct: "Doğrudan", calculator: "Maliyet Hesaplama", collaboration: "İş Birliği" };
function formatDate(value: string | null) { if (!value) return "-"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() { try { setLoading(true); setError(""); const response = await fetch("/api/admin/dashboard", { cache: "no-store" }); const result = await response.json(); if (!response.ok) throw new Error(result?.message || "Yönetim özeti alınamadı."); setData(result.data); } catch (err) { setError(err instanceof Error ? err.message : "Yönetim özeti alınamadı."); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  if (loading) return <main className="min-h-screen bg-[#f5f2eb] px-6 py-12 md:px-10"><div className="mx-auto max-w-7xl"><p className="text-[10px] uppercase tracking-[0.2em] text-[#8d8579]">Yönetim özeti yükleniyor...</p></div></main>;
  if (error || !data) return <main className="min-h-screen bg-[#f5f2eb] px-6 py-12 md:px-10"><div className="mx-auto max-w-7xl"><div className="border border-red-300 bg-red-50 p-6 text-sm text-red-800">{error || "Yönetim özeti alınamadı."}</div></div></main>;
  const { stats, latestLeads, dueLeads } = data;
  return <main className="min-h-screen bg-[#f5f2eb] px-6 py-12 text-[#171717] md:px-10"><div className="mx-auto max-w-7xl">
    <header className="border-b border-[#d8d3c8] pb-8"><p className="text-[9px] uppercase tracking-[0.25em] text-[#8d8579]">Erkanoğlu Yönetim</p><div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><h1 className="text-4xl font-light tracking-[-0.04em] md:text-5xl">Talepler ve Projeler</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#777064]">Web sitesinden gelen talepleri önce siz değerlendirin, sonra müşteriyle iletişim ve yüz yüze görüşme sürecini yönetin.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/project-requests" className="border border-black bg-black px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white hover:bg-black/80">Yeni Talepler →</Link><Link href="/admin/follow-ups" className="border border-[#aaa398] px-4 py-3 text-[10px] uppercase tracking-[0.16em] hover:bg-black hover:text-white">Takip →</Link><Link href="/admin/projects" className="border border-[#aaa398] px-4 py-3 text-[10px] uppercase tracking-[0.16em] hover:bg-black hover:text-white">Projeler →</Link><a href="/api/admin/auth/logout" className="border border-[#aaa398] px-4 py-3 text-[10px] uppercase tracking-[0.16em] hover:bg-black hover:text-white">Çıkış</a></div></div></header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="TOPLAM TALEP" value={stats.totalLeads}/><StatCard label="YENİ TALEP" value={stats.newLeads} href="/admin/project-requests" emphasis={stats.newLeads>0}/><StatCard label="BUGÜN TAKİP" value={stats.followUpsDue} href="/admin/follow-ups" emphasis={stats.followUpsDue>0}/><StatCard label="KAZANILAN" value={stats.wonLeads}/></section>
    <section className="mt-4 grid gap-4 sm:grid-cols-3"><MiniStat label="DEVAM EDEN TALEP" value={stats.activeLeads}/><MiniStat label="GÖNDERİLEN TEKLİF" value={stats.sentQuotes}/><MiniStat label="TOPLAM PROJE" value={stats.projectCount}/></section>
    <section className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
      <div className="border border-[#d8d3c8] bg-[#f8f5ef]"><div className="flex items-end justify-between border-b border-[#d8d3c8] px-6 py-5"><div><p className="text-[9px] uppercase tracking-[0.2em] text-[#8d8579]">Son Talepler</p><p className="mt-2 text-sm text-[#777064]">Önce sizin değerlendirmeniz gereken yeni müşteri talepleri.</p></div><Link href="/admin/project-requests" className="text-[9px] uppercase tracking-[0.14em] text-[#777064] hover:text-black">Tümünü Gör →</Link></div>{latestLeads.length===0?<div className="px-6 py-12 text-sm text-[#8d8579]">Henüz talep bulunmuyor.</div>:<div>{latestLeads.map((lead)=><Link key={lead.id} href={`/admin/project-requests/${lead.id}`} className="grid gap-4 border-b border-[#e2ddd4] px-6 py-5 transition hover:bg-[#eee9df] last:border-b-0 md:grid-cols-[1.55fr_0.9fr_0.8fr_auto] md:items-center"><div><p className="text-sm font-medium">{lead.fullName}</p><p className="mt-1 text-xs text-[#8d8579]">{lead.district} · {lead.buildingType}</p></div><div><p className="text-xs">{statusLabels[lead.status]??lead.status}</p><p className="mt-1 text-[10px] text-[#8d8579]">{sourceLabels[lead.source]??lead.source}</p></div><div><span className="inline-flex border border-[#c9c2b6] px-2 py-1 text-[9px] uppercase tracking-[0.1em]">{priorityLabels[lead.priority]??lead.priority}</span></div><span className="text-lg text-[#777064]">→</span></Link>)}</div>}</div>
      <div className="border border-[#d8d3c8] bg-[#f8f5ef]"><div className="border-b border-[#d8d3c8] px-6 py-5"><p className="text-[9px] uppercase tracking-[0.2em] text-[#8d8579]">Takip</p><p className="mt-2 text-sm text-[#777064]">Bugün veya daha önce aramanız gereken müşteriler.</p></div>{dueLeads.length===0?<div className="px-6 py-12 text-sm text-[#8d8579]">Şu anda takip bekleyen müşteri yok.</div>:<div>{dueLeads.map((lead)=><Link key={lead.id} href={`/admin/project-requests/${lead.id}`} className="block border-b border-[#e2ddd4] px-6 py-5 hover:bg-[#eee9df] last:border-b-0"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">{lead.fullName}</p><p className="mt-1 text-xs text-[#8d8579]">{lead.district} · {statusLabels[lead.status]??lead.status}</p></div><span className="inline-flex border border-[#c9c2b6] px-2 py-1 text-[9px] uppercase tracking-[0.1em]">{priorityLabels[lead.priority]??lead.priority}</span></div><p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[#777064]">Takip: {formatDate(lead.nextFollowUpAt)}</p></Link>)}</div>}</div>
    </section>
  </div></main>;
}
function StatCard({label,value,href,emphasis=false}:{label:string;value:number;href?:string;emphasis?:boolean}){const content=<div className={`border p-6 ${emphasis?"border-black bg-black text-white":"border-[#d8d3c8] bg-[#f8f5ef]"}`}><p className={`text-[9px] uppercase tracking-[0.2em] ${emphasis?"text-white/60":"text-[#8d8579]"}`}>{label}</p><p className="mt-5 text-4xl font-light tracking-[-0.04em]">{value}</p>{href&&<p className={`mt-4 text-[9px] uppercase tracking-[0.14em] ${emphasis?"text-white/60":"text-[#777064]"}`}>Aç →</p>}</div>;return href?<Link href={href} className="block transition hover:-translate-y-0.5">{content}</Link>:content;}
function MiniStat({label,value}:{label:string;value:number}){return <div className="border border-[#d8d3c8] bg-transparent px-5 py-4"><p className="text-[9px] uppercase tracking-[0.18em] text-[#8d8579]">{label}</p><p className="mt-2 text-2xl font-light">{value}</p></div>;}
