"use client";

type ProjectProcessProps = {
  status: string;
};

const steps = [
  { key: "YENI", label: "Talep" },
  { key: "INCELENIYOR", label: "İnceleme" },
  { key: "GORUSULDU", label: "Görüşme" },
  { key: "TEKLIF_HAZIRLANIYOR", label: "Teklif" },
  { key: "TEKLIF_GONDERILDI", label: "Teklif Gönderildi" },
  { key: "ONAY_BEKLENIYOR", label: "Onay" },
  { key: "PROJE_BASLADI", label: "Proje" },
  { key: "TAMAMLANDI", label: "Tamamlandı" },
];

export default function ProjectProcess({
  status,
}: ProjectProcessProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === status)
  );

  return (
    <section className="mt-7 border border-[#d8d3c8] bg-[#f8f5ef]">
      <div className="border-b border-[#d8d3c8] px-7 py-6">
        <p className="text-[9px] uppercase tracking-[0.24em] text-[#8c8579]">
          Proje Süreci
        </p>

        <h2 className="mt-2 text-xl font-light">
          İşin mevcut aşaması
        </h2>
      </div>

      <div className="overflow-x-auto px-7 py-8">
        <div className="flex min-w-[760px] items-start">
          {steps.map((step, index) => {
            const completed = index < currentIndex;
            const active = index === currentIndex;

            return (
              <div
                key={step.key}
                className="flex flex-1 items-start"
              >
                <div className="flex min-w-0 flex-col items-center">
                  <div
                    className={[
                      "flex h-9 w-9 items-center justify-center border text-[10px]",
                      completed
                        ? "border-black bg-black text-white"
                        : active
                        ? "border-[#b99b54] bg-[#ead9a6] text-[#3d3420]"
                        : "border-[#cfc9bd] bg-[#f8f5ef] text-[#999185]",
                    ].join(" ")}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  <p
                    className={[
                      "mt-3 whitespace-nowrap text-center text-[9px] uppercase tracking-[0.12em]",
                      active
                        ? "font-medium text-black"
                        : "text-[#8b8478]",
                    ].join(" ")}
                  >
                    {step.label}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={[
                      "mt-[18px] h-px flex-1",
                      index < currentIndex
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
  );
}