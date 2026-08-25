"use client";

import { FormEvent, useState } from "react";
import {
  CANAKKALE_DISTRICTS,
  CANAKKALE_NEIGHBORHOODS,
} from "../data/canakkale-addresses";

const interestAreas = [
  {
    value: "Arsam Var",
    title: "Arsam Var",
    description:
      "Arsam için neler yapılabileceğini ve yapılaşma imkanlarını öğrenmek istiyorum.",
  },
  {
    value: "Kişiye Özel Ön Tasarım",
    title: "Kişiye Özel Ön Tasarım",
    description:
      "Arsama ve ihtiyaçlarıma uygun bir ön tasarım çalışmasıyla projeme başlamak istiyorum.",
  },
  {
    value: "Ruhsat Proje Paketi",
    title: "Ruhsat Proje Paketi",
    description:
      "Yapım öncesi gerekli ruhsat proje ve teknik çalışmalarını tek merkezden yürütmek istiyorum.",
  },
  {
    value: "İnşaat / Anahtar Teslim",
    title: "İnşaat / Anahtar Teslim",
    description:
      "Projemin yapım ve uygulama sürecini tek merkezden yürütmek istiyorum.",
  },
  {
    value: "Mevcut Yapı / Yenileme",
    title: "Mevcut Yapı / Yenileme",
    description:
      "Mevcut yapımı yenilemek, dönüştürmek veya geliştirmek istiyorum.",
  },
  {
    value: "Yaşam Alanı / Mobilya",
    title: "Yaşam Alanı / Mobilya",
    description:
      "Yapının iç mekan ve yaşam alanı çözümlerini de birlikte planlamak istiyorum.",
  },
];

const buildingTypes = [
  "Villa / Müstakil Konut",
  "Konut",
  "Ticari Yapı",
  "Ofis",
  "Tadilat / Dönüşüm",
  "Diğer",
];

const projectStages = [
  "Arsam var, nereden başlayacağımı bilmiyorum",
  "Ruhsat projesi hazırlatmak istiyorum",
  "Kişiye özel ön tasarım istiyorum",
  "Projem hazır",
  "İnşaatım devam ediyor",
  "Mevcut yapımı yeniliyorum",
];

