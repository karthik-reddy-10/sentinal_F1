import { IMAGES } from "../data/f1Data";
import { useTracker } from "../context/TrackerContext";
import { exportPredictionsToCsv } from "../data/nabDatasets";

export default function Footer() {
  const { analysisHistory, ingestMode, starterId } = useTracker();

  const handleExportCsv = () => {
    const exportRows = analysisHistory.map((h) => ({
      timestamp: h.timestamp,
      value: h.value,
      score: h.score,
      label: h.label,
      windowId: h.windowId,
      delayMs: Math.round(h.runtimeMs * 100),
      reason: h.reason,
    }));
    const csvContent = exportPredictionsToCsv(exportRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileSuffix = ingestMode === "nab_starter" ? starterId : "f1_telemetry_2026";
    link.setAttribute("download", `predictions_${fileSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10">
      <img src={IMAGES.nightCar} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/70" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <div className="font-display text-5xl uppercase tracking-wide text-white">
              F1 TRACKER<span className="text-f1red">.</span>
            </div>
            <p className="mt-2 max-w-md font-cond text-lg text-white/55">
              Challenge 2 — Sentinel Adaptive Time-Series Anomaly Detection. Real-time Google &amp; OpenF1 1-second telemetry,
              8 permitted models, explainable evidence packets, and NAB benchmark validation.
            </p>
          </div>
          <div className="font-mono text-[11px] leading-6 tracking-[0.14em] text-white/40">
            TEAM APEX SIGNAL
            <br />
            TRACK 02 · SENTINEL
            <br />
            NAB + F1 1950–2026 PRIOR
            <br />
            <span className="text-f1red">EVENT-F1 0.869</span>
          </div>
        </div>
        <div className="hairline my-8" />
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] text-white/35">
          <span>NOT AFFILIATED WITH FORMULA 1 / FIA — DEMO FOR CHALLENGE 2</span>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <a
              href="https://github.com/karthik-reddy-10/sentinal_F1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white hover:underline transition"
              title="View GitHub Repository"
            >
              SOURCE (GITHUB)
            </a>
            <span>·</span>
            <a
              href="#pipeline"
              className="text-white/60 hover:text-white hover:underline transition"
            >
              NOTEBOOKS
            </a>
            <span>·</span>
            <button
              onClick={handleExportCsv}
              className="text-cyan hover:text-white hover:underline transition cursor-pointer"
              title="Download standard predictions CSV (timestamp, value, anomaly_score, label)"
            >
              RESULTS FILE (.CSV)
            </button>
            <span>·</span>
            <a
              href="#pipeline"
              className="text-white/60 hover:text-white hover:underline transition"
            >
              REPRODUCIBILITY SUITE
            </a>
            <span>·</span>
            <a
              href="#live"
              className="text-f1red font-bold hover:text-white hover:underline transition"
            >
              LIVE DEMO
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
