import {
  computeDriverStyle,
  DRIVER_STYLE_BASELINES,
} from "../data/drivingStyleData";
import { DRIVERS, type DriverId } from "../data/sentinel";
import { Activity, AlertCircle, Compass, History, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

interface DriverStyleMonitorProps {
  driverId: DriverId;
  lap: number;
  lapTime: number;
  zScore: number;
}

export default function DriverStyleMonitor({
  driverId,
  lap,
  lapTime,
  zScore,
}: DriverStyleMonitorProps) {
  const driver = DRIVERS.find((d) => d.id === driverId) || DRIVERS[0];
  const profile = DRIVER_STYLE_BASELINES[driverId] || DRIVER_STYLE_BASELINES["ANT"];
  const styleAnalysis = computeDriverStyle(driverId, lap, lapTime, zScore);

  const dimensions = [
    {
      key: "brakingLateAggression",
      label: "Braking Depth & Aggression",
      current: styleAnalysis.current.brakingLateAggression,
      base: styleAnalysis.baseline.brakingLateAggression,
      unit: "%",
      desc: "Late braking threshold pressure and deceleration curve sharpness",
    },
    {
      key: "throttleTipInAggression",
      label: "Throttle Application Aggression",
      current: styleAnalysis.current.throttleTipInAggression,
      base: styleAnalysis.baseline.throttleTipInAggression,
      unit: "%",
      desc: "Rate of throttle tip-in (%/sec) during corner exit phase",
    },
    {
      key: "cornerApexSpeedKmh",
      label: "Corner Apex Minimum Speed",
      current: styleAnalysis.current.cornerApexSpeedKmh,
      base: styleAnalysis.baseline.cornerApexSpeedKmh,
      unit: "km/h",
      desc: "Apex roll commitment speed across mid-corner sequence",
    },
    {
      key: "steeringSmoothness",
      label: "Steering Smoothness Index",
      current: styleAnalysis.current.steeringSmoothness,
      base: styleAnalysis.baseline.steeringSmoothness,
      unit: "/100",
      desc: "Rotational smoothness vs rapid micro-correction oscillation count",
    },
    {
      key: "tyreScrubStress",
      label: "Tyre Lateral Scrub Stress",
      current: styleAnalysis.current.tyreScrubStress,
      base: styleAnalysis.baseline.tyreScrubStress,
      unit: "%",
      desc: "Frictional tyre slip energy generated through rotation",
    },
    {
      key: "energyDiscipline",
      label: "Energy Harvest / Deploy Discipline",
      current: styleAnalysis.current.energyDiscipline,
      base: styleAnalysis.baseline.energyDiscipline,
      unit: "%",
      desc: "Compliance with lift-and-coast harvest targets under 2026 MGU-K rules",
    },
  ];

  return (
    <div className="panel p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <Compass className="h-5 w-5 text-cyan" />
          <div>
            <div className="font-display text-lg uppercase tracking-wide text-white">
              Driver Driving Style Fingerprint &amp; Career Baseline Deviation
            </div>
            <div className="font-mono text-[10px] text-white/40">
              LEARNED FROM {profile.historicalRacesCount} PREVIOUS GRAND PRIX RACES · CURRENT LAP {lap}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan/15 border border-cyan/40 px-2.5 py-0.5 font-mono text-[11px] text-cyan">
            {profile.archetype}
          </span>
          <span className={`rounded px-2.5 py-0.5 font-mono text-[11px] font-bold ${
            styleAnalysis.deviationSeverity === "critical"
              ? "bg-f1red text-white animate-pulse"
              : styleAnalysis.deviationSeverity === "significant"
              ? "bg-amber text-black"
              : styleAnalysis.deviationSeverity === "minor"
              ? "bg-white/10 text-white"
              : "bg-emerald-400/20 text-emerald-400"
          }`}>
            STYLE DEVIATION: {styleAnalysis.deviationPct}%
          </span>
        </div>
      </div>

      {/* Driver Archetype & Career Profile Brief */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-white/2 p-3 border-l-2 border-cyan">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-display text-base text-white" style={{ background: driver.color }}>
            {driver.number}
          </div>
          <div>
            <div className="font-display text-base text-white uppercase">{driver.name} ({driver.team})</div>
            <div className="font-cond text-xs text-white/60">{profile.description}</div>
          </div>
        </div>
        <div className="text-right font-mono text-xs">
          <span className="text-white/40">HISTORICAL CORPUS: </span>
          <span className="text-cyan font-semibold">{profile.historicalRacesCount} races benchmarked</span>
        </div>
      </div>

      {/* Style Anomaly Explanation Banner */}
      {styleAnalysis.deviationPct > 5 && (
        <div className={`mt-3 p-3 rounded border text-sm font-cond flex items-center gap-3 ${
          styleAnalysis.deviationSeverity === "critical"
            ? "border-f1red/50 bg-f1red/15 text-white"
            : "border-amber/40 bg-amber/10 text-white/90"
        }`}>
          <AlertCircle className={`h-4 w-4 shrink-0 ${styleAnalysis.deviationSeverity === "critical" ? "text-f1red" : "text-amber"}`} />
          <div>
            <span className="font-bold uppercase font-mono text-[11px] block">
              {styleAnalysis.deviationSeverity === "critical" ? "CRITICAL STYLE DEVIATION DETECTED" : "OBSERVED STYLE DEVIATION"}
            </span>
            <span>{styleAnalysis.deviationExplanation}</span>
          </div>
        </div>
      )}

      {/* 6-Dimensional Comparative Metrics Grid */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {dimensions.map((dim) => {
          const delta = dim.current - dim.base;
          const isShift = Math.abs(delta) > 8;
          return (
            <div key={dim.key} className="border border-white/10 p-3.5 bg-black/40 rounded">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm uppercase text-white tracking-wide">{dim.label}</span>
                <span className={`font-mono text-xs font-bold ${
                  delta > 0 ? "text-cyan" : delta < 0 ? "text-f1red" : "text-white/50"
                }`}>
                  {delta > 0 ? `+${delta}` : delta} {dim.unit} vs Baseline
                </span>
              </div>
              <p className="mt-1 font-cond text-xs text-white/40">{dim.desc}</p>

              {/* Progress bars: Current vs Baseline */}
              <div className="mt-3 space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between text-white/70">
                  <span>Current Stint:</span>
                  <span className="text-white font-bold">{dim.current} {dim.unit}</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isShift ? "bg-f1red" : "bg-cyan"}`}
                    style={{ width: `${Math.min(100, (dim.current / (dim.key === "cornerApexSpeedKmh" ? 170 : 100)) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-white/40">
                  <span>All Previous Races Baseline:</span>
                  <span>{dim.base} {dim.unit}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/40"
                    style={{ width: `${Math.min(100, (dim.base / (dim.key === "cornerApexSpeedKmh" ? 170 : 100)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
