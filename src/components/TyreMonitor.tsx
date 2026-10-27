import { getTyreTelemetry } from "../data/drivingStyleData";
import { DRIVERS, type DriverId } from "../data/sentinel";
import { AlertTriangle, Disc, Flame, Gauge, ShieldAlert, Thermometer } from "lucide-react";

interface TyreMonitorProps {
  driverId: DriverId;
  lap: number;
}

export default function TyreMonitor({ driverId, lap }: TyreMonitorProps) {
  const driver = DRIVERS.find((d) => d.id === driverId) || DRIVERS[0];
  const telemetry = getTyreTelemetry(driverId, lap);

  const getTempColor = (t: number) => {
    if (t > 120) return "text-f1red border-f1red bg-f1red/20 animate-pulse";
    if (t > 108) return "text-amber border-amber/40 bg-amber/15";
    if (t < 92) return "text-cyan border-cyan/40 bg-cyan/15";
    return "text-emerald-400 border-emerald-400/40 bg-emerald-400/15";
  };

  const getStatusBadge = () => {
    switch (telemetry.status) {
      case "BLISTER_SPIKE":
        return <span className="rounded bg-f1red px-2 py-0.5 font-mono text-[10px] text-white font-bold animate-pulse">THERMAL SPIKE / BLISTER</span>;
      case "OVERHEATING":
        return <span className="rounded bg-amber px-2 py-0.5 font-mono text-[10px] text-black font-bold">OVERHEATING (&gt;115°C)</span>;
      case "COLD_GRAINING":
        return <span className="rounded bg-cyan/20 border border-cyan/40 px-2 py-0.5 font-mono text-[10px] text-cyan">COLD / LOW GRIP</span>;
      case "WARM":
        return <span className="rounded bg-amber/20 border border-amber/40 px-2 py-0.5 font-mono text-[10px] text-amber">STINT WEAR</span>;
      default:
        return <span className="rounded bg-emerald-400/20 border border-emerald-400/40 px-2 py-0.5 font-mono text-[10px] text-emerald-400">OPTIMAL WINDOW (100–106°C)</span>;
    }
  };

  return (
    <div className="panel p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <Flame className="h-5 w-5 text-f1red" />
          <div>
            <div className="font-display text-lg uppercase tracking-wide text-white">
              Pirelli Tyre Thermal Telemetry &amp; Degradation
            </div>
            <div className="font-mono text-[10px] text-white/40">
              4-WHEEL SURFACE &amp; CARCASS TEMPERATURE ENGINE · LAP {lap}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="rounded bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-white">
            SET AGE: {telemetry.age} LAPS
          </span>
        </div>
      </div>

      {/* Alert banner if thermal anomaly detected */}
      {telemetry.alert && (
        <div className="mt-4 flex items-center gap-2.5 rounded border border-f1red/50 bg-f1red/15 p-3 text-white">
          <AlertTriangle className="h-4 w-4 text-f1red shrink-0" />
          <span className="font-cond text-sm font-semibold">{telemetry.alert}</span>
        </div>
      )}

      {/* 4-Wheel Thermal Cockpit Visualization */}
      <div className="mt-5 grid gap-6 md:grid-cols-12 items-center">
        {/* Car chassis silhouette with 4 wheels */}
        <div className="md:col-span-7 flex justify-center py-2">
          <div className="relative w-64 h-72 border border-white/10 rounded-2xl bg-black/60 p-4 flex flex-col justify-between">
            {/* Front Axle */}
            <div className="flex justify-between items-center">
              {/* Front Left */}
              <div className={`w-20 p-2 text-center rounded border transition ${getTempColor(telemetry.fl)}`}>
                <div className="font-mono text-[9px] uppercase tracking-wider text-white/60">FL (Left)</div>
                <div className="font-display text-xl font-bold">{telemetry.fl}°C</div>
                <div className="font-mono text-[8px] text-white/40">SURFACE</div>
              </div>

              {/* Nosecone */}
              <div className="w-12 h-14 border border-white/20 rounded-t-lg bg-white/5 flex flex-col items-center justify-center">
                <span className="font-display text-xs text-white/70">#{driver.number}</span>
                <span className="font-mono text-[8px] text-f1red">{driver.id}</span>
              </div>

              {/* Front Right */}
              <div className={`w-20 p-2 text-center rounded border transition ${getTempColor(telemetry.fr)}`}>
                <div className="font-mono text-[9px] uppercase tracking-wider text-white/60">FR (Right)</div>
                <div className="font-display text-xl font-bold">{telemetry.fr}°C</div>
                <div className="font-mono text-[8px] text-white/40">SURFACE</div>
              </div>
            </div>

            {/* Central Cockpit / Carcass Mean */}
            <div className="mx-auto w-32 border border-white/10 rounded-lg p-2 text-center bg-white/3">
              <span className="font-mono text-[9px] text-white/40 block">MEAN CARCASS</span>
              <span className="font-display text-2xl text-white font-bold">{telemetry.carcassTemp}°C</span>
              <div className="mt-1 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${telemetry.wearPct > 70 ? "bg-f1red" : telemetry.wearPct > 40 ? "bg-amber" : "bg-emerald-400"}`}
                  style={{ width: `${telemetry.wearPct}%` }}
                />
              </div>
              <span className="font-mono text-[8px] text-white/50 block mt-0.5">{telemetry.wearPct}% WEAR</span>
            </div>

            {/* Rear Axle */}
            <div className="flex justify-between items-center">
              {/* Rear Left */}
              <div className={`w-20 p-2 text-center rounded border transition ${getTempColor(telemetry.rl)}`}>
                <div className="font-mono text-[9px] uppercase tracking-wider text-white/60">RL (Left)</div>
                <div className="font-display text-xl font-bold">{telemetry.rl}°C</div>
                <div className="font-mono text-[8px] text-white/40">TRACTION</div>
              </div>

              {/* Rear Wing Diffuser */}
              <div className="w-14 h-8 border border-white/20 rounded-b-lg bg-f1red/10 flex items-center justify-center">
                <span className="font-mono text-[8px] tracking-widest text-cyan">ACTIVE WING</span>
              </div>

              {/* Rear Right */}
              <div className={`w-20 p-2 text-center rounded border transition ${getTempColor(telemetry.rr)}`}>
                <div className="font-mono text-[9px] uppercase tracking-wider text-white/60">RR (Right)</div>
                <div className="font-display text-xl font-bold">{telemetry.rr}°C</div>
                <div className="font-mono text-[8px] text-white/40">TRACTION</div>
              </div>
            </div>
          </div>
        </div>

        {/* Compound details & thermal operating ranges */}
        <div className="md:col-span-5 space-y-3 font-cond">
          <div className="border border-white/10 p-3 bg-white/2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-white/40">ACTIVE COMPOUND:</span>
              <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                telemetry.compound === "S" ? "bg-red-600 text-white" :
                telemetry.compound === "M" ? "bg-yellow-400 text-black" : "bg-white text-black"
              }`}>
                {telemetry.compound} · {telemetry.compoundName}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono text-white/70">
              <div>STINT: Laps {telemetry.age} / 28 target</div>
              <div>DEGRADATION: ~{Math.round(telemetry.age * 0.04 * 100) / 100}s/lap</div>
            </div>
          </div>

          <div className="border border-white/10 p-3 bg-white/2">
            <div className="font-mono text-[10px] uppercase text-white/40 mb-2">THERMAL OPERATING BANDS:</div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-cyan">Cold Graining Band:</span>
                <span className="text-white/60">&lt; 90°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400">Peak Grip Window:</span>
                <span className="text-white/80 font-bold">100°C – 106°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber">Thermal Degradation:</span>
                <span className="text-white/60">108°C – 114°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-f1red">Blister / Flat Spot Danger:</span>
                <span className="text-f1red font-bold">&gt; 118°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
