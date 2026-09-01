"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MeetingNote = {
  id: number;
  projectId: number | null;
  projectRequestId: number | null;
  type: string;
  note: string;
  meetingAt: string;
  createdAt: string;
  updatedAt: string;
};

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
  source: string;
  priority: string;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    projectNo: string;
    name: string | null;
    status: string;
    quotes?: { id: number; quoteNo: string; status: string; total: number; currency: string; quoteDate: string }[];
    meetingNotes?: MeetingNote[];
  } | null;
};

const STATUS_OPTIONS = [
  ["YENI", "Yeni"],
  ["INCELENIYOR", "İnceleniyor"],
  ["GORUSME_YAPILDI", "Görüşme Yapıldı"],
  ["TEKLIF_HAZIRLANIYOR", "Teklif Hazırlanıyor"],
  ["TEKLIF_GONDERILDI", "Teklif Gönderildi"],
  ["KAZANILDI", "Kazanıldı"],
  ["KAYBEDILDI", "Kaybedildi"],
  ["PROJE_OLUSTURULDU", "Projeye Dönüştürüldü"],
] as const;
const SOURCE_OPTIONS = [
  ["direct", "Doğrudan"],
  ["calculator", "Maliyet Hesaplama"],
  ["collaboration", "İş Birliği"],
] as const;
const PRIORITY_OPTIONS = [
  ["DUSUK", "Düşük"],
  ["NORMAL", "Normal"],
  ["YUKSEK", "Yüksek"],
  ["ACIL", "Acil"],
] as const;
const MEETING_TYPE_OPTIONS = [
  ["YUZ_YUZE", "Yüz Yüze"],
  ["TELEFON", "Telefon"],
  ["WHATSAPP", "WhatsApp"],
  ["EPOSTA", "E-posta"],
  ["DIGER", "Diğer"],
] as const;

const labelFor = (options: readonly (readonly [string, string])[], value: string) => options.find(([key]) => key === value)?.[1] ?? value;
const formatDate = (value: string | null) => {
  if (!value) return "Belirtilmedi";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
};
const inputDateValue = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};
const currentDateTimeValue = () => inputDateValue(new Date().toISOString());
const quoteStatusLabel = (value?: string) => labelFor([
  ["TASLAK", "Taslak"],
  ["HAZIRLANIYOR", "Hazırlanıyor"],
  ["GONDERILDI", "Gönderildi"],
  ["KABUL_EDILDI", "Kabul edildi"],
  ["REDDEDILDI", "Reddedildi"],
] as const, value || "Teklif yok");

