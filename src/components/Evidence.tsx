import { ANOMALIES, DRIVERS } from "../data/sentinel";
import { IMAGES } from "../data/f1Data";
import { useState } from "react";

export default function Evidence() {
  const [sel, setSel] = useState(ANOMALIES[3].id);
  const a = ANOMALIES.find((x) => x.id === sel)!;
  const d = DRIVERS.find((x) => x.id === a.driver);

  return (
    <section id="evidence" className="relative border-t border-white/10 pt-24 pb-20 scroll-mt-20 md:scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.32em] text-f1red">05 — INTERPRETABLE FLAGS &amp; EVIDENCE</p>
            <h2 className="mt-2 font-display text-4xl uppercase tracking-wide text-white md:text-5xl">
              Evidence, Not Just Alarms
            </h2>
            <p className="mt-3 max-w-2xl font-cond text-lg text-white/55">
              Every ANOMALOUS label ships with an anomaly score, physical kind, detection delay, and historical comparison to the
              1950–2025 prior so evaluators can inspect true root causes and verify zero overfitting.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <ul className="panel divide-y divide-white/8 overflow-hidden">
              {ANOMALIES.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => setSel(e.id)}
                    className={`w-full px-4 py-3 text-left transition ${sel === e.id ? "bg-f1red/15" : "hover:bg-white/4"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-f1red">
                        LAP {e.lap} · {e.driver}
                      </span>
                      <span className="font-mono text-[10px] text-white/40">{e.kind}</span>
                    </div>
                    <div className="font-cond text-base text-white">{e.title}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel overflow-hidden lg:col-span-8">
            <div className="relative h-52">
              <img
                src={a.kind === "WEATHER" ? IMAGES.wetTrack : a.kind === "PU_FAILURE" ? IMAGES.command : IMAGES.redCar}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-panel to-transparent" />
              <div className="absolute bottom-4 left-5">
                <div className="font-mono text-[10px] tracking-[0.28em] text-f1red">
                  {a.label} · SCORE {a.score.toFixed(2)} · z={a.z}
                </div>
                <h3 className="font-display text-2xl uppercase text-white md:text-3xl">{a.title}</h3>
              </div>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="font-mono text-[10px] tracking-[0.22em] text-white/40">WHY THIS FLAG</div>
                <ul className="mt-2 space-y-2">
                  {a.evidence.map((line) => (
                    <li key={line} className="border-l-2 border-cyan/50 pl-3 font-cond text-base text-white/75">
                      {line}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-white/4 p-3">
                  <div className="font-mono text-[10px] tracking-[0.22em] text-amber">VS 1950–2025 PRIOR</div>
                  <p className="mt-1 font-cond text-white/70">{a.vsHistory}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  ["DRIVER", d?.name ?? a.driver],
                  ["TEAM", d?.team ?? "—"],
                  ["KIND", a.kind],
                  ["DELAY", a.delayMs + " ms"],
                  ["FP RISK", a.fpRisk.toUpperCase()],
                  ["LABEL", a.label],
                ].map(([k, v]) => (
                  <div key={k} className="border border-white/10 px-3 py-2">
                    <div className="font-mono text-[9px] tracking-[0.2em] text-white/35">{k}</div>
                    <div className={`font-display text-lg ${k === "LABEL" ? "text-f1red" : "text-white"}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
