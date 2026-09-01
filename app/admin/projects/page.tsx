"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: number;
  projectNo: string;
  status: string;
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
  };
};

const statusLabels: Record<string, string> = {
  AKTIF: "Aktif",
  BEKLEMEDE: "Beklemede",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
};

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

  const activeProjects = projects.filter((project) => project.status === "AKTIF" || project.status === "BEKLEMEDE");
  const completedProjects = projects.filter((project) => project.status === "TAMAMLANDI");

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#161616]">
      <div className="mx-auto max-w-[1120px] px-6 py-12">
        <div className="mb-10 flex items-end justify-between border-b border-[#d8d3c8] pb-8">
          <div>
            <Link href="/admin/project-requests" className="mb-8 block text-[10px] uppercase tracking-[0.22em] text-[#7d776c]">← Proje Talepleri</Link>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#8b8478]">Yönetim Paneli</p>
            <h1 className="text-[52px] font-light leading-none tracking-[-0.04em]">İşler / Projeler</h1>
            <p className="mt-4 text-sm text-[#777064]">Oluşturulan projeleri ve süreçlerini tek merkezden takip edin.</p>
          </div>
          <div className="hidden text-right md:block"><div className="text-[18px] font-medium tracking-[0.35em]">ERKANOĞLU</div><div className="mt-2 text-[9px] tracking-[0.18em] text-[#a0988b]">MİMARLIK · MÜHENDİSLİK · İNŞAAT</div></div>
        </div>

        <section className="mb-8 grid grid-cols-1 border border-[#cec8bc] bg-[#eee9df] md:grid-cols-3">
          <Stat label="Toplam Proje" value={loading ? "—" : projects.length} />
          <Stat label="Aktif Proje" value={loading ? "—" : activeProjects.length} border />
          <Stat label="Tamamlanan" value={loading ? "—" : completedProjects.length} />
        </section>

        <section className="border border-[#cec8bc] bg-[#f8f5ef]">
          <div className="flex items-center justify-between border-b border-[#d8d3c8] px-6 py-5"><div><h2 className="text-lg">Projeler</h2><p className="mt-1 text-xs text-[#918a7e]">Talep kaydından oluşturulan gerçek proje kayıtları.</p></div><div className="text-[9px] uppercase tracking-[0.2em] text-[#8b8478]">{projects.length} PROJE</div></div>
          {loading && <div className="px-6 py-12 text-sm text-[#777064]">Projeler yükleniyor...</div>}
          {!loading && error && <div className="px-6 py-12 text-sm text-red-700">{error}</div>}
          {!loading && !error && projects.length === 0 && <div className="px-6 py-12 text-sm text-[#777064]">Henüz kayıtlı proje bulunmuyor.</div>}
          {!loading && !error && projects.length > 0 && <div className="divide-y divide-[#ddd7cc]">{projects.map((project) => <Link key={project.id} href={`/admin/projects/${project.id}`} className="grid gap-6 px-6 py-6 transition hover:bg-[#eee9df] md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center">
            <div><p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">Proje</p><p className="mt-2 text-base">{project.projectNo}</p><p className="mt-1 text-xs text-[#817a6e]">{project.projectRequest.fullName}</p></div>
            <div><p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">Konum</p><p className="mt-2 text-sm">{project.projectRequest.province} / {project.projectRequest.district}</p><p className="mt-1 text-xs text-[#817a6e]">{project.projectRequest.neighborhood}</p></div>
            <div><p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">Yapı</p><p className="mt-2 text-sm">{project.projectRequest.buildingType}</p><p className="mt-1 text-xs text-[#817a6e]">{project.projectRequest.approximateArea ? `${project.projectRequest.approximateArea} m²` : "Alan belirtilmedi"}</p></div>
            <div><span className={`inline-flex px-3 py-2 text-[9px] font-medium uppercase tracking-[0.12em] ${getStatusClass(project.status)}`}>{statusLabels[project.status] ?? project.status}</span><p className="mt-3 text-right text-lg text-[#777064]">→</p></div>
          </Link>)}</div>}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, border = false }: { label: string; value: string | number; border?: boolean }) {
  return <div className={`p-6 ${border ? "border-b border-[#cec8bc] md:border-b-0 md:border-r" : "border-b border-[#cec8bc] md:border-b-0"}`}><p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8a8377]">{label}</p><p className="mt-3 text-4xl font-light">{value}</p></div>;
}
