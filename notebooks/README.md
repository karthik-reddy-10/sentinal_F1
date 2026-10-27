# 📓 Sentinel F1 — Reproducibility & Pipeline Notebooks

This directory contains interactive Jupyter notebooks demonstrating the data flow, mathematical formulations, permitted models, and evaluation routines for the **Sentinel F1** anomaly detection pipeline.

---

## 🚀 Notebook Overview

### [`sentinel_f1_anomaly_detection.ipynb`](sentinel_f1_anomaly_detection.ipynb)
**Complete End-to-End Pipeline & Permitted Algorithm Benchmark**
- **Section 1**: Ingesting high-frequency 1-second telemetry and standard Numenta Anomaly Benchmark (NAB) streams.
- **Section 2**: Sliding-window buffer extraction with multivariate feature representations ($W=8$, $\mu_W$, $\sigma_W$, $\Delta x$, lag vectors).
- **Section 3**: Comparative implementation of all 8 permitted algorithms:
  1. Rolling Z-Score (Statistical Baseline)
  2. Isolation Forest (Space Partitioning Trees)
  3. Local Outlier Factor (Density-based reachability)
  4. One-Class SVM (Kernel support boundary)
  5. Neural Autoencoder (Reconstruction error loss)
  6. Temporal Clustering (Phase-space trajectory centroids)
  7. Sliding-Window Adaptive Thresholding
  8. Multi-Head Hybrid Consensus Ensemble
- **Section 4**: Covariate-shift adaptive thresholding ($\tau_t = \mu_W + k\cdot\sigma_W \cdot (1 + \Delta_{\text{regime}})$).
- **Section 5**: Metric evaluation (Event-F1, Precision, Recall, Latency) across benchmark suites.
- **Section 6**: Generation and schema validation of official prediction files.

---

## 💻 Running the Notebook Locally

```bash
# Ensure dependencies are installed
pip install numpy pandas matplotlib scikit-learn jupyter

# Launch Jupyter
jupyter notebook notebooks/sentinel_f1_anomaly_detection.ipynb
```
