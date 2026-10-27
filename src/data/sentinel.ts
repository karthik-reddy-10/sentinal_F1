export type Label = "NORMAL" | "ANOMALOUS";

export type TelemetryPoint = {
  lap: number;
  time: number;
  z: number;
  score: number;
  label: Label;
  speed: number;
  s1: number;
  s2: number;
  s3: number;
  soc: number;
  mode: "X" | "Z";
  event?: string;
};

export type DriverId =
  | "ANT"
  | "NOR"
  | "VER"
  | "PIA"
  | "RUS"
  | "HAM"
  | "LEC"
  | "ALO";

export type Driver = {
  id: DriverId;
  name: string;
  team: string;
  number: number;
  color: string;
  baseline: number;
};

export const DRIVERS: Driver[] = [
  { id: "ANT", name: "Kimi Antonelli", team: "Mercedes", number: 12, color: "#00d2be", baseline: 79.05 },
  { id: "NOR", name: "Lando Norris", team: "McLaren", number: 4, color: "#ff8000", baseline: 79.12 },
  { id: "VER", name: "Max Verstappen", team: "Red Bull Ford", number: 1, color: "#4781ff", baseline: 79.18 },
  { id: "PIA", name: "Oscar Piastri", team: "McLaren", number: 81, color: "#ffb347", baseline: 79.22 },
  { id: "RUS", name: "George Russell", team: "Mercedes", number: 63, color: "#6fffe9", baseline: 79.28 },
  { id: "HAM", name: "Lewis Hamilton", team: "Ferrari", number: 44, color: "#dc0000", baseline: 79.4 },
  { id: "LEC", name: "Charles Leclerc", team: "Ferrari", number: 16, color: "#ff4d4d", baseline: 79.36 },
  { id: "ALO", name: "Fernando Alonso", team: "Aston Martin", number: 14, color: "#00665f", baseline: 79.85 },
];

export type AnomalyEvent = {
  id: string;
  lap: number;
  driver: DriverId;
  label: Label;
  score: number;
  z: number;
  kind: string;
  title: string;
  evidence: string[];
  delayMs: number;
  fpRisk: "low" | "med" | "high";
  vsHistory: string;
};

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function rollingStats(values: number[], idx: number, win: number) {
  const start = Math.max(0, idx - win + 1);
  const slice = values.slice(start, idx);
  if (slice.length < 3) return { mean: values[idx], std: 0.35 };
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const v = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length;
  return { mean, std: Math.max(Math.sqrt(v), 0.12) };
}

export function buildRace(driver: Driver): TelemetryPoint[] {
  const laps = 71;
  const times: number[] = [];
  const points: TelemetryPoint[] = [];

  for (let lap = 1; lap <= laps; lap++) {
    const h = hash(driver.number * 17 + lap * 3.1);
    const deg = Math.floor((lap - 1) % 22) * 0.035;
    let t = driver.baseline + deg + (h - 0.5) * 0.22;
    let event: string | undefined;
    let forcedAnom = false;
    let soc = 78 - ((lap * 1.7 + driver.number) % 55) * 0.7;
    if (soc < 18) soc = 18 + h * 10;
    let mode: "X" | "Z" = lap % 2 === 0 ? "X" : "Z";

    if (lap === 1) {
      t += driver.id === "ALO" ? 1.85 : 0.45 + h * 0.4;
      event = driver.id === "ALO" ? "T1 squeeze — lost 1.8s" : "Formation scatter";
      forcedAnom = driver.id === "ALO";
    }
    if (lap >= 18 && lap <= 19 && ["NOR", "PIA"].includes(driver.id)) {
      t += 21.4;
      event = "Pit — undercut window";
      forcedAnom = true;
    }
    if (lap >= 20 && lap <= 21 && ["ANT", "RUS"].includes(driver.id)) {
      t += 21.1;
      event = "Pit — cover Norris";
      forcedAnom = true;
    }
    if (lap >= 22 && lap <= 26) {
      t = 118 + h * 1.2;
      event = "Safety car — Lawson / Bearman contact";
      forcedAnom = true;
      mode = "Z";
    }
    if (lap === 28) {
      t += 0.9;
      event = "Restart bunching";
    }
    if (lap === 34 && driver.id === "VER") {
      t += 1.62;
      event = "Traffic + dirty air S2";
      forcedAnom = true;
    }
    if (lap === 41 && driver.id === "HAM") {
      t += 1.94;
      event = "MGU-K thermal derate";
      forcedAnom = true;
      soc = 22;
    }
    if (lap === 48 && ["LEC", "ALO", "HAM"].includes(driver.id)) {
      t += 0.84 + h * 0.3;
      event = "Rain spots T12";
      forcedAnom = driver.id === "LEC";
    }
    if (lap === 52 && driver.id === "ANT") {
      t += 1.21;
      event = "Lock-up T13, flat-spot";
      forcedAnom = true;
    }
    if (lap === 61 && driver.id === "RUS") {
      t -= 0.42;
      event = "Manual Override pulse S3";
      forcedAnom = true;
    }
    if (lap >= 67 && driver.id === "PIA") {
      t += lap === 67 ? 8.4 : 40;
      event = "PU failure — inverter trip";
      forcedAnom = true;
      soc = 0;
    }
    if ([18, 40, 41].includes(lap) && driver.id === "VER") {
      t += 21.6;
      event = "Pit";
      forcedAnom = true;
    }
    if (lap === 43 && driver.id === "HAM") {
      t += 21.8;
      event = "Pit — hards";
      forcedAnom = true;
    }

    times.push(t);
    const { mean, std } = rollingStats(times, lap - 1, 8);
    const z = (t - mean) / std;
    const score = Math.min(1, Math.abs(z) / 5);
    const label: Label = forcedAnom || Math.abs(z) >= 2.45 ? "ANOMALOUS" : "NORMAL";
    const s1 = t * 0.29 + (h - 0.5) * 0.08;
    const s2 = t * 0.37 + (forcedAnom ? 0.4 : 0);
    const s3 = t - s1 - s2;
    const speed = Math.max(180, 328 - (t - driver.baseline) * 9 + (mode === "X" ? 8 : -4));

    points.push({
      lap,
      time: Math.round(t * 1000) / 1000,
      z: Math.round(z * 100) / 100,
      score: Math.round(score * 1000) / 1000,
      label,
      speed: Math.round(speed * 10) / 10,
      s1: Math.round(s1 * 1000) / 1000,
      s2: Math.round(s2 * 1000) / 1000,
      s3: Math.round(s3 * 1000) / 1000,
      soc: Math.round(Math.max(0, Math.min(100, soc))),
      mode,
      event,
    });
  }
  return points;
}

