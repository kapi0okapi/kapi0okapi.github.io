---
title: GNSS/INS sensor fusion
summary: An error-state Kalman filter for RTK GNSS and IMU that stays consistent, bridges tunnels and is checked on real KITTI data.
description: Error-state Kalman filter (ESKF) for GNSS/RTK and IMU fusion - Gauss-Markov GNSS errors, non-holonomic constraint, RTS smoother, NEES, KITTI.
area: 3D & sensors
order: 5
repo: https://github.com/kapi0okapi/gnss-ins-fusion
tags: [sensor fusion, Kalman filter, ESKF, GNSS, RTK, IMU, KITTI]
cover: ../../assets/projects/gnss-ins-fusion.png
coverAlt: KITTI drive with two simulated GNSS outages bridged by the filter
metrics:
  - { value: "0.19 m", label: "horizontal RMS (synthetic, 50 runs)" }
  - { value: "NEES 3.9", label: "consistent (ideal 3)" }
  - { value: "42 → 2.3 m", label: "tunnel error with NHC" }
---

Loosely coupled GNSS/IMU navigation for a road vehicle: a 15-state error-state Kalman filter
with three extra GNSS error states, RTK fixed/float/single handling, outlier gating, a
non-holonomic constraint for tunnels and an RTS smoother.

## Results

Mean ± std over 50 simulated drives (30 on the real KITTI IMU log):

| GNSS error model in the filter | Horizontal RMS | NEES (ideal 3) |
|---|---|---|
| white noise | 0.33 ± 0.23 m | 61 ± 14 |
| Gauss-Markov states | **0.19 ± 0.14 m** | **3.9 ± 0.5** |

Treating time-correlated GNSS errors as white noise makes the filter about 20× overconfident.
In three simulated tunnels (30-120 s without GNSS), the non-holonomic constraint cuts the worst
error from 42 m to 2.3 m, more than a better IMU would; on the real KITTI drive with 45 s and
90 s outages, from 1309 m to 54 m.
