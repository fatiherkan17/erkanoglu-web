"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Quote = { id:number; quoteNo:string; quoteDate:string; validUntil:string|null; scope:string; description:string|null; subtotal:number; vatRate:number; total:number; currency:string; status:string };
type Project = { projectNo:string; projectRequest:{ fullName:string; phone:string; province:string; district:string; neighborhood:string; buildingType:string; approximateArea:string|null } };

const statusLabels:Record<string,string>={TASLAK:"Taslak",HAZIRLANIYOR:"Hazırlanıyor",GONDERILDI:"Gönderildi",KABUL_EDILDI:"Kabul edildi",REDDEDILDI:"Reddedildi"};
const currencySymbols:Record<string,string>={TRY:"₺",EUR:"€",USD:"$"};
const money=(value:number,currency:string)=>`${currencySymbols[currency]??currency} ${new Intl.NumberFormat("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2}).format(value/100)}`;
const date=(value:string|null)=>value?new Date(value).toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric"}):"-";

export default function QuotePrintPage(){
 const params=useParams();
 const projectId=Array.isArray(params?.id)?params.id[0]:params?.id;
 const quoteId=Array.isArray(params?.quoteId)?params.quoteId[0]:params?.quoteId;
 const [quote,setQuote]=useState<Quote|null>(null); const [project,setProject]=useState<Project|null>(null); const [error,setError]=useState("");
 useEffect(()=>{if(!projectId||!quoteId)return; (async()=>{try{const [projectResponse,quotesResponse]=await Promise.all([fetch(`/api/projects/${projectId}`,{cache:"no-store"}),fetch(`/api/projects/${projectId}/quotes`,{cache:"no-store"})]); const projectResult=await projectResponse.json(); const quotesResult=await quotesResponse.json(); if(!projectResponse.ok)throw new Error(projectResult.message||"Proje alınamadı."); if(!quotesResponse.ok)throw new Error(quotesResult.message||"Teklif alınamadı."); const found=(quotesResult.data||[]).find((item:Quote)=>String(item.id)===String(quoteId)); if(!found)throw new Error("Teklif bulunamadı."); setProject(projectResult.data); setQuote(found);}catch(err){setError(err instanceof Error?err.message:"Teklif yüklenemedi.");}})();},[projectId,quoteId]);
 if(error)return <main className="min-h-screen bg-[#f7f5f0] p-10"><p className="text-sm text-red-700">{error}</p></main>;
 if(!quote||!project)return <main className="min-h-screen bg-[#f7f5f0] p-10"><p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Teklif yükleniyor...</p></main>;
 const request=project.projectRequest;
 return <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 print:bg-white print:p-0">
  <div className="mx-auto mb-4 flex max-w-[800px] justify-end print:hidden"><button onClick={()=>window.print()} className="border border-black bg-black px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">PDF / YAZDIR</button></div>
  <article className="mx-auto max-w-[800px] bg-white px-12 py-12 shadow-sm print:max-w-none print:shadow-none">
   <header className="flex items-start justify-between border-b-2 border-black pb-8"><div><p className="text-xl font-medium tracking-[0.28em]">ERKANOĞLU</p><p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-neutral-500">Mimarlık · Mühendislik · İnşaat</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Teklif</p><p className="mt-2 text-xl">{quote.quoteNo}</p><p className="mt-1 text-xs text-neutral-500">{date(quote.quoteDate)}</p></div></header>
   <section className="grid gap-8 border-b border-neutral-200 py-8 md:grid-cols-2"><div><p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500">Müşteri</p><p className="mt-3 text-lg">{request.fullName}</p><p className="mt-1 text-sm text-neutral-600">{request.phone}</p></div><div><p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500">Proje</p><p className="mt-3 text-lg">{project.projectNo}</p><p className="mt-1 text-sm text-neutral-600">{request.buildingType} · {request.approximateArea||"-"} m²</p><p className="mt-1 text-sm text-neutral-600">{request.neighborhood}, {request.district} / {request.province}</p></div></section>
   <section className="py-8"><p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500">Hizmet Kapsamı</p><h1 className="mt-3 text-2xl font-light">{quote.scope}</h1>{quote.description&&<p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-neutral-600">{quote.description}</p>}</section>
   <section className="border-y border-neutral-200 py-6"><div className="flex justify-between py-2 text-sm"><span>Ara Toplam</span><span>{money(quote.subtotal,quote.currency)}</span></div><div className="flex justify-between py-2 text-sm"><span>KDV (%{quote.vatRate})</span><span>{money(quote.total-quote.subtotal,quote.currency)}</span></div><div className="mt-4 flex justify-between border-t border-black pt-5 text-lg font-medium"><span>Genel Toplam</span><span>{money(quote.total,quote.currency)}</span></div></section>
   <section className="grid gap-8 py-8 md:grid-cols-2"><div><p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500">Teklif Durumu</p><p className="mt-3 text-sm">{statusLabels[quote.status]??quote.status}</p></div><div><p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500">Geçerlilik</p><p className="mt-3 text-sm">{quote.validUntil?date(quote.validUntil):"Belirtilmemiştir"}</p></div></section>
   <footer className="mt-16 border-t border-neutral-200 pt-6"><p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500">Notlar</p><p className="mt-3 text-xs leading-6 text-neutral-500">Bu teklif, belirtilen hizmet kapsamı ve koşullar doğrultusunda hazırlanmıştır. Çalışma kapsamı ve uygulama koşulları tarafların mutabakatı ile kesinleştirilir.</p><div className="mt-16 grid grid-cols-2 gap-12"><div className="border-t border-neutral-400 pt-3 text-xs">ERKANOĞLU<br/><span className="text-neutral-500">Yetkili</span></div><div className="border-t border-neutral-400 pt-3 text-xs">Müşteri<br/><span className="text-neutral-500">Onay / İmza</span></div></div></footer>
  </article>
 </main>;
}