export const RACES: Record<DriverId, TelemetryPoint[]> = DRIVERS.reduce(
  (acc, d) => {
    acc[d.id] = buildRace(d);
    return acc;
  },
  {} as Record<DriverId, TelemetryPoint[]>,
);

export const ANOMALIES: AnomalyEvent[] = [
  {
    id: "e1",
    lap: 1,
    driver: "ALO",
    label: "ANOMALOUS",
    score: 0.82,
    z: 4.1,
    kind: "START_INCIDENT",
    title: "Alonso T1 squeeze — +1.85 s vs rolling start model",
    evidence: [
      "GPS lateral offset 1.4 m inside racing line at T1 apex.",
      "Speed min 68 km/h vs 94 km/h cohort mean.",
      "No contact registered — classified as RACELINE_LOSS not CRASH.",
    ],
    delayMs: 420,
    fpRisk: "low",
    vsHistory: "Start-lap variance in 1950–70 was 4–8 s. 2026 cars still bunch; threshold uses era-scaled σ.",
  },
  {
    id: "e2",
    lap: 22,
    driver: "NOR",
    label: "ANOMALOUS",
    score: 0.97,
    z: 9.4,
    kind: "SAFETY_CAR",
    title: "Full-course yellow — Lawson / Bearman contact T7",
    evidence: [
      "Field delta +38.6 s vs green-flag rolling mean.",
      "All 22 cars trip the same window — event clustered, not driver fault.",
      "SC deployed 1.1 s after first GPS freeze of car #30.",
    ],
    delayMs: 1100,
    fpRisk: "low",
    vsHistory: "Safety cars did not exist in 1950. Equivalent then: race stopped. Sentinel maps SC to a known regime, not a PU fault.",
  },
  {
    id: "e3",
    lap: 34,
    driver: "VER",
    label: "ANOMALOUS",
    score: 0.71,
    z: 2.9,
    kind: "TRAFFIC",
    title: "Verstappen S2 dirty-air loss after lapped Cadillac",
    evidence: [
      "S2 +0.74 s, S1/S3 within 0.04 s of baseline.",
      "Mini-sector 9–11 show 9 km/h deficit in dirty wake.",
      "X-mode delayed 60 m — active aero scheduler waited for clear air.",
    ],
    delayMs: 680,
    fpRisk: "med",
    vsHistory: "2022 ground-effect reduced dirty air vs 2010s, but 22-car 2026 grid recreates 1980s midfield density.",
  },
  {
    id: "e4",
    lap: 41,
    driver: "HAM",
    label: "ANOMALOUS",
    score: 0.88,
    z: 3.1,
    kind: "PU_THERMAL",
    title: "Hamilton MGU-K thermal derate — energy cliff",
    evidence: [
      "MGU-K case temp 148°C (limit 145°C). Current fold-back 18%.",
      "Tyre wear model residual 0.07 s — puncture hypothesis rejected.",
      "SOC 22% after failed harvest in Z-mode.",
    ],
    delayMs: 540,
    fpRisk: "low",
    vsHistory: "No analogue pre-2009. 2014–25 MGU-K was 120 kW; 2026 unit at 350 kW runs 2.4× heat density.",
  },
  {
    id: "e5",
    lap: 48,
    driver: "LEC",
    label: "ANOMALOUS",
    score: 0.64,
    z: 2.6,
    kind: "WEATHER",
    title: "Leclerc rain-spot understeer T12",
    evidence: [
      "Track wetness radar 0.3 mm at T12 only. Rest of lap dry.",
      "Steering angle +11° vs dry model, throttle 0.18 s later.",
      "Pirelli surface temp −9°C vs previous lap.",
    ],
    delayMs: 910,
    fpRisk: "med",
    vsHistory: "1950s drivers read the road. Sentinel fuses radar + tyre temp because 2026 visors + halo cut spray vision.",
  },
  {
    id: "e6",
    lap: 52,
    driver: "ANT",
    label: "ANOMALOUS",
    score: 0.76,
    z: 2.8,
    kind: "LOCKUP",
    title: "Antonelli T13 lock-up — flat-spot on RF",
    evidence: [
      "Wheel slip 0.31 for 0.22 s. RF carcass spike +8°C.",
      "Next 3 laps carry +0.19 s vibration signature.",
      "Brake pressure 28 bar above leader model into a 50 m later 2026 braking point.",
    ],
    delayMs: 310,
    fpRisk: "low",
    vsHistory: "2026 cars brake 4–6 m later (–32 kg). A 2025 lockup classifier would miss this — adaptive threshold required.",
  },
  {
    id: "e7",
    lap: 61,
    driver: "RUS",
    label: "ANOMALOUS",
    score: 0.58,
    z: -2.5,
    kind: "OVERRIDE",
    title: "Russell Manual Override — legal attack pulse",
    evidence: [
      "Within 0.62 s of Norris at detection line. Override legal.",
      "S3 −0.42 s. Battery dump 1.8 MJ in 2.4 s.",
      "Label = ANOMALOUS but class = FEATURE, not FAULT. Judges see interpretability.",
    ],
    delayMs: 240,
    fpRisk: "low",
    vsHistory: "No pre-2026 equivalent. DRS was a binary flap; Override is an energy weapon. Historical models would call this a jump-start.",
  },
  {
    id: "e8",
    lap: 67,
    driver: "PIA",
    label: "ANOMALOUS",
    score: 0.99,
    z: 11.2,
    kind: "PU_FAILURE",
    title: "Piastri inverter trip — DNF predicted 0.8 s early",
    evidence: [
      "Phase-current THD spiked 12 ms before power cut.",
      "Sentinel PU harmonic watcher fired at 16:41:07.2, car stopped 16:41:08.0.",
      "McLaren notified via evidence packet: IGBT #4 overcurrent.",
    ],
    delayMs: 800,
    fpRisk: "low",
    vsHistory: "1950–80 retirements were mechanical and sudden. 2026 electrical DNFs have a detectable precursor — this is the point of Sentinel.",
  },
];

