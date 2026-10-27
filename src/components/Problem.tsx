import { IMAGES } from "../data/f1Data";
import { Binary, Clock, Crosshair, Timer } from "lucide-react";

export default function Problem() {
  return (
    <section className="relative border-t border-white/10 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="relative overflow-hidden">
            <img src={IMAGES.helmet} alt="Driver in cockpit" className="h-[420px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-carbon/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 panel p-4">
              <div className="font-mono text-[10px] tracking-[0.25em] text-f1red">PROBLEM OBJECTIVE</div>
              <p className="mt-1 font-cond text-lg text-white/80">
                Learn baseline behaviour from streaming time-series. Flag windows that deviate. For every flag: a score,
                a NORMAL / ANOMALOUS label, and interpretability.
              </p>
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.32em] text-f1red">CHALLENGE 2 · F1 TRACKER (SENTINEL)</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-none tracking-wide text-white">
              Adaptive detection
              <span className="block text-white/40">on a moving sport</span>
            </h2>
            <p className="mt-4 font-cond text-lg leading-relaxed text-white/60">
              Numenta Anomaly Benchmark taught the model how to score events in time. Formula 1 from 1950 to last Sunday
              taught it that the data-generating process itself keeps mutating — engines, tyres, wings, even the number
              of cars. A detector that cannot see 2026 as a new regime will scream at every lap.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Crosshair, t: "Primary metric", d: "Event-based F1" },
                { icon: Binary, t: "Output", d: "Score + label + evidence" },
                { icon: Clock, t: "Detection delay", d: "Onset → trigger" },
                { icon: Timer, t: "Runtime", d: "ms per streaming window" },
              ].map((x) => (
                <div key={x.t} className="panel flex items-start gap-3 p-4">
                  <x.icon className="mt-0.5 h-4 w-4 text-f1red" />
                  <div>
                    <div className="font-display text-sm uppercase tracking-wide text-white">{x.t}</div>
                    <div className="font-cond text-white/50">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
