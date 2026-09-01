"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type FormData = {
  propertyType: string;
  area: string;
  floors: string;
  quality: string;
  district: string;
};

const propertyTypes = ["Müstakil Ev", "Villa", "Apartman", "Ticari Yapı", "Ofis"];

const qualities = [
  { value: "ekonomik", label: "Ekonomik", multiplier: 1 },
  { value: "standart", label: "Standart", multiplier: 1.15 },
  { value: "ust", label: "Üst Segment", multiplier: 1.35 },
  { value: "premium", label: "Premium", multiplier: 1.65 },
];

export default function EvimiHesaplaPage() {
  const [form, setForm] = useState<FormData>({ propertyType: "", area: "", floors: "1", quality: "standart", district: "" });
  const [showResult, setShowResult] = useState(false);

  const calculation = useMemo(() => {
    const area = Number(form.area);
    if (!area || area <= 0) return null;
    const selectedQuality = qualities.find((item) => item.value === form.quality) ?? qualities[1];
    const baseCost = 32000;
    const floorMultiplier = Math.max(1, Number(form.floors) || 1) > 2 ? 1.05 : 1;
    const low = area * baseCost * selectedQuality.multiplier * floorMultiplier;
    const high = low * 1.18;
    return { low: Math.round(low / 10000) * 10000, high: Math.round(high / 10000) * 10000 };
  }, [form]);

  function updateField(field: keyof FormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setShowResult(false);
  }

  function calculate() {
    if (!form.propertyType || !form.area || !form.quality) return;
    setShowResult(true);
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat("tr-TR").format(value);
  }

  const inquiryHref = `/proje-talebi?area=${encodeURIComponent(form.area)}&projectType=${encodeURIComponent(form.propertyType)}`;

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#171717]">
      <header className="border-b border-black/10 bg-[#f4f2ed]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="text-xl font-semibold tracking-[0.2em]">ERKANOĞLU</Link>
          <Link href="/" className="text-sm text-black/55 transition hover:text-black">← Ana Sayfa</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-12 pt-20 lg:px-10 lg:pb-16 lg:pt-28">
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">İlk fizibilite</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">
            Yapmak istediğiniz
            <br />
            yapının yaklaşık
            <br />
            <span className="text-black/35">maliyetini öğrenin.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-black/55">
            Birkaç temel bilgi girerek projenizin ilk aşamadaki yaklaşık maliyet aralığını görün. Bu hesaplama yalnızca ön fizibilite amacıyla hazırlanmıştır.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid overflow-hidden border border-black/10 bg-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 md:p-10 lg:p-14">
            <div className="mb-10">
              <span className="text-xs uppercase tracking-[0.25em] text-black/35">01 / Yapı bilgileri</span>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em]">Yapınızı tanımlayın.</h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-medium">Yapı tipi</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {propertyTypes.map((type) => (
                    <button key={type} type="button" onClick={() => updateField("propertyType", type)} className={`border px-5 py-4 text-left text-sm transition ${form.propertyType === type ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="area" className="mb-3 block text-sm font-medium">Yaklaşık yapı alanı</label>
                <div className="relative">
                  <input id="area" type="number" min="1" placeholder="Örn. 180" value={form.area} onChange={(event) => updateField("area", event.target.value)} className="w-full border border-black/15 bg-[#faf9f6] px-5 py-5 pr-16 text-lg outline-none transition focus:border-black" />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-black/40">m²</span>
                </div>
              </div>

              <div>
                <label htmlFor="floors" className="mb-3 block text-sm font-medium">Kat sayısı</label>
                <select id="floors" value={form.floors} onChange={(event) => updateField("floors", event.target.value)} className="w-full appearance-none border border-black/15 bg-[#faf9f6] px-5 py-5 outline-none focus:border-black">
                  <option value="1">1 kat</option>
                  <option value="2">2 kat</option>
                  <option value="3">3 kat</option>
                  <option value="4">4 kat</option>
                  <option value="5">5+ kat</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium">Yapı / malzeme seviyesi</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {qualities.map((quality) => (
                    <button key={quality.value} type="button" onClick={() => updateField("quality", quality.value)} className={`border px-5 py-4 text-left transition ${form.quality === quality.value ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}>
                      <span className="block text-sm font-medium">{quality.label}</span>
                      <span className={`mt-1 block text-xs ${form.quality === quality.value ? "text-white/55" : "text-black/40"}`}>Tahmini maliyet seviyesi</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="district" className="mb-3 block text-sm font-medium">İlçe <span className="ml-2 font-normal text-black/35">İsteğe bağlı</span></label>
                <input id="district" type="text" placeholder="Örn. Çanakkale Merkez" value={form.district} onChange={(event) => updateField("district", event.target.value)} className="w-full border border-black/15 bg-[#faf9f6] px-5 py-5 outline-none focus:border-black" />
              </div>

              <button type="button" onClick={calculate} disabled={!form.propertyType || !form.area} className="w-full bg-black px-6 py-5 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-black/20">
                Yaklaşık Maliyeti Hesapla →
              </button>
            </div>
          </div>

          <div className="flex min-h-[560px] flex-col justify-between bg-[#171717] p-7 text-white md:p-10 lg:p-14">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-white/35">02 / Sonuç</span>

              {!showResult || !calculation ? (
                <div className="mt-24">
                  <div className="text-7xl font-light tracking-[-0.06em] text-white/20">₺</div>
                  <h2 className="mt-8 max-w-md text-3xl font-medium leading-tight">Yapı bilgilerinizi girin.</h2>
                  <p className="mt-5 max-w-md leading-7 text-white/45">Hesaplama tamamlandığında burada yaklaşık maliyet aralığınızı göreceksiniz.</p>
                </div>
              ) : (
                <div className="mt-20">
                  <p className="text-sm text-white/45">Tahmini yapı maliyeti</p>
                  <div className="mt-5 text-4xl font-medium tracking-[-0.04em] md:text-5xl">
                    {formatPrice(calculation.low)}
                    <span className="mx-3 text-white/25">—</span>
                    {formatPrice(calculation.high)} TL
                  </div>
                  <div className="mt-8 h-px w-full bg-white/10" />
                  <div className="mt-8 grid gap-5 text-sm">
                    <div className="flex justify-between gap-4"><span className="text-white/40">Yapı tipi</span><span>{form.propertyType}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-white/40">Alan</span><span>{form.area} m²</span></div>
                    <div className="flex justify-between gap-4"><span className="text-white/40">Kat</span><span>{form.floors}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-white/40">Seviye</span><span>{qualities.find((item) => item.value === form.quality)?.label}</span></div>
                  </div>
                </div>
              )}
            </div>

            {showResult && calculation && (
              <div className="mt-16 border-t border-white/10 pt-8">
                <p className="max-w-md text-sm leading-6 text-white/45">
                  Bu değer ön fizibilite amaçlı yaklaşık bir aralıktır. Arsa, zemin, proje, ruhsat, yapı sistemi, bölgesel koşullar ve seçilecek malzemeler gerçek maliyeti değiştirebilir.
                </p>
                <Link href={inquiryHref} className="mt-7 inline-flex rounded-full bg-white px-7 py-4 text-sm font-medium text-black">
                  Bu Proje İçin Teklif Al →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div><span className="text-xs uppercase tracking-[0.25em] text-black/35">Mimarlık</span><h3 className="mt-4 text-xl font-medium">Yapının tasarımından başlayın.</h3></div>
            <div><span className="text-xs uppercase tracking-[0.25em] text-black/35">Mühendislik</span><h3 className="mt-4 text-xl font-medium">Tasarımı teknik olarak çözelim.</h3></div>
            <div><span className="text-xs uppercase tracking-[0.25em] text-black/35">Ruhsat</span><h3 className="mt-4 text-xl font-medium">Projeyi ruhsat sürecine taşıyalım.</h3></div>
          </div>
        </div>
      </section>

      <footer className="bg-[#171717] text-white/45">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between lg:px-10">
          <span className="tracking-[0.2em] text-white">ERKANOĞLU</span>
          <span>Çanakkale · Türkiye</span>
          <Link href="/" className="transition hover:text-white">Ana Sayfa</Link>
        </div>
      </footer>
    </main>
  );
}