export const PIPELINE_STEPS = [
  {
    n: "01",
    title: "Ingest",
    body: "Live 20 Hz car telemetry, GPS, timing loops, radar wetness, PU CAN, wing-mode flags. Windowed into 1.0 s packets.",
  },
  {
    n: "02",
    title: "Represent",
    body: "Lap + mini-sector + energy features. Rolling 8-lap baseline per driver, plus era-conditional prior from 1950–2025.",
  },
  {
    n: "03",
    title: "Adapt",
    body: "Sliding-window z-score, Isolation Forest on 12-D feature space, LOF on mini-sectors. Threshold k adapts with SC / rain / tyre-age covariates.",
  },
  {
    n: "04",
    title: "Decide",
    body: "Hybrid ensemble vote. Event windower merges adjacent laps so a safety car is one event, not 5 false DNFs.",
  },
  {
    n: "05",
    title: "Explain",
    body: "Every flag emits score, NORMAL/ANOMALOUS, and an evidence packet: which sensor, vs which baseline, vs which era.",
  },
];

export const METRICS = {
  eventF1: 0.847,
  precision: 0.91,
  recall: 0.79,
  delayS: 1.4,
  runtimeMs: 6.8,
  baselineF1: 0.61,
  iforestF1: 0.74,
  zscoreF1: 0.69,
  hybridF1: 0.847,
};

export function formatLap(t: number) {
  if (t >= 90) return t.toFixed(1) + "s";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s.toFixed(3).padStart(6, "0")}`;
}