export default function LeadForm() {
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [message, setMessage] = useState("");

  const neighborhoods = district
    ? Array.from(new Set(CANAKKALE_NEIGHBORHOODS[district] ?? []))
    : [];

  function handleDistrictChange(value: string) {
    setDistrict(value);
    setNeighborhood("");
  }

  function toggleInterestArea(value: string) {
    setSelectedAreas((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setStatus("loading");
    setMessage("");

    const formData = new FormData(form);

    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),

      // İl sabit: Çanakkale
      province: "Çanakkale",

      district: String(formData.get("district") || "").trim(),

      neighborhood: String(
        formData.get("neighborhood") || ""
      ).trim(),

      buildingType: String(
        formData.get("buildingType") || ""
      ).trim(),

      projectStage: String(
        formData.get("projectStage") || ""
      ).trim(),

      approximateArea: String(
        formData.get("approximateArea") || ""
      ).trim(),

      interestAreas: selectedAreas,

      description: String(
        formData.get("description") || ""
      ).trim(),
    };

    if (
      !payload.fullName ||
      !payload.phone ||
      !payload.district ||
      !payload.neighborhood ||
      !payload.buildingType ||
      !payload.projectStage
    ) {
      setStatus("error");
      setMessage(
        "Lütfen zorunlu alanları doldurun."
      );
      return;
    }

    try {
      const response = await fetch(
        "/api/project-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Proje talebi gönderilemedi."
        );
      }

      setStatus("success");

      setMessage(
        "Talebinizi aldık. Projenizi inceleyip en kısa sürede sizinle iletişime geçeceğiz."
      );

      // Formu temizle
      form.reset();

      setDistrict("");
      setNeighborhood("");
      setSelectedAreas([]);
    } catch (error) {
      console.error(
        "Project request submit error:",
        error
      );

      setStatus("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Proje talebi oluşturulamadı."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-x-8 gap-y-8 md:grid-cols-2"
    >
      {/* AD SOYAD */}
      <Field
        label="AD SOYAD"
        name="fullName"
        placeholder="Adınız ve soyadınız"
        required
      />

      {/* TELEFON */}
      <Field
        label="TELEFON"
        name="phone"
        type="tel"
        placeholder="05__ ___ __ __"
        required
      />

      {/* İL */}
      <div>
        <label className="mb-3 block text-[10px] font-semibold tracking-[0.18em] text-black/50">
          İL
        </label>

        <input
          value="Çanakkale"
          readOnly
          className="w-full border-b border-black/30 bg-transparent py-4 text-base outline-none"
        />
      </div>

      {/* İLÇE */}
      <SelectField
        label="İLÇE"
        name="district"
        value={district}
        required
        onChange={handleDistrictChange}
      >
        <option value="">
          İlçe seçiniz
        </option>

        {CANAKKALE_DISTRICTS.map(
          (districtName) => (
            <option
              key={`district-${districtName}`}
              value={districtName}
            >
              {districtName}
            </option>
          )
        )}
      </SelectField>

      {/* KÖY / MAHALLE */}
      <SelectField
        label="KÖY / MAHALLE"
        name="neighborhood"
        value={neighborhood}
        required
        disabled={!district}
        onChange={setNeighborhood}
      >
        <option value="">
          {district
            ? "Köy / mahalle seçiniz"
            : "Önce ilçe seçiniz"}
        </option>

        {neighborhoods.map(
          (neighborhoodName, index) => (
            <option
              key={`${district}-${neighborhoodName}-${index}`}
              value={neighborhoodName}
            >
              {neighborhoodName}
            </option>
          )
        )}
      </SelectField>

      {/* YAPI TÜRÜ */}
      <SelectField
        label="YAPI TÜRÜ"
        name="buildingType"
        required
      >
        <option value="">
          Yapı türünü seçiniz
        </option>

        {buildingTypes.map((item) => (
          <option
            key={`building-${item}`}
            value={item}
          >
            {item}
          </option>
        ))}
      </SelectField>

      {/* PROJE AŞAMASI */}
      <SelectField
        label="PROJENİZ HANGİ AŞAMADA?"
        name="projectStage"
        required
      >
        <option value="">
          Projenizin aşamasını seçiniz
        </option>

        {projectStages.map((item) => (
          <option
            key={`stage-${item}`}
            value={item}
          >
            {item}
          </option>
        ))}
      </SelectField>

      {/* ALAN */}
      <Field
        label="YAKLAŞIK YAPI ALANI"
        name="approximateArea"
        placeholder="Örn. 250 m²"
      />

      {/* İHTİYAÇLAR */}
      <div className="md:col-span-2">
        <label className="mb-4 block text-[10px] font-semibold tracking-[0.18em] text-black/50">
          PROJENİZ İÇİN NEYE İHTİYACINIZ VAR?
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {interestAreas.map((item) => {
            const selected =
              selectedAreas.includes(
                item.value
              );

            return (
              <label
                key={`interest-${item.value}`}
                className={`relative cursor-pointer border p-5 transition ${
                  selected
                    ? "border-[#171914] bg-[#171914] text-white"
                    : "border-black/15 bg-transparent hover:border-black/40"
                }`}
              >
                <input
                  type="checkbox"
                  name="interestAreas"
                  value={item.value}
                  checked={selected}
                  onChange={() =>
                    toggleInterestArea(
                      item.value
                    )
                  }
                  className="sr-only"
                />

                <div className="pr-8">
                  <div className="text-sm font-medium">
                    {item.title}
                  </div>

                  <p
                    className={`mt-3 text-xs leading-5 ${
                      selected
                        ? "text-white/65"
                        : "text-black/50"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                <span
                  className={`absolute right-4 top-4 flex h-4 w-4 items-center justify-center border text-[10px] ${
                    selected
                      ? "border-white text-white"
                      : "border-black/30"
                  }`}
                >
                  {selected ? "✓" : ""}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* AÇIKLAMA */}
      <div className="md:col-span-2">
        <label className="mb-3 block text-[10px] font-semibold tracking-[0.18em] text-black/50">
          PROJENİZİ KISACA ANLATIN
        </label>

        <textarea
          name="description"
          rows={5}
          placeholder="Arsanız, ihtiyaçlarınız, hayalinizdeki yapı veya mevcut durum hakkında bize bilgi verebilirsiniz."
          className="w-full resize-none border-b border-black/30 bg-transparent py-4 text-base outline-none placeholder:text-black/35 focus:border-black"
        />
      </div>

      {/* BİLGİ */}
      <div className="md:col-span-2 border-t border-black/15 pt-7">
        <p className="text-xs leading-6 text-black/50">
          Paylaştığınız bilgiler projenizi
          ön değerlendirmek ve sizinle
          iletişime geçmek amacıyla
          kullanılacaktır.
        </p>
      </div>

      {/* SONUÇ MESAJI */}
      {message && (
        <div
          className={`md:col-span-2 border px-5 py-4 text-sm ${
            status === "success"
              ? "border-black/15 bg-white/30 text-black"
              : "border-red-500/30 bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* GÖNDER */}
      <div className="md:col-span-2">
        <button
          disabled={status === "loading"}
          type="submit"
          className="flex w-full items-center justify-between bg-[#171914] px-8 py-6 text-[11px] font-semibold tracking-[0.2em] text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-60"
        >
          <span>
            {status === "loading"
              ? "GÖNDERİLİYOR..."
              : "PROJEMİ GÖNDER"}
          </span>

          <span className="text-xl">
            →
          </span>
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-3 block text-[10px] font-semibold tracking-[0.18em] text-black/50">
        {label}
      </label>

      <input
        required={required}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full border-b border-black/30 bg-transparent py-4 text-base outline-none placeholder:text-black/35 focus:border-black"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  required = false,
  disabled = false,
  onChange,
  children,
}: {
  label: string;
  name: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (
    value: string
  ) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-3 block text-[10px] font-semibold tracking-[0.18em] text-black/50">
        {label}
      </label>

      <select
        required={required}
        disabled={disabled}
        name={name}
        value={value}
        onChange={(event) =>
          onChange?.(
            event.target.value
          )
        }
        className="w-full border-b border-black/30 bg-transparent py-4 text-base outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
}