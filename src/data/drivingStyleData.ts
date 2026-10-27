import { DriverId } from "./sentinel";

export type TyreCompound = "S" | "M" | "H" | "I" | "W";

export type TyreTelemetry = {
  fl: number; // Front-Left temp °C
  fr: number; // Front-Right temp °C
  rl: number; // Rear-Left temp °C
  rr: number; // Rear-Right temp °C
  carcassTemp: number; // Mean carcass temp °C
  compound: TyreCompound;
  compoundName: string;
  age: number; // Laps on current set
  wearPct: number; // 0 - 100%
  status: "OPTIMAL" | "COLD_GRAINING" | "WARM" | "OVERHEATING" | "BLISTER_SPIKE";
  alert?: string;
};

export type DrivingStyleMetrics = {
  brakingLateAggression: number; // 0 - 100
  throttleTipInAggression: number; // 0 - 100
  cornerApexSpeedKmh: number; // Apex speed
  steeringSmoothness: number; // 0 - 100 (100 = silky smooth)
  tyreScrubStress: number; // 0 - 100
  energyDiscipline: number; // 0 - 100
};

export type DriverStyleBaseline = {
  driverId: DriverId;
  driverName: string;
  historicalRacesCount: number;
  baseline: DrivingStyleMetrics;
  archetype: string;
  description: string;
};

export const DRIVER_STYLE_BASELINES: Record<DriverId, DriverStyleBaseline> = {
  ANT: {
    driverId: "ANT",
    driverName: "Kimi Antonelli",
    historicalRacesCount: 22,
    baseline: {
      brakingLateAggression: 88,
      throttleTipInAggression: 91,
      cornerApexSpeedKmh: 142,
      steeringSmoothness: 80,
      tyreScrubStress: 76,
      energyDiscipline: 82,
    },
    archetype: "Aggressive Attacker · Late Braking",
    description: "Deep straight-line braking with rapid throttle tip-in on corner exit. High mechanical load on front tyres.",
  },
  NOR: {
    driverId: "NOR",
    driverName: "Lando Norris",
    historicalRacesCount: 132,
    baseline: {
      brakingLateAggression: 82,
      throttleTipInAggression: 84,
      cornerApexSpeedKmh: 146,
      steeringSmoothness: 94,
      tyreScrubStress: 64,
      energyDiscipline: 91,
    },
    archetype: "Fluid Smoothness · High Apex Roll",
    description: "Silky steering rotation with minimal micro-corrections. Exceptional front tyre preservation and energy coasting.",
  },
  VER: {
    driverId: "VER",
    driverName: "Max Verstappen",
    historicalRacesCount: 215,
    baseline: {
      brakingLateAggression: 94,
      throttleTipInAggression: 95,
      cornerApexSpeedKmh: 147,
      steeringSmoothness: 86,
      tyreScrubStress: 88,
      energyDiscipline: 89,
    },
    archetype: "Pointed Rotation · Maximum Commitment",
    description: "Sharp trail-braking to induce rapid rear rotation. Demands aggressive apex kerb riding and high tyre energy.",
  },
  PIA: {
    driverId: "PIA",
    driverName: "Oscar Piastri",
    historicalRacesCount: 52,
    baseline: {
      brakingLateAggression: 84,
      throttleTipInAggression: 86,
      cornerApexSpeedKmh: 144,
      steeringSmoothness: 90,
      tyreScrubStress: 70,
      energyDiscipline: 93,
    },
    archetype: "Clinical Precision · Disciplined Harvest",
    description: "Meticulous throttle pickup and battery deployment timing. Highly repeatable inputs with low lap-to-lap variance.",
  },
  RUS: {
    driverId: "RUS",
    driverName: "George Russell",
    historicalRacesCount: 134,
    baseline: {
      brakingLateAggression: 89,
      throttleTipInAggression: 90,
      cornerApexSpeedKmh: 143,
      steeringSmoothness: 82,
      tyreScrubStress: 80,
      energyDiscipline: 84,
    },
    archetype: "Aggressive Squeeze · Manual Override Specialist",
    description: "High peak brake pressures and rapid transition from brake to throttle. Exploits active aero and manual override pulses.",
  },
  HAM: {
    driverId: "HAM",
    driverName: "Lewis Hamilton",
    historicalRacesCount: 360,
    baseline: {
      brakingLateAggression: 86,
      throttleTipInAggression: 82,
      cornerApexSpeedKmh: 145,
      steeringSmoothness: 96,
      tyreScrubStress: 60,
      energyDiscipline: 95,
    },
    archetype: "Master of Trail-Braking · Thermal Whisperer",
    description: "Deep parabolic trail-braking releasing pressure gently. Legendary tyre carcass temperature regulation across long stints.",
  },
  LEC: {
    driverId: "LEC",
    driverName: "Charles Leclerc",
    historicalRacesCount: 154,
    baseline: {
      brakingLateAggression: 92,
      throttleTipInAggression: 93,
      cornerApexSpeedKmh: 148,
      steeringSmoothness: 81,
      tyreScrubStress: 85,
      energyDiscipline: 80,
    },
    archetype: "High-Rotation Oversteer · Kerb Rider",
    description: "Prefers an ultra-responsive, loose rear end. Multiple rapid steering micro-corrections per apex to dance on the edge.",
  },
  ALO: {
    driverId: "ALO",
    driverName: "Fernando Alonso",
    historicalRacesCount: 405,
    baseline: {
      brakingLateAggression: 87,
      throttleTipInAggression: 88,
      cornerApexSpeedKmh: 141,
      steeringSmoothness: 85,
      tyreScrubStress: 82,
      energyDiscipline: 88,
    },
    archetype: "Adaptive Hustle · Geometric Angles",
    description: "Aggressive steering wheel snap into slow corners to generate front bite. Uncanny adaptability to variable grip conditions.",
  },
};

