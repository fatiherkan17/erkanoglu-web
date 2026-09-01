import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çanakkale Ruhsat Projesi | Erkanoğlu",
  description: "Çanakkale'de yapı ruhsatı için mimari ve mühendislik proje koordinasyonu.",
};

export default function CanakkaleRuhsatPage() {
  return <main className="min-h-screen bg-[#f4f2ed] text-[#171717]"><header className="border-b border-black/10"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10"><Link href="/" className="text-xl font-semibold tracking-[0.2em]">ERKANOĞLU</Link><Link href="/proje-talebi?projectType=Ruhsat%20Projesi" className="rounded-full bg-black px-5 py-3 text-sm text-white">Ruhsat İçin Teklif Al →</Link></div></header><section className="mx-auto max-w-5xl px-6 py-24 lg:px-10 lg:py-32"><p className="text-xs uppercase tracking-[0.3em] text-black/40">Çanakkale Ruhsat Projesi</p><h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-8xl">Ruhsat sürecini<br /><span className="text-black/35">tek elden yönetin.</span></h1><p className="mt-10 max-w-3xl text-xl leading-8 text-black/55">Mimari proje, statik, elektrik, mekanik ve diğer gerekli disiplinlerin koordinasyonunu projenin ihtiyaçlarına göre yürütüyoruz.</p><div className="mt-14 border-y border-black/10">{["Mimari proje", "Statik proje", "Elektrik ve mekanik projeler", "Harita / aplikasyon", "Zemin ve temel etüdü", "Ruhsat süreci koordinasyonu"].map((item, i) => <div key={item} className="flex items-center gap-6 border-b border-black/10 py-5 last:border-0"><span className="text-xs text-black/30">0{i + 1}</span><span>{item}</span></div>)}</div><div className="mt-16 bg-[#171717] p-8 text-white md:p-12"><h2 className="text-3xl font-medium md:text-5xl">Arsanızı ve projenizi anlatın.</h2><p className="mt-5 max-w-xl text-white/55">Yapı tipi, yaklaşık alan ve konumu paylaşın; ruhsat süreciniz için ilk değerlendirmeyi yapalım.</p><Link href="/proje-talebi?projectType=Ruhsat%20Projesi" className="mt-8 inline-flex rounded-full bg-white px-7 py-4 text-sm font-medium text-black">Ruhsat Projesi Talebi →</Link></div></section></main>;
}
