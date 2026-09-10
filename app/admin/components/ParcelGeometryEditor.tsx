"use client";
import { useMemo, useState, type PointerEvent } from "react";

type Point = { x: number; y: number };

export default function ParcelGeometryEditor({
  imageUrl,
  value,
  onChange,
}: {
  imageUrl: string;
  value: Point[];
  onChange: (points: Point[]) => void;
}) {
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const points = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  function handlePointer(event: PointerEvent<HTMLDivElement>) {
    if (!placing) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    if (points.length >= 8) {
      setError("En fazla 8 parsel köşesi işaretleyebilirsin.");
      return;
    }
    onChange([...points, { x, y }]);
    setError("");
  }

  function undo() {
    if (!points.length) return;
    onChange(points.slice(0, -1));
    setError("");
  }

  function reset() {
    onChange([]);
    setError("");
  }

  return (
    <div className="mt-5 border border-black/10 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold tracking-[0.16em] text-black/40">PARSEL GEOMETRİSİ</p>
          <p className="mt-1 text-sm leading-6 text-black/65">Krokide parsel köşelerini sırayla tıklayarak gerçek sınırı işaretle.</p>
        </div>
        <div className="text-[10px] text-black/40">{points.length} / 8 nokta</div>
      </div>
      <div className="mt-4 overflow-hidden border border-black/10 bg-[#f8f7f2]">
        <div className={`relative select-none ${placing ? "cursor-crosshair" : "cursor-default"}`} onPointerDown={handlePointer}>
          <img src={imageUrl} alt="Aplikasyon krokisi" className="block max-h-[520px] w-full object-contain bg-white" draggable={false} />
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            {points.length >= 2 && <polyline points={points.map((p) => `${p.x * 1000},${p.y * 1000}`).join(" ") + (points.length >= 3 ? ` ${points[0].x * 1000},${points[0].y * 1000}` : "")} fill="rgba(255,255,255,0.16)" stroke="black" strokeWidth="6" vectorEffect="non-scaling-stroke" />}
            {points.map((p, index) => <g key={`${p.x}-${p.y}-${index}`}><circle cx={p.x * 1000} cy={p.y * 1000} r="15" fill="white" stroke="black" strokeWidth="4" vectorEffect="non-scaling-stroke" /><text x={p.x * 1000} y={p.y * 1000 + 5} textAnchor="middle" fontSize="18" fontWeight="600" fill="black">{index + 1}</text></g>)}
          </svg>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setPlacing(true); setError(""); }} className={`border px-4 py-3 text-[10px] font-semibold tracking-[0.12em] ${placing ? "border-black bg-black text-white" : "border-black/15 bg-white text-black/55"}`}>{placing ? "NOKTALARI İŞARETLE" : "PARSEL SINIRINI İŞARETLE"}</button>
        <button type="button" onClick={undo} disabled={!points.length} className="border border-black/15 px-4 py-3 text-[10px] font-semibold tracking-[0.12em] text-black/55 disabled:opacity-30">SON NOKTAYI SİL</button>
        <button type="button" onClick={() => { reset(); setPlacing(true); }} className="border border-black/15 px-4 py-3 text-[10px] font-semibold tracking-[0.12em] text-black/55">YENİDEN ÇİZ</button>
        {placing && points.length >= 3 && <button type="button" onClick={() => setPlacing(false)} className="border border-black px-4 py-3 text-[10px] font-semibold tracking-[0.12em] text-black">TAMAMLA</button>}
      </div>
      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
      <p className="mt-3 text-[10px] leading-5 text-black/35">Noktaları saat yönünde veya saat yönünün tersinde sırayla işaretle. En az 3 nokta gerçek parsel poligonu oluşturur.</p>
    </div>
  );
}
