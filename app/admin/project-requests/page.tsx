"use client";

import { use, useEffect, useState } from "react";
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
  { value: "GORUSULDU", label: "Görüşüldü" },
  {
    value: "TEKLIF_HAZIRLANIYOR",
    label: "Teklif Hazırlanıyor",
  },
  {
    value: "TEKLIF_GONDERILDI",
    label: "Teklif Gönderildi",
  },
  {
    value: "ONAY_BEKLENIYOR",
    label: "Onay Bekleniyor",
  },
  {
    value: "PROJE_BASLADI",
    label: "Proje Başladı",
  },
  {
    value: "TAMAMLANDI",
    label: "Tamamlandı",
  },
];

const processSteps = [
  { value: "YENI", label: "Talep" },
  { value: "INCELENIYOR", label: "İnceleme" },
  { value: "GORUSULDU", label: "Görüşme" },
  { value: "TEKLIF_HAZIRLANIYOR", label: "Teklif" },
  { value: "TEKLIF_GONDERILDI", label: "Teklif Gönderildi" },
  { value: "ONAY_BEKLENIYOR", label: "Onay" },
  { value: "PROJE_BASLADI", label: "Proje" },
  { value: "TAMAMLANDI", label: "Tamamlandı" },
];

function statusLabel(status: string) {
  return (
    statusOptions.find((item) => item.value === status)?.label ??
    status
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="grid grid-cols-[135px_1fr] border-b border-[#ddd8ce] py-4 last:border-b-0">
      <span className="text-[9px] uppercase tracking-[0.18em] text-[#918a7e]">
        {label}
      </span>

      <span className="text-sm text-[#282621]">
        {value || "-"}
      </span>
    </div>
  );
}

