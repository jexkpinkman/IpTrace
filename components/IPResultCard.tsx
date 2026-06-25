"use client";

import { IPData } from "@/types";
import { generateMapsUrl, getFlagEmoji } from "@/lib/utils";
import { useToast } from "./ToastProvider";

interface IPResultCardProps {
  data: IPData;
}

export function IPResultCard({ data }: IPResultCardProps) {
  const { addToast } = useToast();

  async function copyIP() {
    try {
      await navigator.clipboard.writeText(data.ip);
      addToast("success", "IP disalin");
    } catch {
      addToast("error", "Gagal menyalin");
    }
  }

  function openMaps() {
    window.open(generateMapsUrl(data.latitude, data.longitude), "_blank", "noopener,noreferrer");
  }

  const flag = getFlagEmoji(data.countryCode);

  const rows = [
    { label: "Negara", value: `${flag} ${data.country}` },
    { label: "Kota", value: data.city },
    { label: "Provinsi", value: data.region },
    { label: "ISP", value: data.isp },
    { label: "ASN", value: data.asn },
    { label: "Timezone", value: data.timezone },
    { label: "Koordinat", value: `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}` },
  ];

  return (
    <div className="w-full">
      {/* IP Hero */}
      <div className="mb-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-2">IP Address</p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-2xl sm:text-3xl font-mono font-black text-white break-all">{data.ip}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={copyIP}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-mono transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button
              onClick={openMaps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-mono transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Maps
            </button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {rows.map((row) => (
          <div key={row.label} className="p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40">
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-1">{row.label}</p>
            <p className="text-sm text-zinc-300 font-medium truncate">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div
        className="rounded-xl border border-zinc-800 overflow-hidden cursor-pointer group"
        onClick={openMaps}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800">
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Pratinjau Lokasi</p>
          <span className="text-[10px] font-mono text-zinc-700 group-hover:text-zinc-400 transition-colors">Buka Maps ↗</span>
        </div>
        <div className="h-40 relative">
          <iframe
            src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=10&output=embed`}
            className="w-full h-full border-0 opacity-70 group-hover:opacity-90 transition-opacity"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi"
          />
        </div>
      </div>
    </div>
  );
}
