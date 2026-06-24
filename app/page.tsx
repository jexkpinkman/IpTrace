import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-52px)] flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center max-w-xl mx-auto">

        <p className="font-mono text-xs tracking-[0.3em] text-zinc-600 uppercase mb-6">
          by jexkpinkman
        </p>

        <h1 className="font-mono text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
          jexk<span className="text-violet-400">.</span>track
        </h1>

        <p className="text-zinc-500 text-sm mb-14 leading-relaxed max-w-sm mx-auto">
          Lacak IP, lokasi, dan perangkat siapapun yang membuka linkmu — tanpa mereka tau.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
          <Link href="/ip-lookup" className="group p-5 border border-white/5 hover:border-violet-400/20 bg-white/[0.02] hover:bg-violet-400/[0.03] rounded-xl transition-all">
            <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest mb-2">01</p>
            <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Cek IP</p>
            <p className="text-xs text-zinc-600 mt-1">Lacak IP manapun</p>
          </Link>

          <Link href="/my-ip" className="group p-5 border border-white/5 hover:border-violet-400/20 bg-white/[0.02] hover:bg-violet-400/[0.03] rounded-xl transition-all">
            <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest mb-2">02</p>
            <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">IP Saya</p>
            <p className="text-xs text-zinc-600 mt-1">Lihat IP publikmu</p>
          </Link>

          <Link href="/tracker" className="group p-5 border border-white/5 hover:border-violet-400/20 bg-white/[0.02] hover:bg-violet-400/[0.03] rounded-xl transition-all">
            <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest mb-2">03</p>
            <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Pelacak</p>
            <p className="text-xs text-zinc-600 mt-1">Buat link jebakan</p>
          </Link>
        </div>

        <p className="mt-14 text-xs text-zinc-700 font-mono">
          powered by ipwho.is · free · no api key
        </p>
      </div>
    </div>
  );
}