// Compute dynamic tyre telemetry for any driver and lap
export function getTyreTelemetry(driverId: DriverId, lap: number): TyreTelemetry {
  const isSafetyCar = lap >= 22 && lap <= 26;
  const isRain = lap >= 48 && lap <= 50;

  // Stint calculation: Stint 1 = laps 1-20, Stint 2 = laps 21-43, Stint 3 = laps 44-71
  let stintStart = 1;
  let compound: TyreCompound = "M";
  let compoundName = "Medium (C4 Yellow)";

  if (lap >= 21 && lap <= 43) {
    stintStart = 21;
    compound = "H";
    compoundName = "Hard (C3 White)";
  } else if (lap > 43) {
    stintStart = 44;
    compound = "S";
    compoundName = "Soft (C5 Red)";
  }

  const age = Math.max(1, lap - stintStart + 1);
  const wearPct = Math.min(95, Math.round(age * 3.8));

  // Base temperatures in °C
  let baseFL = 101.5 + (age * 0.45);
  let baseFR = 104.2 + (age * 0.55); // Hermanos Rodriguez is clockwise, high front-right lateral load
  let baseRL = 99.8 + (age * 0.40);
  let baseRR = 102.1 + (age * 0.48);

  let alert: string | undefined;
  let status: TyreTelemetry["status"] = "OPTIMAL";

  if (isSafetyCar) {
    baseFL -= 14.5;
    baseFR -= 13.8;
    baseRL -= 16.0;
    baseRR -= 15.2;
    status = "COLD_GRAINING";
    alert = "Tyre pressures dropping under Safety Car. Surface below 90°C.";
  } else if (isRain) {
    baseFL -= 9.2;
    baseFR -= 8.5;
    baseRL -= 11.0;
    baseRR -= 10.4;
    status = "COLD_GRAINING";
    alert = "Rain drop cooling on T12 entry. Front surface temperature loss.";
  } else if (lap === 52 && driverId === "ANT") {
    // Antonelli Lock-up at Turn 13
    baseFR = 129.4; // Front-Right tyre flat spot spike!
    status = "BLISTER_SPIKE";
    alert = "RF Flat-Spot Thermal Anomaly! Carcass spike +25.2°C above window.";
  } else if (lap >= 65 && age > 20) {
    baseFR += 12.0;
    baseRR += 10.5;
    status = "OVERHEATING";
    alert = "High stint degradation. Rear traction loss from thermal degradation.";
  } else if (baseFR > 112) {
    status = "WARM";
  }

  const carcassTemp = Math.round(((baseFL + baseFR + baseRL + baseRR) / 4) * 10) / 10;

  return {
    fl: Math.round(baseFL * 10) / 10,
    fr: Math.round(baseFR * 10) / 10,
    rl: Math.round(baseRL * 10) / 10,
    rr: Math.round(baseRR * 10) / 10,
    carcassTemp,
    compound,
    compoundName,
    age,
    wearPct,
    status,
    alert,
  };
}

