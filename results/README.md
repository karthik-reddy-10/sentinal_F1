# 📊 Sentinel F1 — Prediction Results & Evaluation Artifacts

This directory contains the pre-computed anomaly detection prediction files and benchmark evaluation summaries produced by the **Sentinel F1** real-time pipeline for **Challenge 2 (Sentinel Track)**.

---

## 📁 File Manifest

| File | Description | Target Evaluation Domain | Schema Columns |
| :--- | :--- | :--- | :--- |
| **[`predictions_f1_telemetry_2026.csv`](predictions_f1_telemetry_2026.csv)** | Predictions on the 2026 1-second telemetry stream (140 windows, 71 laps) | High-Frequency F1 Racing Telemetry | `timestamp, value, anomaly_score, label, window_id, detection_delay_ms, interpretable_evidence` |
| **[`predictions_nab_benchmark.csv`](predictions_nab_benchmark.csv)** | Evaluation predictions across standard Numenta Anomaly Benchmark datasets | NAB Benchmark Standard Suite (`art_daily_flatmiddle`, `ambient_temp`, `nyc_taxi`, `cpu_asg`) | `timestamp, dataset, value, anomaly_score, label, window_id, detection_delay_ms, interpretable_evidence` |
| **[`metrics_benchmark_summary.csv`](metrics_benchmark_summary.csv)** | Comparative benchmark metrics across all 8 permitted algorithms | Algorithm Comparison Matrix | `model_id, model_name, category, event_f1, precision, recall, typical_runtime_ms, false_alarm_rate` |

---

## 📋 Organizer Starter Kit Schema Compliance

All predictions follow the required competition schema:
- `timestamp`: ISO timestamp / stream time (e.g., `14:00:36` or `2026-10-15 18:00:00`)
- `value`: Raw sensor measurement or lap time
- `anomaly_score`: Normalized continuous confidence metric in range $[0.0, 1.0]$
- `label`: Binary classification (`NORMAL` vs `ANOMALOUS`)
- `window_id`: Sequential sliding-window index
- `detection_delay_ms`: Sub-window inference latency in milliseconds
- `interpretable_evidence`: Human-readable attribution explaining why the window was flagged (e.g. covariate shift clearance, structural reconstruction loss, or multi-head consensus).

---

## 🏆 Performance Highlights

- **Aggregate NAB Event-F1**: **0.869**
- **Precision**: **91.2%**
- **Recall**: **82.9%**
- **Detection Delay**: **3.8 ms** per window
- **False Alarm Suppression**: Reduced false positive rate from **12.4%** (Rolling Z-Score) down to **1.1%** (Hybrid Consensus).
