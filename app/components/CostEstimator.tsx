"use client";

import { useMemo, useState } from "react";

type ProjectType = "villa" | "konut" | "ticari";
type Quality = "standart" | "ust" | "premium";

type ExtraKey = "havuz" | "bodrum" | "garaj" | "teras";

const rates: Record<ProjectType, [number, number]> = {
  villa: [32000, 48000],
  konut: [28000, 42000],
  ticari: [30000, 50000],
};

const qualityMultipliers: Record<Quality, number> = {
  standart: 1,
  ust: 1.2,
  premium: 1.45,
};

const qualityLabels: Record<Quality, string> = {
  standart: "Standart",
  ust: "Üst Segment",
  premium: "Premium",
};

const extraCosts: Record<ExtraKey, number> = {
  havuz: 750000,
  bodrum: 18000,
  garaj: 450000,
  teras: 300000,
};

const extraLabels: Record<ExtraKey, string> = {
  havuz: "Yüzme Havuzu",
  bodrum: "Bodrum Kat",
  garaj: "Kapalı Garaj",
  teras: "Geniş Teras",
};

function formatTL(value: number) {
  return `${Math.round(value).toLocaleString("tr-TR")} TL`;
}

export default function CostEstimator() {
  const [type, setType] = useState<ProjectType>("villa");
  const [area, setArea] = useState("");
  const [floors, setFloors] = useState("2");
  const [quality, setQuality] = useState<Quality>("standart");

  const [extras, setExtras] = useState<Record<ExtraKey, boolean>>({
    havuz: false,
    bodrum: false,
    garaj: false,
    teras: false,
  });

  const [calculated, setCalculated] = useState(false);

  const calculation = useMemo(() => {
    const numericArea = Number(area);

    if (!numericArea || numericArea < 30) {
      return null;
    }

    const [minRate, maxRate] = rates[type];
    const qualityMultiplier = qualityMultipliers[quality];

    let min = numericArea * minRate * qualityMultiplier;
    let max = numericArea * maxRate * qualityMultiplier;

    const floorMultiplier =
      floors === "1"
        ? 0.97
        : floors === "2"
          ? 1
          : floors === "3"
            ? 1.04
            : 1.08;

    min *= floorMultiplier;
    max *= floorMultiplier;

    if (extras.havuz) {
      min += extraCosts.havuz * 0.85;
      max += extraCosts.havuz * 1.15;
    }

    if (extras.bodrum) {
      min += numericArea * extraCosts.bodrum * 0.85;
      max += numericArea * extraCosts.bodrum * 1.15;
    }

    if (extras.garaj) {
      min += extraCosts.garaj * 0.85;
      max += extraCosts.garaj * 1.15;
    }

    if (extras.teras) {
      min += extraCosts.teras * 0.85;
      max += extraCosts.teras * 1.15;
    }

    return {
      min,
      max,
      area: numericArea,
    };
  }, [area, type, floors, quality, extras]);

  function updateField(callback: () => void) {
    callback();
    setCalculated(false);
  }

  function toggleExtra(name: ExtraKey) {
    setExtras((current) => ({
      ...current,
      [name]: !current[name],
    }));

    setCalculated(false);
  }

  function calculate() {
    if (!area || Number(area) < 30) {
      setCalculated(false);
      return;
    }

    setCalculated(true);
  }

  return (
    <section className="border border-black/10 bg-[#eee8dc]">
      {/* HEADER */}
      <div className="border-b border-black/10 px-6 py-7 sm:px-9">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-black/45">
          EVİMİ HESAPLA
        </p>

        <h2 className="mt-3 text-2xl font-light tracking-[-0.03em] text-black sm:text-3xl">
          Yapınız için ön maliyet oluşturun.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
          Yapınızın temel özelliklerini seçin. Size proje ve uygulama
          aşamasına geçmeden önce yaklaşık bir maliyet aralığı sunalım.
        </p>
      </div>

      <div className="px-6 py-7 sm:px-9 sm:py-9">
        {/* TEMEL BİLGİLER */}
        <div>
          <div className="mb-6">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-black/40">
              01 / YAPI BİLGİLERİ
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2">
            {/* YAPI TÜRÜ */}
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold tracking-[0.15em] text-black/50">
                YAPI TÜRÜ
              </span>

              <select
                value={type}
                onChange={(e) =>
                  updateField(() =>
                    setType(e.target.value as ProjectType)
                  )
                }
                className="w-full border-b border-black/25 bg-transparent py-3 outline-none"
              >
                <option value="villa">Villa / Müstakil Konut</option>
                <option value="konut">Konut</option>
                <option value="ticari">Ticari Yapı</option>
              </select>
            </label>

            {/* ALAN */}
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold tracking-[0.15em] text-black/50">
                YAKLAŞIK YAPI ALANI
              </span>

              <div className="flex items-center border-b border-black/25">
                <input
                  value={area}
                  onChange={(e) =>
                    updateField(() => setArea(e.target.value))
                  }
                  type="number"
                  min="30"
                  placeholder="Örn. 180"
                  className="w-full bg-transparent py-3 outline-none placeholder:text-black/30"
                />

                <span className="text-sm text-black/40">m²</span>
              </div>
            </label>

            {/* KAT */}
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold tracking-[0.15em] text-black/50">
                KAT SAYISI
              </span>

              <select
                value={floors}
                onChange={(e) =>
                  updateField(() => setFloors(e.target.value))
                }
                className="w-full border-b border-black/25 bg-transparent py-3 outline-none"
              >
                <option value="1">Tek Kat</option>
                <option value="2">2 Kat</option>
                <option value="3">3 Kat</option>
                <option value="4">4 Kat ve üzeri</option>
              </select>
            </label>

            {/* STANDART */}
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold tracking-[0.15em] text-black/50">
                YAPI STANDARDI
              </span>

              <select
                value={quality}
                onChange={(e) =>
                  updateField(() =>
                    setQuality(e.target.value as Quality)
                  )
                }
                className="w-full border-b border-black/25 bg-transparent py-3 outline-none"
              >
                {Object.entries(qualityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* EK ÖZELLİKLER */}
        <div className="mt-10 border-t border-black/10 pt-8">
          <div className="mb-6">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-black/40">
              02 / EK ÖZELLİKLER
            </p>

            <p className="mt-2 text-sm text-black/50">
              Projenizde bulunmasını istediğiniz özellikleri seçin.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(extraLabels) as ExtraKey[]).map((key) => {
              const active = extras[key];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleExtra(key)}
                  className={`flex items-center justify-between border px-5 py-4 text-left transition ${
                    active
                      ? "border-black bg-black/[0.05]"
                      : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <span className="text-sm text-black/70">
                    {extraLabels[key]}
                  </span>

                  <span
                    className={`flex h-5 w-5 items-center justify-center border text-[11px] ${
                      active
                        ? "border-black bg-black text-white"
                        : "border-black/30"
                    }`}
                  >
                    {active ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HESAPLAMA */}
        <div className="mt-10 border-t border-black/10 pt-8">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-black/40">
                03 / ÖN MALİYET
              </p>

              <p className="mt-3 max-w-md text-sm leading-6 text-black/50">
                Girilen bilgiler üzerinden yaklaşık yapım maliyeti
                aralığı hesaplanır.
              </p>
            </div>

            <button
              type="button"
              onClick={calculate}
              className="bg-[#171914] px-7 py-4 text-[10px] font-semibold tracking-[0.16em] text-white transition hover:bg-black"
            >
              MALİYETİ HESAPLA →
            </button>
          </div>

          {/* SONUÇ */}
          <div className="mt-8 border border-black/10 bg-[#f5f1e9] p-6 sm:p-8">
            <p className="text-[9px] font-semibold tracking-[0.18em] text-black/40">
              TAHMİNİ YAPIM MALİYETİ
            </p>

            <div className="mt-3 text-3xl font-light tracking-[-0.04em] sm:text-4xl">
              {calculated && calculation ? (
                <div>
                  {formatTL(calculation.min)}
                  <span className="mx-2 text-black/25">—</span>
                  {formatTL(calculation.max)}
                </div>
              ) : (
                <span className="text-black/20">—</span>
              )}
            </div>

            {calculated && calculation && (
              <>
                <div className="mt-6 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-3">
                  <div>
                    <p className="text-[9px] tracking-[0.14em] text-black/40">
                      YAPI ALANI
                    </p>

                    <p className="mt-2 text-sm">
                      {calculation.area.toLocaleString("tr-TR")} m²
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] tracking-[0.14em] text-black/40">
                      YAPI TÜRÜ
                    </p>

                    <p className="mt-2 text-sm">
                      {type === "villa"
                        ? "Villa / Müstakil"
                        : type === "konut"
                          ? "Konut"
                          : "Ticari Yapı"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] tracking-[0.14em] text-black/40">
                      STANDARD
                    </p>

                    <p className="mt-2 text-sm">
                      {qualityLabels[quality]}
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-black/10 pt-6">
                  <p className="max-w-3xl text-xs leading-6 text-black/50">
                    Bu hesaplama yalnızca ön değerlendirme amacıyla
                    hazırlanmıştır. Kesin maliyet; arsa ve imar koşulları,
                    zemin durumu, mimari ve mühendislik projeleri, yapı
                    sistemi, malzeme seçimleri, işçilik, ruhsat kapsamı ve
                    uygulama detayları incelendikten sonra belirlenir.
                  </p>

                  <a
                    href="/proje-talebi"
                    className="mt-6 block bg-[#171914] px-6 py-5 text-center text-[10px] font-semibold tracking-[0.16em] text-white transition hover:bg-black"
                  >
                    PROJENİZİ BİRLİKTE PLANLAYALIM →
                  </a>
                </div>
              </>
            )}
          </div>

          {/* HATA */}
          {!calculated && area && Number(area) < 30 && (
            <p className="mt-4 text-xs text-red-800">
              Lütfen en az 30 m² yapı alanı girin.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}