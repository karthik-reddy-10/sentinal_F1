import { useState } from "react";
import {
  RACE_CONTROL_MESSAGES,
  TRACK_MAP_POINTS,
  getTyreTelemetry,
} from "../data/drivingStyleData";
import { DRIVERS, RACES, formatLap, type DriverId } from "../data/sentinel";
import { useTracker } from "../context/TrackerContext";
import {
  Clock,
  Flag,
  MapPin,
  Radio,
  Sliders,
  Timer,
  Volume2,
  Zap,
} from "lucide-react";

interface FormulaTimerLiveProps {
  cursor: number;
}

export default function FormulaTimerLive({ cursor }: FormulaTimerLiveProps) {
  const { driverId, setDriverId, broadcastDelay, setBroadcastDelay } = useTracker();
  const [activeTab, setActiveTab] = useState<"timing" | "map" | "race_control">("timing");

  // Build real-time leaderboard data for all 8 drivers
  const leaderboard = DRIVERS.map((d, index) => {
    const racePoints = RACES[d.id];
    const pt = racePoints[cursor - 1] || racePoints[0];
    const prevPt = racePoints[Math.max(0, cursor - 2)];
    const tyre = getTyreTelemetry(d.id, cursor);

    // Leader is driver at index 0 (or sorted by cumulative time)
    const leaderTime = RACES["ANT"][cursor - 1]?.time ?? 79.05;
    const gap = Math.max(0, pt.time - leaderTime + index * 0.45);
    const interval = index === 0 ? 0 : Math.max(0.15, gap - (index - 1) * 0.45);

    // Sector colors (purple, green, yellow)
    let s1Color = "text-amber-400 bg-amber-400/10";
    let s2Color = "text-amber-400 bg-amber-400/10";
    let s3Color = "text-amber-400 bg-amber-400/10";

    if (pt.s1 < 22.9) s1Color = "text-purple-400 bg-purple-400/15 font-bold";
    else if (prevPt && pt.s1 < prevPt.s1) s1Color = "text-emerald-400 bg-emerald-400/15";

    if (pt.s2 < 29.2) s2Color = "text-purple-400 bg-purple-400/15 font-bold";
    else if (prevPt && pt.s2 < prevPt.s2) s2Color = "text-emerald-400 bg-emerald-400/15";

    if (pt.s3 < 27.1) s3Color = "text-purple-400 bg-purple-400/15 font-bold";
    else if (prevPt && pt.s3 < prevPt.s3) s3Color = "text-emerald-400 bg-emerald-400/15";

    return {
      driver: d,
      position: index + 1,
      lapTime: pt.time,
      s1: pt.s1,
      s2: pt.s2,
      s3: pt.s3,
      s1Color,
      s2Color,
      s3Color,
      gap,
      interval,
      tyre,
      isAnom: pt.label === "ANOMALOUS",
      event: pt.event,
      speed: pt.speed,
      mode: pt.mode,
    };
  });

  // Circuit SVG path string
  const pathD = TRACK_MAP_POINTS.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`,
    ""
  ) + " Z";

  // Filter messages up to current lap
  const relevantMessages = RACE_CONTROL_MESSAGES.filter((m) => m.lap <= cursor);

  return (
    <div className="panel p-5">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <Timer className="h-5 w-5 text-f1red" />
          <div>
            <div className="font-display text-lg uppercase tracking-wide text-white">
              Formula-Timer Live Timing &amp; Circuit Telemetry Suite
            </div>
            <div className="font-mono text-[10px] text-white/40">
              MILLI-SECOND LEADERBOARD · MICRO-SECTORS · TRACK GPS · RACE CONTROL
            </div>
          </div>
        </div>

        {/* Tab Switcher & Broadcast Sync */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 border border-white/10 px-2.5 py-1 bg-black/40">
            <Clock className="h-3 w-3 text-cyan" />
            <span className="font-mono text-[10px] text-white/50">TV SYNC:</span>
            <input
              type="range"
              min={-5}
              max={30}
              value={broadcastDelay}
              onChange={(e) => setBroadcastDelay(Number(e.target.value))}
              className="w-16 h-1"
            />
            <span className="font-mono text-[10px] text-cyan font-bold">{broadcastDelay}s</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: "timing", label: "Live Leaderboard" },
              { id: "map", label: "Interactive Track Map" },
              { id: "race_control", label: "Race Control & Radio" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1 font-display text-xs uppercase tracking-wider transition ${
                  activeTab === tab.id
                    ? "bg-f1red text-white font-semibold"
                    : "border border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-View 1: Live Leaderboard with Mini-Sectors & Gaps */}
      {activeTab === "timing" && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-cond text-sm">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[10px] uppercase text-white/40">
                <th className="px-3 py-2">POS</th>
                <th>DRIVER</th>
                <th>TYRE</th>
                <th>LAST LAP</th>
                <th>GAP</th>
                <th>INT</th>
                <th className="text-center">SECTOR 1</th>
                <th className="text-center">SECTOR 2</th>
                <th className="text-center">SECTOR 3</th>
                <th>SPEED</th>
                <th className="pr-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.map((row) => {
                const isSelected = row.driver.id === driverId;
                return (
                  <tr
                    key={row.driver.id}
                    onClick={() => setDriverId(row.driver.id)}
                    className={`cursor-pointer transition ${
                      isSelected ? "bg-white/10 font-semibold" : "hover:bg-white/4 text-white/80"
                    }`}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-white">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-4 rounded-full" style={{ background: row.driver.color }} />
                        {row.position}
                      </span>
                    </td>
                    <td className="font-display text-base text-white">
                      {row.driver.name} <span className="font-mono text-xs text-white/40">#{row.driver.number}</span>
                    </td>
                    <td>
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                        row.tyre.compound === "S" ? "bg-red-600 text-white" :
                        row.tyre.compound === "M" ? "bg-yellow-400 text-black" : "bg-white text-black"
                      }`}>
                        {row.tyre.compound} · {row.tyre.age}L
                      </span>
                    </td>
                    <td className="font-mono text-xs text-white">{formatLap(row.lapTime)}</td>
                    <td className="font-mono text-xs text-white/70">
                      {row.position === 1 ? "LEADER" : `+${row.gap.toFixed(3)}s`}
                    </td>
                    <td className="font-mono text-xs text-white/50">
                      {row.position === 1 ? "—" : `+${row.interval.toFixed(3)}s`}
                    </td>
                    <td className="text-center font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded ${row.s1Color}`}>
                        {row.s1.toFixed(3)}
                      </span>
                    </td>
                    <td className="text-center font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded ${row.s2Color}`}>
                        {row.s2.toFixed(3)}
                      </span>
                    </td>
                    <td className="text-center font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded ${row.s3Color}`}>
                        {row.s3.toFixed(3)}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-cyan">{row.speed} km/h</td>
                    <td className="pr-3 text-right">
                      {row.isAnom ? (
                        <span className="rounded bg-f1red px-2 py-0.5 font-mono text-[9px] text-white animate-pulse">
                          ANOMALY FLAG
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-white/40">NOMINAL</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 flex items-center gap-5 font-mono text-[10px] text-white/40 border-t border-white/5 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500" /> Session Best (Purple)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Personal Best (Green)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Nominal / Slower (Yellow)
            </span>
          </div>
        </div>
      )}

      {/* Sub-View 2: Interactive Real-Time Track Map */}
      {activeTab === "map" && (
        <div className="mt-4 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-mono text-white/40 mb-2">
              <span>AUTÓDROMO HERMANOS RODRÍGUEZ (4.304 KM)</span>
              <span className="text-cyan">LIVE CAR PROGRESSION</span>
            </div>
            <svg viewBox="0 0 600 400" className="w-full h-72">
              {/* Circuit Outline */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={pathD}
                fill="none"
                stroke="#222"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* DRS / Active Aero Zones */}
              <line x1="50" y1="150" x2="300" y2="150" stroke="#00e5ff" strokeWidth="4" strokeDasharray="4 4" />
              <line x1="420" y1="210" x2="510" y2="210" stroke="#00e5ff" strokeWidth="4" strokeDasharray="4 4" />

              {/* Turn Labels */}
              <text x="320" y="135" fill="#888" fontSize="10" fontFamily="IBM Plex Mono">T1-3</text>
              <text x="530" y="195" fill="#888" fontSize="10" fontFamily="IBM Plex Mono">T4</text>
              <text x="330" y="355" fill="#888" fontSize="10" fontFamily="IBM Plex Mono">ESSES</text>
              <text x="85" y="380" fill="#888" fontSize="10" fontFamily="IBM Plex Mono">FORO SOL</text>
              <text x="35" y="170" fill="#e10600" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="bold">S/F</text>

              {/* Live Driver Dots on Track */}
              {leaderboard.map((item, idx) => {
                // Approximate position around circuit based on lap progress + driver gap offset
                const trackIdx = Math.floor(((cursor * 3 + idx * 2.2) % TRACK_MAP_POINTS.length));
                const pt = TRACK_MAP_POINTS[trackIdx] || TRACK_MAP_POINTS[0];
                const isSelected = item.driver.id === driverId;
                return (
                  <g key={item.driver.id} className="cursor-pointer" onClick={() => setDriverId(item.driver.id)}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 8 : 5}
                      fill={item.driver.color}
                      stroke={isSelected ? "#fff" : "#000"}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={pt.x + 8}
                      y={pt.y + 4}
                      fill="#fff"
                      fontSize="9"
                      fontFamily="IBM Plex Mono"
                      fontWeight="bold"
                    >
                      {item.driver.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="lg:col-span-4 space-y-3 font-cond">
            <div className="border border-white/10 p-3 bg-white/2">
              <span className="font-mono text-[10px] uppercase text-white/40 block">ACTIVE DRIVER TRACK DATA:</span>
              <div className="mt-1 font-display text-xl text-white">
                {DRIVERS.find((d) => d.id === driverId)?.name}
              </div>
              <div className="mt-2 space-y-1 font-mono text-xs text-white/70">
                <div className="flex justify-between">
                  <span>GPS SECTOR:</span>
                  <span className="text-cyan font-bold">SECTOR 2 (T7–T12)</span>
                </div>
                <div className="flex justify-between">
                  <span>WING AERO MODE:</span>
                  <span className="text-amber font-bold">Z-MODE (CORNERING)</span>
                </div>
                <div className="flex justify-between">
                  <span>SPEED TRAP:</span>
                  <span>322.4 km/h</span>
                </div>
              </div>
            </div>

            <div className="border border-white/10 p-3 bg-white/2">
              <span className="font-mono text-[10px] uppercase text-white/40 block">SECTOR COLOR CODES:</span>
              <div className="mt-2 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-purple-400">
                  <span>Sector 1 Best:</span>
                  <span>22.842s (Verstappen)</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Sector 2 Best:</span>
                  <span>29.114s (Norris)</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Sector 3 Best:</span>
                  <span>26.985s (Antonelli)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 3: Official Race Control & Team Radio Log */}
      {activeTab === "race_control" && (
        <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-white/5">
          {relevantMessages.length === 0 ? (
            <p className="py-6 text-center font-cond text-sm text-white/40">
              No race control messages issued yet for this stint.
            </p>
          ) : (
            relevantMessages
              .slice(-8)
              .reverse()
              .map((msg) => (
                <div key={msg.id} className="py-2.5 px-3 flex items-start gap-3 hover:bg-white/2">
                  <span
                    className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase shrink-0 mt-0.5"
                    style={{ background: `${msg.color}25`, color: msg.color, border: `1px solid ${msg.color}50` }}
                  >
                    {msg.flag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-white/40">
                      <span>LAP {msg.lap}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                      <span>•</span>
                      <span className="text-white/60">{msg.category}</span>
                    </div>
                    <p className="mt-0.5 font-cond text-sm text-white/90">{msg.message}</p>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
