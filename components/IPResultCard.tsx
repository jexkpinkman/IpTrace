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
      addToast("success", "Alamat IP disalin!");
    } catch {
      addToast("error", "Gagal menyalin IP");
    }
  }

  function openMaps() {
    window.open(generateMapsUrl(data.latitude, data.longitude), "_blank", "noopener,noreferrer");
  }

  const flag = getFlagEmoji(data.countryCode);

  const rows: { label: string; value: string; icon: React.ReactNode }[] = [
    {
      label: "Country",
      value: `${flag} ${data.country}`,
      icon: <GlobeIcon />,
    },
    {
      label: "City",
      value: data.city,
      icon: <CityIcon />,
    },
    {
      label: "Region",
      value: data.region,
      icon: <MapIcon />,
    },
    {
      label: "ISP",
      value: data.isp,
      icon: <NetworkIcon />,
    },
    {
      label: "ASN",
      value: data.asn,
      icon: <ServerIcon />,
    },
    {
      label: "Timezone",
      value: data.timezone,
      icon: <ClockIcon />,
    },
    {
      label: "Coordinates",
      value: `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
      icon: <PinIcon />,
    },
  ];

  return (
    <div className="animate-slide-up w-full">
      {/* IP Hero */}
      <div className="relative mb-6 rounded-2xl overflow-hidden border border-sky-400/20 bg-navy-800/60 backdrop-blur-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Pulse rings */}
        <div className="absolute -left-6 -top-6 w-32 h-32 opacity-20">
          <div className="absolute inset-0 rounded-full border border-sky-400 animate-ping" style={{ animationDuration: "2.5s" }} />
          <div className="absolute inset-4 rounded-full border border-sky-400/60 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.4s" }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-sky-400/70 uppercase tracking-widest mb-1">IP Address</p>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-white break-all leading-tight">
            {data.ip}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyIP}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-400/10 hover:bg-sky-400/20 border border-sky-400/30 text-sky-400 text-sm font-medium transition-all hover:scale-105 active:scale-95"
          >
            <CopyIcon />
            Copy
          </button>
          <button
            onClick={openMaps}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-400/10 hover:bg-indigo-400/20 border border-indigo-400/30 text-indigo-400 text-sm font-medium transition-all hover:scale-105 active:scale-95"
          >
            <MapsIcon />
            Maps
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-navy-800/40 backdrop-blur-sm hover:border-sky-400/20 hover:bg-navy-800/60 transition-all group"
          >
            <span className="mt-0.5 text-sky-400/60 group-hover:text-sky-400/90 transition-colors shrink-0">
              {row.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{row.label}</p>
              <p className="text-sm text-slate-200 font-medium truncate">{row.value}</p>
            </div>
          </div>
        ))}

        {/* Maps embed cell */}
        <div
          className="sm:col-span-2 flex flex-col gap-2 p-4 rounded-xl border border-white/5 bg-navy-800/40 backdrop-blur-sm hover:border-sky-400/20 transition-all cursor-pointer"
          onClick={openMaps}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
              <PinIcon />
              <span>Pratinjau Lokasi</span>
            </div>
            <span className="text-xs text-sky-400/70 hover:text-sky-400 transition-colors">
              Buka di Google Maps →
            </span>
          </div>
          <div className="w-full h-40 rounded-lg overflow-hidden bg-navy-900/60 relative">
            <iframe
              src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=10&output=embed`}
              className="w-full h-full border-0 opacity-80 hover:opacity-100 transition-opacity"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta lokasi"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function GlobeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function CityIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function MapsIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    </svg>
  );
}
