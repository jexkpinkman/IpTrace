import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg mx-auto">
        <p className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 uppercase mb-5">
          by jexkpinkman
        </p>
        <h1 className="font-mono text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight">
          JEXK<span className="text-zinc-600">.</span>TRACK
        </h1>
        <p className="text-zinc-500 text-sm mb-14 leading-relaxed">
          Lacak IP, lokasi, dan perangkat siapapun yang buka linkmu.<br />
          Tanpa mereka tau.
        </p>

        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
          <Link href="/ip-lookup" className="group flex flex-col items-start gap-3 p-4 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-mono font-semibold text-zinc-300 group-hover:text-white transition-colors">Cek IP</p>
              <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">Lacak IP manapun</p>
            </div>
          </Link>

          <Link href="/my-ip" className="group flex flex-col items-start gap-3 p-4 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-mono font-semibold text-zinc-300 group-hover:text-white transition-colors">IP Saya</p>
              <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">IP publik kamu</p>
            </div>
          </Link>

          <Link href="/tracker" className="group flex flex-col items-start gap-3 p-4 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-800/40 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-mono font-semibold text-zinc-300 group-hover:text-white transition-colors">Pelacak</p>
              <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">Buat link jebakan</p>
            </div>
          </Link>
        </div>

        <p className="mt-12 font-mono text-[10px] text-zinc-800 tracking-widest uppercase">
          powered by ipwho.is
        </p>
      </div>
    </div>
  );
}
