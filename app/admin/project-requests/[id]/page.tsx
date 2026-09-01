"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  project?: { id: number; projectNo: string; name: string | null; status: string } | null;
};

const STATUS_OPTIONS = [
  { value: "YENI", label: "Yeni" },
  { value: "INCELENIYOR", label: "İnceleniyor" },
  { value: "GORUSME_YAPILDI", label: "Görüşme Yapıldı" },
  { value: "TEKLIF_HAZIRLANIYOR", label: "Teklif Hazırlanıyor" },
  { value: "TEKLIF_GONDERILDI", label: "Teklif Gönderildi" },
  { value: "KAZANILDI", label: "Kazanıldı" },
  { value: "KAYBEDILDI", label: "Kaybedildi" },
];

export default function ProjectRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [projectRequest, setProjectRequest] = useState<ProjectRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;
    async function loadRequest() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/project-requests/${id}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Proje talebi alınamadı.");
        setProjectRequest(data.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Proje talebi alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [id]);

  async function changeStatus(status: string) {
    if (!projectRequest || saving || creatingProject) return;
    try {
      setSaving(true); setError(""); setSuccess("");
      const response = await fetch(`/api/project-requests/${projectRequest.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Durum güncellenemedi.");
      setProjectRequest(data.data); setSuccess("Talep durumu güncellendi.");
      window.setTimeout(() => setSuccess(""), 2500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Durum güncellenemedi.");
    } finally { setSaving(false); }
  }

  async function createProject() {
    if (!projectRequest || creatingProject || projectRequest.project) return;
    const confirmed = window.confirm(`${projectRequest.fullName} için yeni bir proje oluşturulsun mu?`);
    if (!confirmed) return;
    try {
      setCreatingProject(true); setError(""); setSuccess("");
      const response = await fetch(`/api/project-requests/${projectRequest.id}/convert`, {
        method: "POST", headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Proje oluşturulamadı.");
      setProjectRequest((current) => current ? { ...current, status: data.data.projectRequest.status, project: data.data.project } : current);
      setSuccess("Proje başarıyla oluşturuldu.");
      window.setTimeout(() => router.push(`/admin/projects/${data.data.project.id}`), 700);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Proje oluşturulamadı.");
    } finally { setCreatingProject(false); }
  }

  if (loading) return <main className="min-h-screen bg-[#f3f0e9] px-6 py-12"><div className="mx-auto max-w-6xl"><p className="text-[10px] font-semibold tracking-[0.2em] text-black/40">YÜKLENİYOR...</p></div></main>;
  if (error && !projectRequest) return <main className="min-h-screen bg-[#f3f0e9] px-6 py-12"><div className="mx-auto max-w-6xl"><Link href="/admin/project-requests" className="text-[10px] font-semibold tracking-[0.18em] text-black/50 hover:text-black">← PROJE TALEPLERİ</Link><div className="mt-8 border border-red-500/20 bg-red-50 p-5 text-sm text-red-800">{error}</div></div></main>;
  if (!projectRequest) return null;

  const statusLabel = STATUS_OPTIONS.find((item) => item.value === projectRequest.status)?.label || projectRequest.status;
  const createdAt = new Date(projectRequest.createdAt).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="min-h-screen bg-[#f3f0e9] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div><Link href="/admin/project-requests" className="text-[10px] font-semibold tracking-[0.18em] text-black/50 hover:text-black">← PROJE TALEPLERİ</Link><p className="mt-8 text-[10px] font-semibold tracking-[0.2em] text-black/40">PROJE TALEBİ</p><h1 className="mt-3 text-4xl font-light tracking-[-0.04em] md:text-5xl">{projectRequest.fullName}</h1></div>
          <div><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40 md:text-right">TALEP NO</p><p className="mt-2 text-2xl font-light md:text-right">#{projectRequest.id}</p></div>
        </div>

        <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">MEVCUT DURUM</p><p className="mt-2 text-2xl font-light">{statusLabel}</p></div>
            <div className="w-full md:w-80"><label className="mb-2 block text-[9px] font-semibold tracking-[0.18em] text-black/40">DURUMU GÜNCELLE</label><select value={projectRequest.status} disabled={saving || creatingProject} onChange={(event) => changeStatus(event.target.value)} className="w-full border border-black/20 bg-transparent px-4 py-4 text-sm outline-none focus:border-black disabled:opacity-50">{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          </div>
          {success && <div className="mt-5 border border-black/10 bg-white/50 px-4 py-3 text-sm">{success}</div>}
          {error && <div className="mt-5 border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        </section>

        <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">PROJE DURUMU</p>{projectRequest.project ? <><p className="mt-2 text-xl font-light">{projectRequest.project.projectNo}</p><p className="mt-1 text-sm text-black/50">Bu talep bir projeye dönüştürüldü.</p></> : <p className="mt-2 text-sm leading-6 text-black/60">Bu talep henüz projeye dönüştürülmedi.</p>}</div>
            {projectRequest.project ? <Link href={`/admin/projects/${projectRequest.project.id}`} className="border border-black/20 px-5 py-3 text-[10px] font-semibold tracking-[0.16em] hover:bg-black hover:text-white">PROJEYİ GÖRÜNTÜLE →</Link> : <button onClick={createProject} disabled={creatingProject} className="border border-black bg-black px-5 py-3 text-[10px] font-semibold tracking-[0.16em] text-white hover:bg-black/80 disabled:opacity-50">{creatingProject ? "OLUŞTURULUYOR..." : "PROJEYE DÖNÜŞTÜR"}</button>}
          </div>
        </section>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <InfoCard title="MÜŞTERİ BİLGİLERİ"><InfoRow label="AD SOYAD" value={projectRequest.fullName}/><InfoRow label="TELEFON" value={projectRequest.phone}/></InfoCard>
          <InfoCard title="PROJE KONUMU"><InfoRow label="İL" value={projectRequest.province}/><InfoRow label="İLÇE" value={projectRequest.district}/><InfoRow label="MAHALLE / KÖY" value={projectRequest.neighborhood}/></InfoCard>
          <InfoCard title="YAPI BİLGİLERİ"><InfoRow label="YAPI TÜRÜ" value={projectRequest.buildingType}/><InfoRow label="PROJE AŞAMASI" value={projectRequest.projectStage}/><InfoRow label="YAKLAŞIK ALAN" value={projectRequest.approximateArea ? `${projectRequest.approximateArea} m²` : "Belirtilmedi"}/></InfoCard>
          <InfoCard title="TALEP BİLGİLERİ"><InfoRow label="İLGİLENİLEN ALANLAR" value={projectRequest.interestAreas || "Belirtilmedi"}/><InfoRow label="TALEP TARİHİ" value={createdAt}/></InfoCard>
        </div>

        <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8"><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">MÜŞTERİNİN AÇIKLAMASI</p><div className="mt-6 border-t border-black/10 pt-6">{projectRequest.description ? <p className="whitespace-pre-wrap text-sm leading-7 text-black/70">{projectRequest.description}</p> : <p className="text-sm text-black/40">Müşteri açıklama bırakmamış.</p>}</div></section>
        <section className="mt-8 border border-black/10 p-6 md:p-8"><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">PROJE SÜRECİ</p><p className="mt-4 max-w-2xl text-sm leading-7 text-black/50">Görüşme notları, teklif, proje dosyaları ve iş akışı bu bölümde ilerleyen aşamalarda yönetilecek.</p></section>
      </div>
    </main>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border border-black/10 bg-white/30 p-6 md:p-8"><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">{title}</p><div className="mt-6 divide-y divide-black/10">{children}</div></section>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <div className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[150px_1fr]"><p className="text-[9px] font-semibold tracking-[0.15em] text-black/40">{label}</p><p className="text-sm leading-6 text-black/75">{value}</p></div>; }
