---
title: LiDAR SLAM
summary: KISS-ICP odometry implemented from the paper, Scan Context loop closure and a pose graph - next to the authors' own package on KITTI.
description: LiDAR odometry and SLAM in Python - KISS-ICP from the paper, Scan Context loop closure, SE(3) pose graph - evaluated on KITTI next to the authors' package.
area: 3D & sensors
order: 3
featured: true
repo: https://github.com/kapi0okapi/lidar-slam
tags: [LiDAR, SLAM, ICP, KISS-ICP, Scan Context, pose graph, KITTI]
cover: ../../assets/projects/lidar-slam.png
coverAlt: KITTI sequence 00 trajectory from LiDAR odometry with and without loop closure, against the GPS/INS reference
metrics:
  - { value: "0.63 %", label: "drift on KITTI 00-10 (22 km)" }
  - { value: "2.3 → 1.0 m", label: "ATE with loop closure (00)" }
  - { value: "×1.9", label: "drift without the 0.2° fix" }
---

LiDAR odometry and loop closure for a car-mounted Velodyne, written in NumPy and SciPy: the
KISS-ICP pipeline, Scan Context place recognition and an SE(3) pose graph. Evaluated on KITTI
with the official devkit metric, next to the KISS-ICP paper and the authors' own package run
through the same evaluation code.

## Results

| KITTI 00-10 | This repo | `kiss-icp` package | Paper |
|---|---|---|---|
| translation drift | 0.63 % | 0.56 % | 0.50 % |
| rotation drift (deg / 100 m) | 0.17 | 0.16 | - |

All eleven sequences with ground truth, 22 km in total. Verified loops cut the absolute
trajectory error from 2.31 m to 0.99 m on sequence 00 and from 1.27 m to 0.41 m on 05.

## What mattered

- **KITTI's vertical-angle error.** The HDL-64E in KITTI has vertical beam angles that are off
  by about 0.2°, which bends the flat ground into a shallow cone. Without the correction, the
  drift over all eleven sequences grows from 0.63 % to 1.19 %, and on 04 from 0.45 % to 1.06 %. The whole pipeline
  is described in [this article](/writing/map-a-road-with-lidar/).
- **Two-stage loop verification.** ICP must align 70 % of the points within 0.5 m, and a
  chi-square test on the solved graph removes any loop that disagrees with the rest, so
  look-alike places on a long straight street never bend the trajectory.
- **Sparse pose graph.** 4541 poses and 143 loops are solved by SciPy's trust-region least
  squares with an explicit Jacobian sparsity pattern in under two minutes.
