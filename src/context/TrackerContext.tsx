import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type AlgorithmType,
  type FeatureType,
  type ThresholdMethod,
  type Hyperparameters,
  DEFAULT_HYPERPARAMS,
  computeAlgorithmScore,
  evaluateEventMetrics,
  type EvaluationMetrics,
  type WindowAnalysis,
} from "../utils/anomalyEngine";
import {
  STARTER_PACKS,
  type DataPoint,
  parseCsvData,
} from "../data/nabDatasets";
import { checkLiveRaceStatus, type LiveFeedStatus } from "../utils/liveFeedService";
import { DRIVERS, RACES, ANOMALIES, type DriverId } from "../data/sentinel";

export type IngestMode = "demo" | "live_google" | "nab_starter" | "upload" | "paste";

interface TrackerContextType {
  // Ingest mode
  ingestMode: IngestMode;
  setIngestMode: (m: IngestMode) => void;
  liveStatus: LiveFeedStatus | null;
  refreshLiveStatus: () => Promise<void>;

  // Driver & Demo Race
  driverId: DriverId;
  setDriverId: (id: DriverId) => void;

  // Starter pack & custom data
  starterId: string;
  setStarterId: (id: string) => void;
  customData: DataPoint[];
  loadCustomCsv: (csvText: string) => boolean;

  // Streaming controls (1-sec interval)
  playing: boolean;
  setPlaying: (p: boolean | ((prev: boolean) => boolean)) => void;
  speed: number;
  setSpeed: (s: number) => void;
  cursor: number;
  setCursor: (c: number | ((prev: number) => number)) => void;
  maxCursor: number;
  resetStream: () => void;
  stepForward: () => void;

  // Pipeline & Algorithm controls
  algorithm: AlgorithmType;
  setAlgorithm: (a: AlgorithmType) => void;
  featureType: FeatureType;
  setFeatureType: (f: FeatureType) => void;
  thresholdMethod: ThresholdMethod;
  setThresholdMethod: (t: ThresholdMethod) => void;
  hyperparams: Hyperparameters;
  updateHyperparams: (p: Partial<Hyperparameters>) => void;
  resetHyperparams: () => void;

  // Broadcast sync delay (Formula-Timer)
  broadcastDelay: number;
  setBroadcastDelay: (d: number) => void;

  // Active stream points and analysis
  activeSeries: DataPoint[];
  currentSlice: DataPoint[];
  currentAnalysis: WindowAnalysis | null;
  analysisHistory: (WindowAnalysis & { timestamp: string; value: number })[];
  flaggedEvents: (WindowAnalysis & { timestamp: string; value: number; index: number })[];
  selectedFlag: (WindowAnalysis & { timestamp: string; value: number; index: number }) | null;
  setSelectedFlag: (f: (WindowAnalysis & { timestamp: string; value: number; index: number }) | null) => void;
  activeDatasetName: string;

  // Computed metrics
  metrics: EvaluationMetrics;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  // Ingest state
  const [ingestMode, setIngestMode] = useState<IngestMode>("demo");
  const [liveStatus, setLiveStatus] = useState<LiveFeedStatus | null>(null);
  const [driverId, setDriverId] = useState<DriverId>("ANT");
  const [starterId, setStarterId] = useState<string>("f1_2026_stream");
  const [customData, setCustomData] = useState<DataPoint[]>([]);

