import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center max-w-2xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-400/20 bg-sky-400/5 text-sky-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          Alat Geolokasi IP Gratis
        </div>

        <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
          ip<span className="text-sky-400">trace</span>
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl mb-12 leading-relaxed">
          Lacak alamat IPv4 atau IPv6 manapun. Dapatkan negara, kota, ISP, ASN, zona waktu, dan koordinat &mdash; secara instan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          <Link
            href="/ip-lookup"
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-sky-400/20 bg-navy-800/60 backdrop-blur-sm hover:border-sky-400/40 hover:bg-navy-800/80 transition-all hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-400/10 flex items-center justify-center group-hover:bg-sky-400/20 transition-colors">
              <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="font-display font-semibold text-white mb-1">Cek IP</p>
              <p className="text-xs text-slate-500">Lacak alamat IP manapun</p>
            </div>
          </Link>

          <Link
            href="/my-ip"
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-indigo-400/20 bg-navy-800/60 backdrop-blur-sm hover:border-indigo-400/40 hover:bg-navy-800/80 transition-all hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-400/10 flex items-center justify-center group-hover:bg-indigo-400/20 transition-colors">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-display font-semibold text-white mb-1">IP Saya</p>
              <p className="text-xs text-slate-500">Cek IP publikmu</p>
            </div>
          </Link>

          <Link
            href="/tracker"
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-emerald-400/20 bg-navy-800/60 backdrop-blur-sm hover:border-emerald-400/40 hover:bg-navy-800/80 transition-all hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center group-hover:bg-emerald-400/20 transition-colors">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="font-display font-semibold text-white mb-1">Pelacak</p>
              <p className="text-xs text-slate-500">Buat link pelacak</p>
            </div>
          </Link>
        </div>

        <p className="mt-12 text-xs text-slate-600">
          Didukung oleh{" "}
          <a href="https://ipwho.is" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-400 transition-colors">
            ipwho.is
          </a>
          {" · "}
          Jexk-Tracker
        </p>
      </div>
    </div>
  );
}