export default function ProjectRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [projectRequest, setProjectRequest] =
    useState<ProjectRequest | null>(null);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequest() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/project-requests/${id}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Proje talebi alınamadı.");
        }

        const data = await response.json();

        const request =
          data.projectRequest ??
          data.request ??
          data.data ??
          data;

        setProjectRequest(request);
        setSelectedStatus(request.status);
      } catch (error) {
        console.error(error);
        setError("Proje talebi alınamadı.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadRequest();
    }
  }, [id]);

  async function updateStatus(
    newStatus: string
  ) {
    if (!projectRequest) return;

    setSelectedStatus(newStatus);

    if (newStatus === projectRequest.status) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/project-requests/${projectRequest.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Durum güncellenemedi.");
      }

      const data = await response.json();

      const updatedRequest =
        data.projectRequest ??
        data.request ??
        data.data ??
        data;

      setProjectRequest(updatedRequest);
      setSelectedStatus(updatedRequest.status);
    } catch (error) {
      console.error(error);
      setError("Durum güncellenemedi.");
      setSelectedStatus(projectRequest.status);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] px-6 py-16">
        <div className="mx-auto max-w-[960px]">
          <p className="text-sm text-[#777064]">
            Proje talebi yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  if (!projectRequest) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] px-6 py-16">
        <div className="mx-auto max-w-[960px]">
          <p className="text-sm text-red-700">
            {error || "Proje talebi bulunamadı."}
          </p>

          <Link
            href="/admin/project-requests"
            className="mt-6 inline-block text-[10px] uppercase tracking-[0.2em]"
          >
            ← Taleplere Dön
          </Link>
        </div>
      </main>
    );
  }

  const currentStepIndex = processSteps.findIndex(
    (step) => step.value === projectRequest.status
  );

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#171717]">
      <div className="mx-auto max-w-[960px] px-6 py-12">

        {/* HEADER */}

        <div className="mb-8 border-b border-[#d8d3c8] pb-8">
          <Link
            href="/admin/project-requests"
            className="mb-8 block text-[10px] uppercase tracking-[0.22em] text-[#7e776b]"
          >
            ← Proje Talepleri
          </Link>

          <div className="flex items-end justify-between">
            <div>
              <p className="mb-3 text-[9px] uppercase tracking-[0.25em] text-[#8d8579]">
                Proje Talebi
              </p>

              <h1 className="text-[42px] font-light tracking-[-0.04em]">
                {projectRequest.fullName}
              </h1>
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#8d8579]">
                Talep No
              </p>

              <p className="mt-2 text-xl font-light">
                #{projectRequest.id}
              </p>
            </div>
          </div>
        </div>

        {/* STATUS */}

        <section className="mb-7 grid border border-[#d8d3c8] bg-[#f8f5ef] md:grid-cols-2">

          <div className="p-7 md:border-r border-[#d8d3c8]">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#8d8579]">
              Mevcut Durum
            </p>

            <p className="mt-3 text-2xl font-light">
              {statusLabel(projectRequest.status)}
            </p>
          </div>

          <div className="p-7">
            <label
              htmlFor="status"
              className="block text-[9px] uppercase tracking-[0.2em] text-[#8d8579]"
            >
              Durumu Güncelle
            </label>

            <select
              id="status"
              value={selectedStatus}
              disabled={saving}
              onChange={(event) =>
                updateStatus(event.target.value)
              }
              className="mt-3 w-full border border-[#aaa398] bg-[#f8f5ef] px-4 py-3 text-sm outline-none focus:border-black"
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

            {saving && (
              <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-[#8b8478]">
                Kaydediliyor...
              </p>
            )}

            {error && (
              <p className="mt-2 text-xs text-red-700">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* PROJE SÜRECİ */}

        <section className="mb-7 border border-[#d8d3c8] bg-[#f8f5ef]">

          <div className="border-b border-[#d8d3c8] px-7 py-6">
            <p className="text-[9px] uppercase tracking-[0.22em] text-[#8d8579]">
              Proje Süreci
            </p>

            <h2 className="mt-2 text-xl font-light">
              İşin mevcut aşaması
            </h2>
          </div>

          <div className="overflow-x-auto px-7 py-8">
            <div className="flex min-w-[760px] items-start">

              {processSteps.map((step, index) => {
                const completed =
                  currentStepIndex >= 0 &&
                  index < currentStepIndex;

                const active =
                  index === currentStepIndex;

                return (
                  <div
                    key={step.value}
                    className="flex flex-1 items-start"
                  >
                    <div className="flex min-w-[80px] flex-col items-center">

                      <div
                        className={[
                          "flex h-9 w-9 items-center justify-center border text-[10px]",
                          completed
                            ? "border-black bg-black text-white"
                            : active
                            ? "border-[#b89a55] bg-[#ead9a7] text-[#3c321d]"
                            : "border-[#cec8bc] bg-[#f8f5ef] text-[#999185]",
                        ].join(" ")}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      <p
                        className={[
                          "mt-3 whitespace-nowrap text-center text-[9px] uppercase tracking-[0.1em]",
                          active
                            ? "font-medium text-black"
                            : "text-[#8d8579]",
                        ].join(" ")}
                      >
                        {step.label}
                      </p>
                    </div>

                    {index < processSteps.length - 1 && (
                      <div
                        className={[
                          "mt-[18px] h-px flex-1",
                          completed
                            ? "bg-black"
                            : "bg-[#d8d3c8]",
                        ].join(" ")}
                      />
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* BİLGİLER */}

        <div className="grid gap-7 md:grid-cols-2">

          <section className="border border-[#d8d3c8] bg-[#f8f5ef] p-7">
            <p className="mb-5 text-[9px] uppercase tracking-[0.22em] text-[#8d8579]">
              Müşteri Bilgileri
            </p>

            <InfoRow
              label="Ad Soyad"
              value={projectRequest.fullName}
            />

            <InfoRow
              label="Telefon"
              value={projectRequest.phone}
            />
          </section>

          <section className="border border-[#d8d3c8] bg-[#f8f5ef] p-7">
            <p className="mb-5 text-[9px] uppercase tracking-[0.22em] text-[#8d8579]">
              Proje Konumu
            </p>

            <InfoRow
              label="İl"
              value={projectRequest.province}
            />

            <InfoRow
              label="İlçe"
              value={projectRequest.district}
            />

            <InfoRow
              label="Mahalle / Köy"
              value={projectRequest.neighborhood}
            />
          </section>

        </div>

        <div className="mt-7 grid gap-7 md:grid-cols-2">

          <section className="border border-[#d8d3c8] bg-[#f8f5ef] p-7">
            <p className="mb-5 text-[9px] uppercase tracking-[0.22em] text-[#8d8579]">
              Yapı Bilgileri
            </p>

            <InfoRow
              label="Yapı Türü"
              value={projectRequest.buildingType}
            />

            <InfoRow
              label="Proje Aşaması"
              value={projectRequest.projectStage}
            />

            <InfoRow
              label="Yaklaşık Alan"
              value={
                projectRequest.approximateArea
                  ? `${projectRequest.approximateArea} m²`
                  : "-"
              }
            />
          </section>

          <section className="border border-[#d8d3c8] bg-[#f8f5ef] p-7">
            <p className="mb-5 text-[9px] uppercase tracking-[0.22em] text-[#8d8579]">
              Talep Bilgileri
            </p>

            <InfoRow
              label="İlgilenilen Alanlar"
              value={projectRequest.interestAreas}
            />

            <InfoRow
              label="Talep Tarihi"
              value={formatDate(projectRequest.createdAt)}
            />
          </section>

        </div>

        {/* AÇIKLAMA */}

        <section className="mt-7 border border-[#d8d3c8] bg-[#f8f5ef] p-7">
          <p className="mb-5 text-[9px] uppercase tracking-[0.22em] text-[#8d8579]">
            Müşterinin Açıklaması
          </p>

          <div className="border-t border-[#ddd8ce] pt-5 text-sm leading-7 text-[#403c35]">
            {projectRequest.description ||
              "Açıklama bulunmuyor."}
          </div>
        </section>

        {/* FOOTER */}

        <div className="mt-8 flex justify-between border-t border-[#d8d3c8] pt-6">
          <Link
            href="/admin/project-requests"
            className="text-[9px] uppercase tracking-[0.18em] text-[#70695e]"
          >
            ← Tüm Talepler
          </Link>

          <p className="text-[9px] uppercase tracking-[0.18em] text-[#999185]">
            Güncellendi:{" "}
            {formatDate(projectRequest.updatedAt)}
          </p>
        </div>

      </div>
    </main>
  );
}