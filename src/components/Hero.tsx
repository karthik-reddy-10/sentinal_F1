import { IMAGES, TICKER } from "../data/f1Data";
import { Activity, Gauge, Radio, ShieldAlert } from "lucide-react";

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      <img
        src={IMAGES.hero}
        alt="2026 Formula 1 car at night"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-black/50" />
      <div className="scanlines absolute inset-0" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-20">
        <div className="fade-up max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 border border-f1red/50 bg-f1red/15 px-3 py-1">
            <ShieldAlert className="h-3.5 w-3.5 text-f1red" />
            <span className="font-mono text-[10px] tracking-[0.28em] text-f1red">
              CHALLENGE 02 · SENTINEL · TEAM APEX SIGNAL
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold uppercase leading-[0.92] tracking-wide text-white sm:text-7xl md:text-8xl">
            F1 Tracker
            <span className="block text-f1red">Sentinel for Formula 1</span>
          </h1>
          <p className="mt-6 max-w-xl font-cond text-lg leading-relaxed text-white/70 sm:text-xl">
            Real-time streaming anomaly detection on 1-second Google / OpenF1 race telemetry. Directly connects
            to live feeds during racing and runs high-fidelity 1s demo simulation when off-track — explaining
            every deviation with physical &amp; statistical evidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#live"
              className="bg-f1red px-6 py-3 font-display text-sm tracking-[0.2em] text-white red-glow transition hover:bg-red-700"
            >
              WATCH LIVE 1s FEED
            </a>
            <a
              href="#controls"
              className="border border-white/25 px-6 py-3 font-display text-sm tracking-[0.2em] text-white transition hover:border-white hover:bg-white/5"
            >
              PIPELINE &amp; ALGORITHMS
            </a>
            <a
              href="#evidence"
              className="border border-white/25 px-6 py-3 font-display text-sm tracking-[0.2em] text-white transition hover:border-white hover:bg-white/5"
            >
              EVIDENCE &amp; REASONS
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Radio, k: "1-Sec Telemetry", v: "Google / Demo stream" },
            { icon: Gauge, k: "NAB 0.869 | Live F1 0.847", v: "Benchmark Suite vs Live Telemetry" },
            { icon: Activity, k: "4.2 ms / window", v: "Meets <10ms limit" },
            { icon: ShieldAlert, k: "8 Permitted Models", v: "Hybrid Ensemble" },
          ].map((s) => (
            <div key={s.k} className="panel px-4 py-3">
              <s.icon className="mb-2 h-4 w-4 text-f1red" />
              <div className="font-display text-lg tracking-wide text-white">{s.k}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-f1red/40 bg-black/80 py-2">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="font-mono text-[11px] tracking-[0.28em] text-white/70">
              <span className="mr-3 text-f1red">■</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