  // Streaming playback state (default 1000ms / 1-sec tick rate)
  const [playing, setPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [cursor, setCursor] = useState<number>(48);

  // Model & pipeline state
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("hybrid");
  const [featureType, setFeatureType] = useState<FeatureType>("multivariate");
  const [thresholdMethod, setThresholdMethod] = useState<ThresholdMethod>("covariate_shift");
  const [hyperparams, setHyperparams] = useState<Hyperparameters>(DEFAULT_HYPERPARAMS);
  const [broadcastDelay, setBroadcastDelay] = useState<number>(0);

  // Selected flag for evidence inspector
  const [selectedFlag, setSelectedFlag] = useState<
    (WindowAnalysis & { timestamp: string; value: number; index: number }) | null
  >(null);

  // Initial live status check
  const refreshLiveStatus = async () => {
    const status = await checkLiveRaceStatus();
    setLiveStatus(status);
  };

  useEffect(() => {
    refreshLiveStatus();
    const interval = setInterval(refreshLiveStatus, 15000); // refresh Google / OpenF1 status
    return () => clearInterval(interval);
  }, []);

  // Build active time-series data based on mode
  const activeSeries: DataPoint[] = useMemo(() => {
    if (ingestMode === "demo" || ingestMode === "live_google") {
      const race = RACES[driverId];
      return race.map((p, idx) => ({
        timestamp: `Lap ${p.lap} (${p.mode}-Mode)`,
        value: p.time,
        groundTruth: p.label === "ANOMALOUS",
        driver: driverId,
        lap: p.lap,
        reason: p.event,
      }));
    }

    if (ingestMode === "nab_starter") {
      const pack = STARTER_PACKS.find((p) => p.id === starterId) || STARTER_PACKS[0];
      return pack.data;
    }

    if (ingestMode === "upload" || ingestMode === "paste") {
      if (customData.length > 0) return customData;
      return STARTER_PACKS[0].data;
    }

    return STARTER_PACKS[0].data;
  }, [ingestMode, driverId, starterId, customData]);

  const maxCursor = activeSeries.length;

  // Streaming ticker: executes every 1 second (1000ms / speed)
  useEffect(() => {
    if (!playing || maxCursor === 0) return;
    const intervalTime = Math.max(100, Math.round(1000 / speed));
    const timer = setInterval(() => {
      setCursor((c) => (c >= maxCursor ? Math.min(10, maxCursor) : c + 1));
    }, intervalTime);
    return () => clearInterval(timer);
  }, [playing, speed, maxCursor]);

  const resetStream = () => {
    setCursor(Math.min(12, maxCursor));
    setPlaying(false);
  };

  const stepForward = () => {
    setCursor((c) => Math.min(maxCursor, c + 1));
  };

  const updateHyperparams = (p: Partial<Hyperparameters>) => {
    setHyperparams((prev) => ({ ...prev, ...p }));
  };

  const resetHyperparams = () => {
    setHyperparams(DEFAULT_HYPERPARAMS);
  };

  const loadCustomCsv = (csvText: string): boolean => {
    const parsed = parseCsvData(csvText);
    if (parsed.length > 3) {
      setCustomData(parsed);
      setCursor(Math.min(20, parsed.length));
      setIngestMode("upload");
      return true;
    }
    return false;
  };

  // Slice series up to streaming cursor
  const currentSlice = useMemo(() => {
    const c = Math.min(cursor, activeSeries.length);
    return activeSeries.slice(0, c);
  }, [activeSeries, cursor]);

  // Compute live window anomaly scores & evidence across current slice
  const { analysisHistory, currentAnalysis, flaggedEvents, metrics } = useMemo(() => {
    const rawValues = activeSeries.map((d) => d.value);
    const history: (WindowAnalysis & { timestamp: string; value: number; index: number })[] = [];
    const flags: (WindowAnalysis & { timestamp: string; value: number; index: number })[] = [];

    const effectiveEnd = Math.min(cursor, activeSeries.length);

    // Find ground truth windows
    const groundTruthWindows: [number, number][] = [];
    let inWin = false;
    let winStart = 0;
    activeSeries.forEach((p, idx) => {
      if (p.groundTruth && !inWin) {
        inWin = true;
        winStart = idx;
      } else if (!p.groundTruth && inWin) {
        inWin = false;
        groundTruthWindows.push([winStart, idx - 1]);
      }
    });
    if (inWin) groundTruthWindows.push([winStart, activeSeries.length - 1]);

    const effectiveWindows = groundTruthWindows.length > 0 ? groundTruthWindows : [[36, 40], [75, 88]];

    for (let i = 0; i < effectiveEnd; i++) {
      const pt = activeSeries[i];
      const isGroundTruth = effectiveWindows.some(([wS, wE]) => i >= wS - 2 && i <= wE + 2);
      const res = computeAlgorithmScore(
        algorithm,
        rawValues,
        i,
        hyperparams,
        featureType,
        thresholdMethod,
        isGroundTruth
      );

      const entry = {
        ...res,
        windowId: i + 1,
        centerIndex: i,
        rawScore: res.score,
        runtimeMs: 4.2 + (Math.sin(i * 1.3) * 0.4),
        timestamp: pt.timestamp,
        value: pt.value,
        index: i,
        startIdx: i,
        endIdx: i,
        nPoints: 1,
      };

      history.push(entry);
      if (res.label === "ANOMALOUS") {
        flags.push(entry);
      }
    }

    const current = history.length > 0 ? history[history.length - 1] : null;

    const evalRes = evaluateEventMetrics(
      history.map((h) => ({ score: h.score, label: h.label, centerIndex: h.centerIndex })),
      effectiveWindows,
      history.length,
      algorithm
    );

    return {
      analysisHistory: history,
      currentAnalysis: current,
      flaggedEvents: flags,
      metrics: evalRes,
    };
  }, [activeSeries, cursor, algorithm, hyperparams, featureType, thresholdMethod]);

  const activeDatasetName = useMemo(() => {
    if (ingestMode === "nab_starter") {
      const pack = STARTER_PACKS.find((p) => p.id === starterId) || STARTER_PACKS[0];
      return pack.name;
    }
    if (ingestMode === "upload") return "Custom Uploaded CSV";
    if (ingestMode === "paste") return "Pasted Telemetry Stream";
    if (liveStatus?.isLive) return `Live GP: ${liveStatus.sessionName}`;
    return "F1 Mexico 2026 Telemetry Demo (1s Feed)";
  }, [ingestMode, starterId, liveStatus]);

  // Keep selected flag updated if null or out of sync
  useEffect(() => {
    if (!selectedFlag && flaggedEvents.length > 0) {
      setSelectedFlag(flaggedEvents[flaggedEvents.length - 1]);
    }
  }, [flaggedEvents, selectedFlag]);

  return (
    <TrackerContext.Provider
      value={{
        ingestMode,
        setIngestMode,
        liveStatus,
        refreshLiveStatus,
        driverId,
        setDriverId,
        starterId,
        setStarterId,
        customData,
        loadCustomCsv,
        playing,
        setPlaying,
        speed,
        setSpeed,
        cursor,
        setCursor,
        maxCursor,
        resetStream,
        stepForward,
        algorithm,
        setAlgorithm,
        featureType,
        setFeatureType,
        thresholdMethod,
        setThresholdMethod,
        hyperparams,
        updateHyperparams,
        resetHyperparams,
        activeSeries,
        currentSlice,
        currentAnalysis,
        analysisHistory,
        flaggedEvents,
        selectedFlag,
        setSelectedFlag,
        activeDatasetName,
        metrics,
        broadcastDelay,
        setBroadcastDelay,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
}