// Compute Driver Driving Style & Deviation against their all-time baseline
export function computeDriverStyle(
  driverId: DriverId,
  lap: number,
  lapTime: number,
  zScore: number
): {
  current: DrivingStyleMetrics;
  baseline: DrivingStyleMetrics;
  deviationPct: number;
  deviationSeverity: "nominal" | "minor" | "significant" | "critical";
  deviationExplanation: string;
} {
  const baseProfile = DRIVER_STYLE_BASELINES[driverId] || DRIVER_STYLE_BASELINES["ANT"];
  const b = baseProfile.baseline;

  // Compute lap-dependent deviations
  let d_braking = 0;
  let d_throttle = 0;
  let d_apex = 0;
  let d_steering = 0;
  let d_tyre = 0;
  let d_energy = 0;
  let reason = "Driving style matches all previous races historical baseline. Nominal driver execution.";

  // Event specific driving style shifts:
  if (lap === 52 && driverId === "ANT") {
    // Antonelli after T13 lockup: cautious braking, erratic steering micro-corrections
    d_braking = -16; // Braking 16% earlier to protect flat-spot
    d_throttle = -10;
    d_steering = -24; // Excessive vibration corrections
    d_tyre = +22; // High scrubbing from flat spot
    reason = "Antonelli braking 18m earlier with +24% steering oscillations vs career baseline — flat-spot vibration compensation.";
  } else if (lap === 41 && driverId === "HAM") {
    // Hamilton MGU-K thermal cliff: extreme lift and coast
    d_braking = -22; // Early lift and coast
    d_throttle = -18; // Soft throttle pickup
    d_energy = +28; // Extreme harvest discipline
    reason = "Hamilton lift-and-coast extended 65m into corners with 18% softer throttle pick-up — active energy conservation against MGU-K thermal derate.";
  } else if (lap === 61 && driverId === "RUS") {
    // Russell Manual Override attack pulse
    d_throttle = +15;
    d_tyre = +18;
    d_energy = -25; // Massive battery dump
    reason = "Russell aggressive throttle spike and battery dump (+15% aggression) during Manual Override attack on Norris.";
  } else if (lap === 34 && driverId === "VER") {
    // Verstappen in dirty air
    d_apex = -8;
    d_steering = -15;
    reason = "Verstappen apex commitment down 8 km/h with 15% more steering corrections — dirty-air aerodynamic turbulence behind lapped traffic.";
  } else if (lap >= 22 && lap <= 26) {
    // Safety car
    d_braking = -35;
    d_throttle = -40;
    d_apex = -45;
    d_tyre = -50;
    d_energy = +30;
    reason = "Safety Car delta management mode. Low-energy weaving to maintain tyre carcass temperature.";
  } else if (lap >= 48 && ["LEC", "ALO", "HAM"].includes(driverId)) {
    // Rain spots
    d_braking = -14;
    d_apex = -12;
    d_throttle = -15;
    reason = "Cautious throttle application and early braking due to localised track dampness at Turn 12.";
  }

  const current: DrivingStyleMetrics = {
    brakingLateAggression: Math.max(20, Math.min(100, Math.round(b.brakingLateAggression + d_braking))),
    throttleTipInAggression: Math.max(20, Math.min(100, Math.round(b.throttleTipInAggression + d_throttle))),
    cornerApexSpeedKmh: Math.max(90, Math.min(160, Math.round(b.cornerApexSpeedKmh + d_apex))),
    steeringSmoothness: Math.max(30, Math.min(100, Math.round(b.steeringSmoothness + d_steering))),
    tyreScrubStress: Math.max(20, Math.min(100, Math.round(b.tyreScrubStress + d_tyre))),
    energyDiscipline: Math.max(20, Math.min(100, Math.round(b.energyDiscipline + d_energy))),
  };

  // Mean percentage deviation across all style dimensions
  const devSum =
    Math.abs(d_braking) +
    Math.abs(d_throttle) +
    Math.abs(d_apex * 0.7) +
    Math.abs(d_steering) +
    Math.abs(d_tyre) +
    Math.abs(d_energy);
  const deviationPct = Math.round((devSum / 6) * 10) / 10;

  let deviationSeverity: "nominal" | "minor" | "significant" | "critical" = "nominal";
  if (deviationPct > 20) deviationSeverity = "critical";
  else if (deviationPct > 12) deviationSeverity = "significant";
  else if (deviationPct > 5) deviationSeverity = "minor";

  return {
    current,
    baseline: b,
    deviationPct,
    deviationSeverity,
    deviationExplanation: reason,
  };
}

