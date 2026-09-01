"use client";

import { useEffect, useState } from "react";

type MeetingNote = {
  id: number;
  type: string;
  note: string;
  meetingAt: string;
  createdAt: string;
};

const typeOptions = [
  { value: "YUZ_YUZE", label: "Yüz yüze" },
  { value: "TELEFON", label: "Telefon" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EPOSTA", label: "E-posta" },
  { value: "DIGER", label: "Diğer" },
];

const typeLabel = (type: string) => typeOptions.find((item) => item.value === type)?.label ?? type;
const formatDate = (value: string) => new Date(value).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function MeetingNotes({ projectId }: { projectId: number }) {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [type, setType] = useState("YUZ_YUZE");
  const [meetingAt, setMeetingAt] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadNotes() {
    try {
      setLoading(true); setError("");
      const response = await fetch(`/api/projects/${projectId}/meeting-notes`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Görüşme notları alınamadı.");
      setNotes(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görüşme notları alınamadı.");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadNotes(); }, [projectId]);

  async function addNote(event: React.FormEvent) {
    event.preventDefault();
    if (!note.trim() || saving) return;
    try {
      setSaving(true); setError("");
      const response = await fetch(`/api/projects/${projectId}/meeting-notes`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, meetingAt, note }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Görüşme notu eklenemedi.");
      setNotes((current) => [result.data, ...current]);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görüşme notu eklenemedi.");
    } finally { setSaving(false); }
  }

  return (
    <section className="mt-7 border border-neutral-300 bg-[#faf9f6] p-7">
      <div className="flex items-end justify-between gap-6 border-b border-neutral-200 pb-5">
        <div><p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Görüşme Notları</p><p className="mt-2 text-sm text-neutral-500">Müşteriyle yapılan görüşmeleri tarihçesiyle kaydedin.</p></div>
        <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">{notes.length} KAYIT</p>
      </div>

      <form onSubmit={addNote} className="mt-6 border border-neutral-200 bg-[#f7f4ed] p-5">
        <div className="grid gap-4 md:grid-cols-[180px_220px_1fr]">
          <div><label className="text-[9px] uppercase tracking-[0.15em] text-neutral-500">Görüşme Türü</label><select value={type} onChange={(e) => setType(e.target.value)} className="mt-2 w-full border border-neutral-300 bg-transparent px-3 py-3 text-sm outline-none">{typeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          <div><label className="text-[9px] uppercase tracking-[0.15em] text-neutral-500">Tarih / Saat</label><input type="datetime-local" value={meetingAt} onChange={(e) => setMeetingAt(e.target.value)} className="mt-2 w-full border border-neutral-300 bg-transparent px-3 py-3 text-sm outline-none" /></div>
          <div><label className="text-[9px] uppercase tracking-[0.15em] text-neutral-500">Not</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Görüşmede konuşulanları yazın..." className="mt-2 w-full resize-none border border-neutral-300 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-400" /></div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">{error ? <p className="text-xs text-red-700">{error}</p> : <span /> }<button type="submit" disabled={saving || !note.trim()} className="border border-black bg-black px-5 py-3 text-[9px] font-medium uppercase tracking-[0.16em] text-white disabled:opacity-40">{saving ? "KAYDEDİLİYOR..." : "GÖRÜŞMEYİ KAYDET"}</button></div>
      </form>

      <div className="mt-6 divide-y divide-neutral-200">
        {loading && <p className="py-6 text-sm text-neutral-500">Görüşme notları yükleniyor...</p>}
        {!loading && notes.length === 0 && <p className="py-6 text-sm text-neutral-500">Henüz görüşme notu eklenmemiş.</p>}
        {!loading && notes.map((item) => <article key={item.id} className="py-5 first:pt-0 last:pb-0"><div className="flex flex-wrap items-center gap-3"><span className="text-[9px] font-medium uppercase tracking-[0.14em]">{typeLabel(item.type)}</span><span className="text-[9px] tracking-[0.12em] text-neutral-400">{formatDate(item.meetingAt)}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-700">{item.note}</p></article>)}
      </div>
    </section>
  );
}
