"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: number;
  projectNo: string;
  name: string | null;
  status: string;
  category: string;
  publicTitle: string | null;
  createdAt: string;
  projectRequest: {
    id: number;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    neighborhood: string;
    buildingType: string;
    approximateArea: string | null;
  } | null;
};

const statusLabels: Record<string, string> = { AKTIF: "Aktif", BEKLEMEDE: "Beklemede", TAMAMLANDI: "Tamamlandı", IPTAL: "İptal", SOZLESME: "Sözleşme" };
const categoryLabels: Record<string, string> = { KONUT: "Konut", VILLA: "Villa", TICARI: "Ticari Yapı", KARMA: "Karma Kullanım", ENDÜSTRIYEL: "Endüstriyel", ENDUSTRIYEL: "Endüstriyel", MEVCUT_YAPI: "Mevcut Yapı", KENTSEL_DONUSUM: "Kentsel Dönüşüm", TADILAT_RENOVASYON: "Tadilat / Renovasyon" };

function getStatusClass(status: string) {
  switch (status) {
    case "AKTIF": return "bg-[#d8e4d3] text-[#30402d]";
    case "TAMAMLANDI": return "bg-black text-white";
    case "IPTAL": return "bg-[#ead6d2] text-[#4a302c]";
    default: return "bg-[#e8e3d8] text-[#403c35]";
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Projeler alınamadı.");
        setProjects(result?.data ?? []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Projeler yüklenirken bir hata oluştu.");
      } finally { setLoading(false); }
    }
    loadProjects();
  }, []);

  const activeProjects = projects.filter((project) => project.status === "AKTIF" || project.status === "BEKLEMEDE" || project.status === "SOZLESME");
  const completedProjects = projects.filter((project) => project.status === "TAMAMLANDI");

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#161616]">
      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <div className="mb-10 flex items-end justify-between border-b border-[#d8d3c8] pb-8">
          <div>
            <Link href="/admin" className="mb-8 block text-[10px] uppercase tracking-[0.22em] text-[#7d776c]">← Yönetim</Link>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#8b8478]">Referans Yönetimi</p>
            <h1 className="text-[52px] font-light leading-none tracking-[-0.04em]">Referans Projeler</h1>
            <p className="mt-4 max-w-2xl text-sm text-[#777064]">Geçmişte tamamladığınız işleri buradan bağımsız olarak kaydedin. Müşteri talebine bağlı olmak zorunda değildir.</p>
          </div>
          <div className="hidden text-right md:block"><div className="text-[18px] font-medium tracking-[0.35em]">ERKANOĞLU</div><div className="mt-2 text-[9px] tracking-[0.18em] text-[#a0988b]">MİMARLIK · MÜHENDİSLİK · İNŞAAT</div></div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/admin/projects/new" className="rounded-full bg-black px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white">+ Referans Proje Ekle</Link>
          <Link href="/admin/media" className="rounded-full border border-[#aaa398] px-5 py-3 text-[10px] uppercase tracking-[0.16em] hover:bg-black hover:text-white">Medya Havuzu →</Link>
        </div>

        <section className="mb-8 grid grid-cols-1 border border-[#cec8bc] bg-[#eee9df] md:grid-cols-3">
          <Stat label="Toplam Referans" value={loading ? "—" : projects.length} />
          <Stat label="Aktif / Süren" value={loading ? "—" : activeProjects.length} border />
          <Stat label="Tamamlanan" value={loading ? "—" : completedProjects.length} />
        </section>

        <section className="border border-[#cec8bc] bg-[#f8f5ef]">
          <div className="flex items-center justify-between border-b border-[#d8d3c8] px-6 py-5"><div><h2 className="text-lg">Referans İşler</h2><p className="mt-1 text-xs text-[#918a7e]">Elle eklediğiniz geçmiş işler ve portföy kayıtları.</p></div><div className="text-[9px] uppercase tracking-[0.2em] text-[#8b8478]">{projects.length} PROJE</div></div>
          {loading && <div className="px-6 py-12 text-sm text-[#777064]">Projeler yükleniyor...</div>}
          {!loading && error && <div className="px-6 py-12 text-sm text-red-700">{error}</div>}
          {!loading && !error && projects.length === 0 && <div className="px-6 py-14 text-center"><p className="text-sm text-[#777064]">Henüz referans proje eklenmedi.</p><Link href="/admin/projects/new" className="mt-4 inline-block border border-black bg-black px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white">İlk Referans Projeyi Ekle →</Link></div>}
          {!loading && !error && projects.length > 0 && <div className="divide-y divide-[#ddd7cc]">{projects.map((project) => {
            const request = project.projectRequest;
            return <Link key={project.id} href={`/admin/projects/${project.id}`} className="grid gap-6 px-6 py-6 transition hover:bg-[#eee9df] md:grid-cols-[1.3fr_0.9fr_1fr_auto] md:items-center">
              <div><p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">{project.projectNo}</p><p className="mt-2 text-base">{project.publicTitle || project.name || "İsimsiz proje"}</p><p className="mt-1 text-xs text-[#817a6e]">{categoryLabels[project.category] || project.category}</p></div>
              <div><p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">Kaynak</p><p className="mt-2 text-sm">{request ? "Müşteri talebi" : "Manuel referans"}</p><p className="mt-1 text-xs text-[#817a6e]">{request ? request.fullName : "Portföy kaydı"}</p></div>
              <div><p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">Konum</p><p className="mt-2 text-sm">{request ? `${request.province} / ${request.district}` : "Bilgi proje içinde"}</p><p className="mt-1 text-xs text-[#817a6e]">{request?.neighborhood || ""}</p></div>
              <div><span className={`inline-flex px-3 py-2 text-[9px] font-medium uppercase tracking-[0.12em] ${getStatusClass(project.status)}`}>{statusLabels[project.status] ?? project.status}</span><p className="mt-3 text-right text-lg text-[#777064]">→</p></div>
            </Link>;
          })}</div>}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, border = false }: { label: string; value: string | number; border?: boolean }) {
  return <div className={`p-6 ${border ? "border-b border-[#cec8bc] md:border-b-0 md:border-r" : "border-b border-[#cec8bc] md:border-b-0"}`}><p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8a8377]">{label}</p><p className="mt-3 text-4xl font-light">{value}</p></div>;
}
