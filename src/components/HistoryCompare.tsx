import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHAMPIONS,
  CONSTRUCTOR_TITLES,
  IMAGES,
} from "../data/f1Data";

export default function HistoryCompare() {
  const titlesByDecade = useMemo(() => {
    const buckets: Record<string, number> = {};
    CHAMPIONS.forEach((c) => {
      const d = `${Math.floor(c.year / 10) * 10}s`;
      buckets[d] = (buckets[d] || 0) + 1;
    });
    return Object.entries(buckets).map(([decade, n]) => ({ decade, n }));
  }, []);

  return (
    <section id="history" className="relative border-t border-white/10 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-[11px] tracking-[0.32em] text-f1red">02 — HISTORICAL BASELINE 1950–2026</p>
        <h2 className="mt-2 font-display text-4xl uppercase tracking-wide text-white md:text-5xl">
          Seventy-five years of signal
        </h2>
        <p className="mt-3 max-w-2xl font-cond text-lg text-white/55">
          F1 Tracker Sentinel does not treat 2026 as a continuation of 2025. It keeps an era-gated prior so a 1:12 Monaco pole is
          normal now — and would have been alien in 2019.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="group relative h-72 overflow-hidden">
            <img src={IMAGES.car1950} alt="1950s Formula 1 car" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <div className="font-mono text-[10px] tracking-[0.28em] text-amber">1950 · SILVERSTONE TO MONACO</div>
              <div className="font-display text-3xl uppercase text-white">Front-engine, 1:50 pole</div>
              <p className="mt-1 max-w-sm font-cond text-white/70">Fangio's Alfa 158. Drum brakes. No belts. Pit stops that lasted a minute.</p>
            </div>
          </div>
          <div className="group relative h-72 overflow-hidden">
            <img src={IMAGES.car2026} alt="2026 Formula 1 car" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <div className="font-mono text-[10px] tracking-[0.28em] text-cyan">2026 · ACTIVE AERO + 50/50 PU</div>
              <div className="font-display text-3xl uppercase text-white">Narrow, electric, 1:12 pole</div>
              <p className="mt-1 max-w-sm font-cond text-white/70">Antonelli's Mercedes. 350 kW MGU-K. Wings that move. 22 cars on the grid.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <div className="panel p-4">
            <h3 className="mb-3 font-display text-xl uppercase text-white">Constructors' titles</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONSTRUCTOR_TITLES} layout="vertical" margin={{ left: 16, right: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#666" tick={{ fill: "#888", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#666" tick={{ fill: "#ccc", fontSize: 12, fontFamily: "Oswald" }} width={80} />
                  <Tooltip contentStyle={{ background: "#101114", border: "1px solid #333" }} />
                  <Bar dataKey="titles" fill="#e10600" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="panel overflow-hidden">
            <div className="border-b border-white/10 px-4 py-3 font-display text-xl uppercase text-white">
              World Champions 1950–2025
            </div>
            <div className="max-h-[280px] overflow-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-panel">
                  <tr className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                    <th className="px-4 py-2">YEAR</th>
                    <th>DRIVER</th>
                    <th>TEAM</th>
                    <th>NAT</th>
                  </tr>
                </thead>
                <tbody>
                  {CHAMPIONS.slice()
                    .reverse()
                    .map((c) => (
                      <tr key={c.year} className="border-t border-white/5 hover:bg-white/4">
                        <td className="px-4 py-1.5 font-mono text-sm text-f1red">{c.year}</td>
                        <td className="font-cond text-base text-white">{c.driver}</td>
                        <td className="font-cond text-white/60">{c.team}</td>
                        <td className="font-mono text-xs text-white/40">{c.nation}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p className="mt-4 font-mono text-[11px] text-white/30">
          {titlesByDecade.map((d) => `${d.decade}: ${d.n} titles`).join("  ·  ")}
        </p>
      </div>
    </section>
  );
}
