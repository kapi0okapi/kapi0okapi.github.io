---
title: LiDAR road-corridor segmentation
summary: RandLA-Net from scratch for mobile-mapping point clouds, then a measurement of guard-rail height station by station.
description: RandLA-Net reimplemented in plain PyTorch for mobile-mapping LiDAR point clouds (Toronto-3D, LAS/LAZ), with guard-rail height measurement per metre.
area: 3D & sensors
order: 4
repo: https://github.com/kapi0okapi/lidar-road-segmentation
tags: [LiDAR, point clouds, RandLA-Net, PyTorch, LAS/LAZ, Toronto-3D]
cover: ../../assets/projects/lidar-road-segmentation.png
coverAlt: Segmented point cloud of a road corridor and the height profile of a guard rail with a lowered section
metrics:
  - { value: "81.8", label: "mIoU on Toronto-3D (paper 81.8)" }
  - { value: "77.2", label: "mIoU without colour (paper 77.7)" }
  - { value: "1 m", label: "stations along each barrier" }
---

Semantic segmentation of mobile-mapping point clouds with RandLA-Net, written in plain PyTorch
with no custom CUDA operators, and a step that turns the labels into an inspection: each
barrier is extracted, cut into 1 m stations, and given its rail height above the road surface.

## Highlights

- **Linear in the number of points.** Random sampling instead of farthest-point sampling; all
  neighbour, pooling and upsampling indices are built with k-d trees in the DataLoader workers,
  so the GPU runs only dense tensor operations.
- **Whole-tile inference.** Neighbourhoods are centred on the least-covered points until every
  point is covered, probabilities are averaged over overlaps and projected back to every
  original point; the output is LAZ that opens in CloudCompare or QGIS.
- **From labels to a measurement.** Barriers are split into connected components, stationed
  along their principal axis and measured against a least-squares road plane that follows grade
  and crossfall. On synthetic data with a 0.75 m rail the measured median is 0.73 m.

## Results

Trained on three Toronto-3D tiles and tested on the fourth at full resolution, the
reimplementation matches the published RandLA-Net: 81.8 mIoU with colour (paper 81.8) and 77.2
with geometry and intensity only (paper 77.7, geometry only). Intensity lifts the road markings
by 11 points, since the paint is retroreflective, but fences, the class that holds the guard
rails, need the colour.
