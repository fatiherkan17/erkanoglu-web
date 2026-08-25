"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const statusOptions = [
  { value: "YENI", label: "Yeni" },
  { value: "INCELENIYOR", label: "İnceleniyor" },
  { value: "TEKLIF_HAZIRLANIYOR", label: "Teklif Hazırlanıyor" },
  { value: "TEKLIF_SUNULDU", label: "Teklif Sunuldu" },
  { value: "ANLASILDI", label: "Anlaşıldı" },
  { value: "PROJE_BASLADI", label: "Proje Başladı" },
  { value: "TAMAMLANDI", label: "Tamamlandı" },
  { value: "IPTAL", label: "İptal" },
];

function getStatusLabel(status: string) {
  return (
    statusOptions.find((item) => item.value === status)?.label ?? status
  );
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [project, setProject] = useState<ProjectRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/project-requests/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Proje alınamadı.");
        }

        const result = await response.json();

        /*
         * API farklı şekillerde veri döndürse bile
         * gerçek proje nesnesini bul.
         */
        const projectData =
          result?.project ??
          result?.data ??
          result?.projectRequest ??
          result;

        if (!projectData || !projectData.id) {
          throw new Error("Geçersiz proje verisi.");
        }

        setProject(projectData);
      } catch (err) {
        console.error("Project detail error:", err);
        setError("Proje bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id]);

  async function updateStatus(status: string) {
    if (!project) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/project-requests/${project.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Durum güncellenemedi.");
      }

      const result = await response.json();

      const updatedProject =
        result?.project ??
        result?.data ??
        result?.projectRequest ??
        result;

      setProject((current) => ({
        ...(current as ProjectRequest),
        ...(updatedProject ?? {}),
        status,
      }));
    } catch (err) {
      console.error("Status update error:", err);
      setError("Durum güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Proje yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f7f5f0] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/admin/projects"
            className="text-[10px] uppercase tracking-[0.2em] text-neutral-500"
          >
            ← İşler / Projeler
          </Link>

          <div className="mt-10 border border-neutral-300 bg-[#faf9f6] p-8">
            <p className="text-sm text-red-700">
              {error || "Proje bulunamadı."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-6 py-14">
      <div className="mx-auto max-w-5xl">

        {/* ÜST */}
        <Link
          href="/admin/projects"
          className="text-[10px] uppercase tracking-[0.2em] text-neutral-500"
        >
          ← İşler / Projeler
        </Link>

        <div className="mt-10 flex items-end justify-between border-b border-neutral-300 pb-8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">
              Proje
            </p>

            <h1 className="mt-3 text-4xl font-light tracking-tight">
              {project.fullName}
            </h1>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500">
              Proje No
            </p>

            <p className="mt-2 text-xl">
              #{project.id}
            </p>
          </div>
        </div>

        {/* DURUM */}
        <section className="mt-7 border border-neutral-300 bg-[#faf9f6] p-7">
          <div className="flex items-center justify-between gap-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                Mevcut Durum
              </p>

              <p className="mt-3 text-2xl font-light">
                {getStatusLabel(project.status)}
              </p>
            </div>

            <div className="w-64">
              <label className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                Durumu Güncelle
              </label>

              <select
                value={project.status}
                disabled={saving}
                onChange={(event) =>
                  updateStatus(event.target.value)
                }
                className="mt-2 w-full border border-neutral-500 bg-transparent px-4 py-3 text-sm outline-none"
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="mt-5 text-xs text-red-700">
              {error}
            </p>
          )}
        </section>

        {/* MÜŞTERİ / KONUM */}
        <div className="mt-7 grid gap-7 md:grid-cols-2">

          <InfoCard title="Müşteri Bilgileri">
            <InfoRow
              label="Ad Soyad"
              value={project.fullName}
            />

            <InfoRow
              label="Telefon"
              value={project.phone}
            />
          </InfoCard>

          <InfoCard title="Proje Konumu">
            <InfoRow
              label="İl"
              value={project.province}
            />

            <InfoRow
              label="İlçe"
              value={project.district}
            />

            <InfoRow
              label="Mahalle / Köy"
              value={project.neighborhood}
            />
          </InfoCard>

        </div>

        {/* YAPI / TALEP */}
        <div className="mt-7 grid gap-7 md:grid-cols-2">

          <InfoCard title="Yapı Bilgileri">
            <InfoRow
              label="Yapı Türü"
              value={project.buildingType}
            />

            <InfoRow
              label="Proje Aşaması"
              value={project.projectStage}
            />

            <InfoRow
              label="Yaklaşık Alan"
              value={project.approximateArea || "-"}
            />
          </InfoCard>

          <InfoCard title="Talep Bilgileri">
            <InfoRow
              label="İlgilenilen Alanlar"
              value={project.interestAreas}
            />

            <InfoRow
              label="Talep Tarihi"
              value={formatDate(project.createdAt)}
            />
          </InfoCard>

        </div>

        {/* AÇIKLAMA */}
        <section className="mt-7 border border-neutral-300 bg-[#faf9f6] p-7">
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Müşterinin Açıklaması
          </p>

          <div className="mt-5 border-t border-neutral-200 pt-5 text-sm leading-7 text-neutral-700">
            {project.description || "Açıklama bulunmuyor."}
          </div>
        </section>

        {/* PROJE SÜRECİ */}
        <section className="mt-7 border border-neutral-300 bg-[#faf9f6] p-7">
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Proje Süreci
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">

            <ProcessStep
              number="01"
              title="Talep"
              active
            />

            <ProcessStep
              number="02"
              title="İnceleme"
              active={[
                "INCELENIYOR",
                "TEKLIF_HAZIRLANIYOR",
                "TEKLIF_SUNULDU",
                "ANLASILDI",
                "PROJE_BASLADI",
                "TAMAMLANDI",
              ].includes(project.status)}
            />

            <ProcessStep
              number="03"
              title="Teklif"
              active={[
                "TEKLIF_HAZIRLANIYOR",
                "TEKLIF_SUNULDU",
                "ANLASILDI",
                "PROJE_BASLADI",
                "TAMAMLANDI",
              ].includes(project.status)}
            />

            <ProcessStep
              number="04"
              title="Proje"
              active={[
                "PROJE_BASLADI",
                "TAMAMLANDI",
              ].includes(project.status)}
            />

          </div>
        </section>

        {/* ALT BİLGİ */}
        <div className="mt-7 border-t border-neutral-300 pt-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">
            Son Güncelleme
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            {formatDate(project.updatedAt)}
          </p>
        </div>

      </div>
    </main>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-neutral-300 bg-[#faf9f6] p-7">
      <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
        {title}
      </p>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-6 border-b border-neutral-200 py-4 last:border-b-0">
      <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm text-neutral-800">
        {value || "-"}
      </span>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  active,
}: {
  number: string;
  title: string;
  active: boolean;
}) {
  return (
    <div
      className={`border p-5 ${
        active
          ? "border-neutral-500 bg-[#eee9dd]"
          : "border-neutral-200 bg-transparent"
      }`}
    >
      <p className="text-[9px] tracking-[0.2em] text-neutral-500">
        {number}
      </p>

      <p className="mt-3 text-sm">
        {title}
      </p>
    </div>
  );
}