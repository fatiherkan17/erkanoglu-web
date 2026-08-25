"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProjectRequest = {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  neighborhood: string;
  buildingType: string;
  projectStage: string;
  approximateArea: string;
  interestAreas: string;
  description: string;
  status: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  YENI: "Yeni",
  INCELENIYOR: "İnceleniyor",
  GORUSULDU: "Görüşüldü",
  TEKLIF_HAZIRLANIYOR: "Teklif Hazırlanıyor",
  TEKLIF_GONDERILDI: "Teklif Gönderildi",
  ONAY_BEKLENIYOR: "Onay Bekleniyor",
  PROJE_BASLADI: "Proje Başladı",
  TAMAMLANDI: "Tamamlandı",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
};

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function getStatusClass(status: string) {
  switch (status) {
    case "YENI":
      return "bg-black text-white";

    case "INCELENIYOR":
      return "bg-[#ead9a6] text-[#3d3420]";

    case "KAZANILDI":
    case "TAMAMLANDI":
      return "bg-[#d8e4d3] text-[#30402d]";

    case "KAYBEDILDI":
      return "bg-[#ead6d2] text-[#4a302c]";

    default:
      return "bg-[#e8e3d8] text-[#403c35]";
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/project-requests", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Projeler alınamadı.");
        }

        const data = await response.json();

        const list =
          Array.isArray(data)
            ? data
            : data.projectRequests ??
              data.requests ??
              data.data ??
              [];

        setProjects(list);
      } catch (err) {
        console.error(err);
        setError("Projeler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const activeProjects = projects.filter(
    (project) =>
      !["KAYBEDILDI", "TAMAMLANDI"].includes(project.status)
  );

  const completedProjects = projects.filter(
    (project) =>
      ["KAZANILDI", "TAMAMLANDI"].includes(project.status)
  );

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#161616]">
      <div className="mx-auto max-w-[1120px] px-6 py-12">

        <div className="mb-10 flex items-end justify-between border-b border-[#d8d3c8] pb-8">
          <div>
            <Link
              href="/admin/project-requests"
              className="mb-8 block text-[10px] uppercase tracking-[0.22em] text-[#7d776c]"
            >
              ← Proje Talepleri
            </Link>

            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#8b8478]">
              Yönetim Paneli
            </p>

            <h1 className="text-[52px] font-light leading-none tracking-[-0.04em]">
              İşler / Projeler
            </h1>

            <p className="mt-4 text-sm text-[#777064]">
              Şirket bünyesindeki proje süreçlerini tek merkezden takip edin.
            </p>
          </div>

          <div className="hidden text-right md:block">
            <div className="text-[18px] font-medium tracking-[0.35em]">
              ERKANOĞLU
            </div>
            <div className="mt-2 text-[9px] tracking-[0.18em] text-[#a0988b]">
              MİMARLIK · MÜHENDİSLİK · İNŞAAT
            </div>
          </div>
        </div>

        <section className="mb-8 grid grid-cols-1 border border-[#cec8bc] bg-[#eee9df] md:grid-cols-3">
          <div className="border-b border-[#cec8bc] p-6 md:border-b-0 md:border-r">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8a8377]">
              Toplam İş
            </p>
            <p className="mt-3 text-4xl font-light">
              {loading ? "—" : projects.length}
            </p>
          </div>

          <div className="border-b border-[#cec8bc] p-6 md:border-b-0 md:border-r">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8a8377]">
              Aktif İş
            </p>
            <p className="mt-3 text-4xl font-light">
              {loading ? "—" : activeProjects.length}
            </p>
          </div>

          <div className="p-6">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8a8377]">
              Tamamlanan
            </p>
            <p className="mt-3 text-4xl font-light">
              {loading ? "—" : completedProjects.length}
            </p>
          </div>
        </section>

        <section className="border border-[#cec8bc] bg-[#f8f5ef]">
          <div className="flex items-center justify-between border-b border-[#d8d3c8] px-6 py-5">
            <div>
              <h2 className="text-lg font-normal">
                Proje Süreçleri
              </h2>
              <p className="mt-1 text-xs text-[#918a7e]">
                Mevcut proje taleplerinden oluşturulan işler.
              </p>
            </div>

            <div className="text-[9px] uppercase tracking-[0.2em] text-[#8b8478]">
              {projects.length} İŞ
            </div>
          </div>

          {loading && (
            <div className="px-6 py-12 text-sm text-[#777064]">
              Projeler yükleniyor...
            </div>
          )}

          {error && (
            <div className="px-6 py-12 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="px-6 py-12 text-sm text-[#777064]">
              Henüz kayıtlı proje bulunmuyor.
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="divide-y divide-[#ddd7cc]">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="grid gap-6 px-6 py-6 md:grid-cols-[1.4fr_1fr_1fr_auto]"
                >
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">
                      Müşteri
                    </p>

                    <p className="mt-2 text-base">
                      {project.fullName}
                    </p>

                    <p className="mt-1 text-xs text-[#817a6e]">
                      {project.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">
                      Proje
                    </p>

                    <p className="mt-2 text-sm">
                      {project.buildingType}
                    </p>

                    <p className="mt-1 text-xs text-[#817a6e]">
                      {project.approximateArea
                        ? `${project.approximateArea} m²`
                        : "Alan belirtilmedi"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">
                      Durum
                    </p>

                    <span
                      className={`mt-2 inline-flex px-3 py-2 text-[9px] font-medium uppercase tracking-[0.12em] ${getStatusClass(
                        project.status
                      )}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  <div className="flex items-center md:justify-end">
                    <Link
                      href={`/admin/project-requests/${project.id}`}
                      className="text-[9px] uppercase tracking-[0.18em] text-[#5e584e] hover:text-black"
                    >
                      Detay →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}