export default function ProjectRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [projectRequest, setProjectRequest] = useState<ProjectRequest | null>(null);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState("YENI");
  const [source, setSource] = useState("direct");
  const [priority, setPriority] = useState("NORMAL");
  const [lastContactAt, setLastContactAt] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");
  const [meetingType, setMeetingType] = useState("YUZ_YUZE");
  const [meetingAt, setMeetingAt] = useState(currentDateTimeValue());
  const [meetingNote, setMeetingNote] = useState("");

  async function loadMeetingNotes(projectRequestId: string) {
    const response = await fetch(`/api/project-requests/${projectRequestId}/meeting-notes`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Görüşme notları alınamadı.");
    setMeetingNotes(data.data as MeetingNote[]);
  }

  useEffect(() => {
    if (!id) return;
    async function loadRequest() {
      try {
        setLoading(true);
        setError("");
        const [requestResponse] = await Promise.all([
          fetch(`/api/project-requests/${id}`, { cache: "no-store" }),
          loadMeetingNotes(id),
        ]);
        const data = await requestResponse.json();
        if (!requestResponse.ok) throw new Error(data.message || "Proje talebi alınamadı.");
        const value = data.data as ProjectRequest;
        setProjectRequest(value);
        setStatus(value.status);
        setSource(value.source || "direct");
        setPriority(value.priority || "NORMAL");
        setLastContactAt(inputDateValue(value.lastContactAt));
        setNextFollowUpAt(inputDateValue(value.nextFollowUpAt));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Proje talebi alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [id]);

  async function saveStatus() {
    if (!projectRequest || savingStatus || savingLead || savingMeeting || creatingProject) return;
    try {
      setSavingStatus(true); setError(""); setSuccess("");
      const response = await fetch(`/api/project-requests/${projectRequest.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Durum güncellenemedi.");
      setProjectRequest(data.data); setSuccess("Talep durumu kaydedildi.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Durum güncellenemedi.");
    } finally { setSavingStatus(false); }
  }

  async function saveLeadInfo() {
    if (!projectRequest || savingLead || savingStatus || savingMeeting || creatingProject) return;
    try {
      setSavingLead(true); setError(""); setSuccess("");
      const response = await fetch(`/api/project-requests/${projectRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, priority, lastContactAt: lastContactAt || null, nextFollowUpAt: nextFollowUpAt || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lead bilgileri kaydedilemedi.");
      const value = data.data as ProjectRequest;
      setProjectRequest(value);
      setLastContactAt(inputDateValue(value.lastContactAt));
      setNextFollowUpAt(inputDateValue(value.nextFollowUpAt));
      setSuccess("Lead bilgileri kaydedildi.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lead bilgileri kaydedilemedi.");
    } finally { setSavingLead(false); }
  }

  async function addMeetingNote() {
    if (!projectRequest || savingMeeting || savingStatus || savingLead || creatingProject) return;
    try {
      setSavingMeeting(true); setError(""); setSuccess("");
      const response = await fetch(`/api/project-requests/${projectRequest.id}/meeting-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: meetingType, note: meetingNote, meetingAt: meetingAt || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Görüşme notu eklenemedi.");
      await loadMeetingNotes(String(projectRequest.id));
      setLastContactAt(inputDateValue(data.data.meetingAt));
      setMeetingNote("");
      setMeetingAt(currentDateTimeValue());
      setSuccess("Görüşme notu eklendi ve son görüşme tarihi güncellendi.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Görüşme notu eklenemedi.");
    } finally { setSavingMeeting(false); }
  }

  async function createProject() {
    if (!projectRequest || creatingProject || projectRequest.project) return;
    if (!window.confirm(`${projectRequest.fullName} için yeni bir proje oluşturulsun mu?`)) return;
    try {
      setCreatingProject(true); setError(""); setSuccess("");
      const response = await fetch(`/api/project-requests/${projectRequest.id}/convert`, { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Proje oluşturulamadı.");
      setProjectRequest((current) => current ? { ...current, status: data.data.projectRequest.status, project: data.data.project } : current);
      setStatus(data.data.projectRequest.status);
      await loadMeetingNotes(String(projectRequest.id));
      setSuccess("Proje başarıyla oluşturuldu.");
      window.setTimeout(() => router.push(`/admin/projects/${data.data.project.id}`), 700);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Proje oluşturulamadı.");
    } finally { setCreatingProject(false); }
  }

  if (loading) return <main className="min-h-screen bg-[#f3f0e9] px-6 py-12"><div className="mx-auto max-w-6xl"><p className="text-[10px] font-semibold tracking-[0.2em] text-black/40">YÜKLENİYOR...</p></div></main>;
  if (!projectRequest) return <main className="min-h-screen bg-[#f3f0e9] px-6 py-12"><div className="mx-auto max-w-6xl"><Link href="/admin/project-requests" className="text-[10px] font-semibold tracking-[0.18em] text-black/50">← PROJE TALEPLERİ</Link><div className="mt-8 border border-red-500/20 bg-red-50 p-5 text-sm text-red-800">{error || "Proje talebi bulunamadı."}</div></div></main>;

  const latestQuote = projectRequest.project?.quotes?.[0];
  const latestMeeting = meetingNotes[0] ?? projectRequest.project?.meetingNotes?.[0];

  return (
    <main className="min-h-screen bg-[#f3f0e9] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div><Link href="/admin/project-requests" className="text-[10px] font-semibold tracking-[0.18em] text-black/50 hover:text-black">← PROJE TALEPLERİ</Link><p className="mt-8 text-[10px] font-semibold tracking-[0.2em] text-black/40">PROJE TALEBİ</p><h1 className="mt-3 text-4xl font-light tracking-[-0.04em] md:text-5xl">{projectRequest.fullName}</h1></div>
          <div><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40 md:text-right">TALEP NO</p><p className="mt-2 text-2xl font-light md:text-right">#{projectRequest.id}</p></div>
        </div>

        <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">SATIŞ / LEAD DURUMU</p><p className="mt-2 text-2xl font-light">{labelFor(STATUS_OPTIONS, projectRequest.status)}</p></div>
            <div className="w-full md:w-80"><label className="mb-2 block text-[9px] font-semibold tracking-[0.18em] text-black/40">DURUMU DÜZENLE</label><div className="flex gap-2"><select value={status} disabled={savingStatus || creatingProject} onChange={(event) => setStatus(event.target.value)} className="w-full border border-black/20 bg-transparent px-4 py-4 text-sm outline-none focus:border-black disabled:opacity-50">{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={saveStatus} disabled={savingStatus || savingLead || savingMeeting || creatingProject || status === projectRequest.status} className="border border-black bg-black px-4 py-3 text-[9px] font-semibold tracking-[0.14em] text-white disabled:opacity-40">{savingStatus ? "..." : "KAYDET"}</button></div></div>
          </div>
          {success && <div className="mt-5 border border-black/10 bg-white/50 px-4 py-3 text-sm">{success}</div>}
          {error && <div className="mt-5 border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        </section>

        <section className="mt-8 border border-black/10 bg-[#181818] p-6 text-white md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div><p className="text-[9px] font-semibold tracking-[0.2em] text-white/35">LEAD YÖNETİMİ</p><h2 className="mt-3 text-2xl font-light">Satış önceliğini ve takip tarihlerini yönet.</h2></div><span className="text-[10px] uppercase tracking-[0.16em] text-white/30">Kaydetmeden değişiklik uygulanmaz</span></div>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <FieldSelect label="TALEP KAYNAĞI" value={source} setValue={setSource} options={SOURCE_OPTIONS} dark />
            <FieldSelect label="ÖNCELİK" value={priority} setValue={setPriority} options={PRIORITY_OPTIONS} dark />
            <Field label="SON GÖRÜŞME" value={lastContactAt} setValue={setLastContactAt} type="datetime-local" dark />
            <Field label="SONRAKİ TAKİP" value={nextFollowUpAt} setValue={setNextFollowUpAt} type="datetime-local" dark />
          </div>
          <div className="mt-6 flex justify-end"><button type="button" onClick={saveLeadInfo} disabled={savingLead || savingStatus || savingMeeting || creatingProject} className="border border-white/30 px-5 py-3 text-[10px] font-semibold tracking-[0.16em] hover:bg-white hover:text-black disabled:opacity-40">{savingLead ? "KAYDEDİLİYOR..." : "LEAD BİLGİLERİNİ KAYDET →"}</button></div>
        </section>

        <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">GÖRÜŞME NOTLARI</p><h2 className="mt-3 text-2xl font-light">Müşteri görüşmelerini kaydet.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">Görüşme eklediğinde son görüşme tarihi otomatik güncellenir. Projeye dönüşüm sırasında notlar korunur.</p></div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-[180px_220px_1fr]">
            <FieldSelect label="TÜR" value={meetingType} setValue={setMeetingType} options={MEETING_TYPE_OPTIONS} />
            <Field label="TARİH / SAAT" value={meetingAt} setValue={setMeetingAt} type="datetime-local" />
            <label className="block md:col-span-1"><span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-black/40">NOT</span><textarea value={meetingNote} onChange={(event) => setMeetingNote(event.target.value)} rows={4} placeholder="Görüşmede konuşulanlar, ihtiyaçlar, sonraki adımlar..." className="w-full resize-y border border-black/20 bg-transparent px-4 py-3 text-sm leading-6 outline-none focus:border-black" /></label>
          </div>
          <div className="mt-5 flex justify-end"><button type="button" onClick={addMeetingNote} disabled={savingMeeting || savingStatus || savingLead || creatingProject || !meetingNote.trim()} className="border border-black bg-black px-5 py-3 text-[10px] font-semibold tracking-[0.16em] text-white disabled:opacity-40">{savingMeeting ? "KAYDEDİLİYOR..." : "GÖRÜŞMEYİ KAYDET →"}</button></div>

          <div className="mt-8 border-t border-black/10 pt-2">
            {meetingNotes.length ? meetingNotes.map((meeting) => (
              <article key={meeting.id} className="border-b border-black/10 py-5 last:border-b-0">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><span className="text-[9px] font-semibold tracking-[0.16em] text-black/40">{labelFor(MEETING_TYPE_OPTIONS, meeting.type)}</span><p className="mt-1 text-xs text-black/45">{formatDate(meeting.meetingAt)}</p></div><span className="text-[9px] uppercase tracking-[0.16em] text-black/35">Görüşme #{meeting.id}</span></div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-black/70">{meeting.note}</p>
              </article>
            )) : <p className="py-5 text-sm text-black/45">Henüz görüşme notu bulunmuyor.</p>}
          </div>
        </section>

        <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">PROJE DÖNÜŞÜMÜ</p>{projectRequest.project ? <><p className="mt-2 text-xl font-light">{projectRequest.project.projectNo}</p><p className="mt-1 text-sm text-black/50">Bu talep bir projeye dönüştürüldü.</p></> : <p className="mt-2 text-sm leading-6 text-black/60">Bu talep henüz projeye dönüştürülmedi.</p>}</div>{projectRequest.project ? <Link href={`/admin/projects/${projectRequest.project.id}`} className="border border-black/20 px-5 py-3 text-[10px] font-semibold tracking-[0.16em] hover:bg-black hover:text-white">PROJEYİ GÖRÜNTÜLE →</Link> : <button onClick={createProject} disabled={creatingProject} className="border border-black bg-black px-5 py-3 text-[10px] font-semibold tracking-[0.16em] text-white hover:bg-black/80 disabled:opacity-50">{creatingProject ? "OLUŞTURULUYOR..." : "PROJEYE DÖNÜŞTÜR"}</button>}</div>
        </section>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <InfoCard title="MÜŞTERİ BİLGİLERİ"><InfoRow label="AD SOYAD" value={projectRequest.fullName}/><InfoRow label="TELEFON" value={projectRequest.phone}/></InfoCard>
          <InfoCard title="PROJE KONUMU"><InfoRow label="İL" value={projectRequest.province}/><InfoRow label="İLÇE" value={projectRequest.district}/><InfoRow label="MAHALLE / KÖY" value={projectRequest.neighborhood}/></InfoCard>
          <InfoCard title="YAPI BİLGİLERİ"><InfoRow label="YAPI TÜRÜ" value={projectRequest.buildingType}/><InfoRow label="PROJE AŞAMASI" value={projectRequest.projectStage}/><InfoRow label="YAKLAŞIK ALAN" value={projectRequest.approximateArea ? `${projectRequest.approximateArea} m²` : "Belirtilmedi"}/></InfoCard>
          <InfoCard title="LEAD ÖZETİ"><InfoRow label="KAYNAK" value={labelFor(SOURCE_OPTIONS, projectRequest.source)}/><InfoRow label="ÖNCELİK" value={labelFor(PRIORITY_OPTIONS, projectRequest.priority)}/><InfoRow label="SON GÖRÜŞME" value={formatDate(projectRequest.lastContactAt)}/><InfoRow label="SONRAKİ TAKİP" value={formatDate(projectRequest.nextFollowUpAt)}/></InfoCard>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <InfoCard title="TEKLİF DURUMU">{latestQuote ? <><InfoRow label="TEKLİF NO" value={latestQuote.quoteNo}/><InfoRow label="AŞAMA" value={quoteStatusLabel(latestQuote.status)}/><InfoRow label="TUTAR" value={new Intl.NumberFormat("tr-TR", { style: "currency", currency: latestQuote.currency }).format(latestQuote.total / 100)}/><InfoRow label="TARİH" value={formatDate(latestQuote.quoteDate)}/></> : <p className="text-sm text-black/45">Henüz teklif oluşturulmamış.</p>}</InfoCard>
          <InfoCard title="SON GÖRÜŞME">{latestMeeting ? <><InfoRow label="TÜR" value={labelFor(MEETING_TYPE_OPTIONS, latestMeeting.type)}/><InfoRow label="TARİH" value={formatDate(latestMeeting.meetingAt)}/><div className="pt-4 text-sm leading-7 text-black/70">{latestMeeting.note}</div></> : <p className="text-sm text-black/45">Henüz görüşme notu bulunmuyor.</p>}</InfoCard>
        </div>

        <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8"><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">TALEP BİLGİLERİ</p><div className="mt-6 grid gap-4 md:grid-cols-2"><InfoRow label="İLGİLENİLEN ALANLAR" value={projectRequest.interestAreas || "Belirtilmedi"}/><InfoRow label="TALEP TARİHİ" value={formatDate(projectRequest.createdAt)}/></div></section>
        <section className="mt-8 border border-black/10 bg-white/30 p-6 md:p-8"><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">MÜŞTERİNİN AÇIKLAMASI</p><div className="mt-6 border-t border-black/10 pt-6">{projectRequest.description ? <p className="whitespace-pre-wrap text-sm leading-7 text-black/70">{projectRequest.description}</p> : <p className="text-sm text-black/40">Müşteri açıklama bırakmamış.</p>}</div></section>
      </div>
    </main>
  );
}

function Field({ label, value, setValue, type = "text", dark = false }: { label: string; value: string; setValue: (value: string) => void; type?: string; dark?: boolean }) {
  return <label className="block"><span className={`mb-2 block text-[9px] font-semibold tracking-[0.16em] ${dark ? "text-white/40" : "text-black/40"}`}>{label}</span><input type={type} value={value} onChange={(event) => setValue(event.target.value)} className={`w-full border px-4 py-3 text-sm outline-none ${dark ? "border-white/20 bg-white/5 text-white [color-scheme:dark]" : "border-black/20 bg-transparent"}`} /></label>;
}
function FieldSelect({ label, value, setValue, options, dark = false }: { label: string; value: string; setValue: (value: string) => void; options: readonly (readonly [string, string])[]; dark?: boolean }) {
  return <label className="block"><span className={`mb-2 block text-[9px] font-semibold tracking-[0.16em] ${dark ? "text-white/40" : "text-black/40"}`}>{label}</span><select value={value} onChange={(event) => setValue(event.target.value)} className={`w-full border px-4 py-3 text-sm outline-none ${dark ? "border-white/20 bg-[#242424] text-white [color-scheme:dark]" : "border-black/20 bg-transparent"}`}>{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border border-black/10 bg-white/30 p-6 md:p-8"><p className="text-[9px] font-semibold tracking-[0.2em] text-black/40">{title}</p><div className="mt-6 divide-y divide-black/10">{children}</div></section>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <div className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[150px_1fr]"><p className="text-[9px] font-semibold tracking-[0.15em] text-black/40">{label}</p><p className="text-sm leading-6 text-black/75">{value || "-"}</p></div>; }
