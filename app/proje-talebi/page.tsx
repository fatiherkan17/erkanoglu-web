"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ProjeTalebiContent() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    projectType: "",
    district: "",
    area: "",
    timeline: "",
    budget: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit() {
    if (!form.fullName || !form.phone || !form.projectType) {
      setError("Lütfen ad, telefon ve proje türünü doldurun.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/project-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          province: "Çanakkale",
          district: form.district || "Belirtilmedi",
          neighborhood: "Belirtilmedi",
          buildingType: form.projectType,
          projectStage: "Ön Görüşme",
          approximateArea:
            form.area || searchParams.get("area") || null,
          interestAreas: "Mimarlık / Ruhsat Projesi",
          description: `
E-posta: ${form.email || "Belirtilmedi"}
Zamanlama: ${form.timeline || "Belirtilmedi"}
Bütçe: ${form.budget || "Belirtilmedi"}

${form.description}
          `.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Talep gönderilemedi.");
      }

      setSuccess(true);
    } catch {
      setError(
        "Talebiniz gönderilirken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#f4f2ed] text-[#171717]">
        <header className="border-b border-black/10">
          <div className="mx-auto flex h-20 max-w-7xl items-center px-6 lg:px-10">
            <Link
              href="/"
              className="text-xl font-semibold tracking-[0.2em]"
            >
              ERKANOĞLU
            </Link>
          </div>
        </header>

        <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 lg:px-10">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-[0.3em] text-black/35">
              Talebiniz alındı
            </span>

            <h1 className="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">
              Projenizin ilk
              <br />
              adımını attınız.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-black/55">
              Bilgilerinizi aldık. Projenizi değerlendirdikten sonra
              sizinle iletişime geçeceğiz.
            </p>

            <Link
              href="/"
              className="mt-10 inline-flex rounded-full bg-black px-7 py-4 text-sm text-white"
            >
              Ana Sayfaya Dön →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-[#171717]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="text-xl font-semibold tracking-[0.2em]"
          >
            ERKANOĞLU
          </Link>

          <span className="text-sm text-black/40">
            Proje Başlangıcı
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-black/35">
              Projenizi anlatın
            </span>

            <h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">
              Birlikte
              <br />
              başlayalım.
            </h1>

            <p className="mt-8 max-w-md text-lg leading-8 text-black/55">
              Henüz her şeyi bilmenize gerek yok. Projenizi mümkün
              olduğunca kısaca anlatın; ilk değerlendirmeyi birlikte
              yapalım.
            </p>

            <div className="mt-12 border-t border-black/10 pt-6 text-sm text-black/45">
              Mimarlık · Mühendislik · Ruhsat · Yapı
            </div>
          </div>

          <div className="bg-white p-7 md:p-10 lg:p-14">
            <div className="grid gap-7">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ad Soyad *
                </label>

                <input
                  value={form.fullName}
                  onChange={(e) =>
                    update("fullName", e.target.value)
                  }
                  placeholder="Adınız Soyadınız"
                  className="w-full border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                />
              </div>

              <div className="grid gap-7 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Telefon *
                  </label>

                  <input
                    value={form.phone}
                    onChange={(e) =>
                      update("phone", e.target.value)
                    }
                    placeholder="05XX XXX XX XX"
                    className="w-full border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    E-posta
                  </label>

                  <input
                    value={form.email}
                    onChange={(e) =>
                      update("email", e.target.value)
                    }
                    placeholder="ornek@mail.com"
                    className="w-full border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ne yapmak istiyorsunuz? *
                </label>

                <select
                  value={form.projectType}
                  onChange={(e) =>
                    update("projectType", e.target.value)
                  }
                  className="w-full border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                >
                  <option value="">Seçiniz</option>
                  <option value="Villa / Müstakil Ev">
                    Villa / Müstakil Ev
                  </option>
                  <option value="Konut">Konut</option>
                  <option value="Ticari Yapı">
                    Ticari Yapı
                  </option>
                  <option value="Apartman">Apartman</option>
                  <option value="Ruhsat Projesi">
                    Ruhsat Projesi
                  </option>
                  <option value="Mevcut Yapı">
                    Mevcut Yapı
                  </option>
                  <option value="Tadilat / Dönüşüm">
                    Tadilat / Dönüşüm
                  </option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="grid gap-7 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    İlçe
                  </label>

                  <input
                    value={form.district}
                    onChange={(e) =>
                      update("district", e.target.value)
                    }
                    placeholder="Örn. Çanakkale Merkez"
                    className="w-full border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Yaklaşık alan
                  </label>

                  <input
                    value={
                      form.area ||
                      searchParams.get("area") ||
                      ""
                    }
                    onChange={(e) =>
                      update("area", e.target.value)
                    }
                    placeholder="Örn. 180 m²"
                    className="w-full border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid gap-7 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Ne zaman başlamayı düşünüyorsunuz?
                  </label>

                  <select
                    value={form.timeline}
                    onChange={(e) =>
                      update("timeline", e.target.value)
                    }
                    className="w-full border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Hemen">Hemen</option>
                    <option value="0-3 ay">0–3 ay</option>
                    <option value="3-6 ay">3–6 ay</option>
                    <option value="6-12 ay">6–12 ay</option>
                    <option value="Henüz karar vermedim">
                      Henüz karar vermedim
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Yaklaşık bütçe
                  </label>

                  <select
                    value={form.budget}
                    onChange={(e) =>
                      update("budget", e.target.value)
                    }
                    className="w-full border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                  >
                    <option value="">
                      Belirtmek istemiyorum
                    </option>
                    <option value="5 milyon TL altı">
                      5 milyon TL altı
                    </option>
                    <option value="5-10 milyon TL">
                      5–10 milyon TL
                    </option>
                    <option value="10-20 milyon TL">
                      10–20 milyon TL
                    </option>
                    <option value="20 milyon TL üzeri">
                      20 milyon TL üzeri
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Projeniz hakkında
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    update("description", e.target.value)
                  }
                  rows={5}
                  placeholder="Arsanız, mevcut yapınız, beklentiniz veya aklınızdaki fikir hakkında kısaca bahsedebilirsiniz."
                  className="w-full resize-none border border-black/15 bg-[#faf9f6] px-5 py-4 outline-none focus:border-black"
                />
              </div>

              {error && (
                <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={submit}
                className="w-full bg-black px-6 py-5 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-50"
              >
                {loading
                  ? "Gönderiliyor..."
                  : "Proje Talebimi Gönder →"}
              </button>

              <p className="text-xs leading-5 text-black/35">
                Bilgileriniz yalnızca proje talebinizi değerlendirmek
                ve sizinle iletişime geçmek amacıyla kullanılacaktır.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ProjeTalebiPage() {
  return (
    <Suspense fallback={null}>
      <ProjeTalebiContent />
    </Suspense>
  );
}