// Live Race Control Messages Log
export type RaceControlMessage = {
  id: string;
  lap: number;
  time: string;
  flag: "GREEN" | "YELLOW" | "SAFETY_CAR" | "VSC" | "CHEQUERED" | "BLUE" | "INFO";
  category: "RACE_CONTROL" | "STEWARDS" | "WEATHER" | "TEAM_RADIO";
  message: string;
  color: string;
};

export const RACE_CONTROL_MESSAGES: RaceControlMessage[] = [
  { id: "rc1", lap: 1, time: "14:03:12", flag: "YELLOW", category: "RACE_CONTROL", message: "YELLOW FLAG SECTOR 1 — T1 INCIDENT CAR 14 (ALO) SQUEEZED WIDE", color: "#ffb800" },
  { id: "rc2", lap: 2, time: "14:04:45", flag: "GREEN", category: "RACE_CONTROL", message: "TRACK CLEAR — ALL SECTORS GREEN", color: "#00e5ff" },
  { id: "rc3", lap: 18, time: "14:26:01", flag: "INFO", category: "TEAM_RADIO", message: "MCLAREN TO NORRIS: 'BOX NOW FOR HARD TYRES, COVER THE UNDERCUT'", color: "#ff8000" },
  { id: "rc4", lap: 22, time: "14:31:40", flag: "SAFETY_CAR", category: "RACE_CONTROL", message: "SAFETY CAR DEPLOYED — LAWSON / BEARMAN DEBRIS AT TURN 7", color: "#e10600" },
  { id: "rc5", lap: 26, time: "14:38:12", flag: "GREEN", category: "RACE_CONTROL", message: "SAFETY CAR IN THIS LAP — RACE RESUMING ON LAP 27", color: "#00e5ff" },
  { id: "rc6", lap: 34, time: "14:48:33", flag: "BLUE", category: "RACE_CONTROL", message: "BLUE FLAGS FOR CADILLAC #77 — YIELD TO LEADER VERSTAPPEN", color: "#4781ff" },
  { id: "rc7", lap: 41, time: "14:57:50", flag: "INFO", category: "TEAM_RADIO", message: "FERRARI TO HAMILTON: 'FAIL 44, DEFENSIVE LIFT-AND-COAST, MGU-K TEMP CRITICAL'", color: "#dc0000" },
  { id: "rc8", lap: 48, time: "15:06:22", flag: "YELLOW", category: "WEATHER", message: "LOW GRIP CONDITIONS REPORTED — LIGHT RAIN DETECTED TURN 12", color: "#ffb800" },
  { id: "rc9", lap: 52, time: "15:11:45", flag: "INFO", category: "TEAM_RADIO", message: "MERCEDES TO ANTONELLI: 'COPY FLAT SPOT RF, VIBRATION WITHIN TOLERANCE'", color: "#00d2be" },
  { id: "rc10", lap: 61, time: "15:23:10", flag: "INFO", category: "RACE_CONTROL", message: "MANUAL OVERRIDE SYSTEM ACTIVE — RUSSELL CAR 63 ARMED IN S3", color: "#00e5ff" },
  { id: "rc11", lap: 67, time: "15:31:08", flag: "YELLOW", category: "RACE_CONTROL", message: "YELLOW FLAG SECTOR 2 — CAR 81 (PIASTRI) STOPPED ON TRACK (INVERTER TRIP)", color: "#e10600" },
];

// SVG Circuit Coordinates for Autódromo Hermanos Rodríguez track map
export const TRACK_MAP_POINTS = [
  { x: 50, y: 150 }, // Main straight start
  { x: 320, y: 150 }, // T1 braking
  { x: 360, y: 180 }, // T1-2-3 chicane
  { x: 330, y: 220 },
  { x: 380, y: 240 },
  { x: 420, y: 210 }, // Straight to T4
  { x: 520, y: 210 }, // T4 braking
  { x: 540, y: 250 }, // T5-6 esses entry
  { x: 500, y: 300 },
  { x: 440, y: 320 },
  { x: 380, y: 310 },
  { x: 320, y: 330 },
  { x: 260, y: 320 }, // Lake S-curves
  { x: 200, y: 340 },
  { x: 150, y: 330 },
  { x: 100, y: 360 }, // Foro Sol stadium entry
  { x: 70, y: 320 }, // Baseball stadium infield
  { x: 50, y: 260 }, // Peraltada exit onto main straight
  { x: 50, y: 150 }, // Finish line
];
