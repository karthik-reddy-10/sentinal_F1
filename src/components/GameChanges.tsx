import { CURRENT_CHANGES, IMAGES, REGULATION_SHIFTS } from "../data/f1Data";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, GitCommitHorizontal } from "lucide-react";

const ICONS = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  shift: GitCommitHorizontal,
};

export default function GameChanges() {
  return (
    <section id="changes" className="relative border-t border-white/10 py-20">
      <div className="absolute inset-0 opacity-20">
        <img src={IMAGES.wet} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-carbon" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-[11px] tracking-[0.32em] text-f1red">03 — CURRENT RUNNING GAME</p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl uppercase leading-none tracking-wide text-white md:text-5xl">
          What actually changed in 2026
        </h2>
        <p className="mt-4 max-w-2xl font-cond text-lg text-white/60">
          Sentinel compares the live Mexico stream against a 1950–2025 prior <em>and</em> a 2026-conditional baseline.
          These are the regime shifts that would poison a naïve detector.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {CURRENT_CHANGES.map((c) => {
            const Icon = ICONS[c.direction];
            return (
              <article key={c.id} className="panel flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[9px] tracking-[0.22em] ${
                          c.severity === "critical" ? "text-f1red" : c.severity === "high" ? "text-amber" : "text-cyan"
                        }`}
                      >
                        {c.category.toUpperCase()} · {c.severity.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-2xl uppercase leading-tight text-white">{c.title}</h3>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/70">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-white/4 px-2 py-1.5 text-white/45">
                    VS <span className="text-white/80">{c.vs}</span>
                  </div>
                  <div className="bg-f1red/15 px-2 py-1.5 text-f1red">{c.delta}</div>
                </div>
                <p className="mt-3 flex-1 font-cond text-base leading-relaxed text-white/65">{c.detail}</p>
                <div className="mt-3 border-l-2 border-cyan/60 pl-3">
                  <div className="font-mono text-[9px] tracking-[0.2em] text-cyan">EVIDENCE</div>
                  <p className="font-cond text-sm text-white/75">{c.evidence}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          <div className="panel overflow-hidden lg:col-span-2">
            <img src={IMAGES.grid} alt="Starting lights" className="h-48 w-full object-cover" />
            <div className="p-5">
              <h3 className="font-display text-2xl uppercase text-white">Lights-out is a different sport</h3>
              <p className="mt-2 font-cond text-white/60">
                22 cars, active wings already in Z-mode, batteries pre-charged to a sporting SOC cap. A 1950 rolling start
                and a 2014 hybrid start are both poor priors. Sentinel keeps three start models and picks by era gate.
              </p>
            </div>
          </div>
          <div className="panel p-4 lg:col-span-3">
            <h3 className="mb-2 font-display text-xl uppercase text-white">Regulation shock magnitude</h3>
            <p className="mb-3 font-cond text-white/50">
              How violently each rule change moved the time-series. 2026 is the largest simultaneous chassis + PU reset
              since the hybrid formula.
            </p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={REGULATION_SHIFTS} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" stroke="#666" tick={{ fill: "#888", fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                  <YAxis stroke="#666" tick={{ fill: "#888", fontSize: 11 }} width={36} />
                  <Tooltip
                    contentStyle={{ background: "#101114", border: "1px solid #333", fontFamily: "IBM Plex Mono", fontSize: 12 }}
                    formatter={(v, _n, item) => [v, (item?.payload as { title?: string })?.title ?? "shock"]}
                  />
                  <Area type="monotone" dataKey="magnitude" stroke="#e10600" fill="#e10600" fillOpacity={0.25} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
