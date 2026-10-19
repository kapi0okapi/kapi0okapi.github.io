---
title: "How to map a road with LiDAR and measure its guard rails"
description: LiDAR odometry with loop closure, RandLA-Net for what every point is, and a metre-by-metre height profile of each guard rail. Checked on KITTI and Toronto-3D.
published: 2026-01-10
tags: [LiDAR, SLAM, point clouds, RandLA-Net, KITTI, Toronto-3D]
cover: ../../../assets/projects/lidar-road-segmentation.png
coverAlt: A segmented road-corridor point cloud and the height profile of a guard rail
project: lidar-road-segmentation
---

A mobile mapping car with a LiDAR on the roof collects millions of points per minute. Turning them
into something a road owner can use takes three steps: put every scan in the right place, decide
what every point is, and measure the objects that matter. This article shows all three, each built
from scratch and checked against published results.

## Step 1: where was the car? LiDAR odometry

Each scan is registered to a local map of the scans before it, which gives the motion of the car
from one scan to the next. The pipeline follows KISS-ICP:

1. **Predict** the new pose with a constant-velocity model: a car does not change its speed much
   in a tenth of a second.
2. **Downsample** the scan on a voxel grid, so dense nearby points do not outweigh distant ones.
3. **Align** it to a local voxel map with point-to-point ICP and a robust kernel.
4. **Adapt** the matching threshold to how much ICP had to correct the prediction recently, so
   the method works in the city and on the motorway with the same settings.

KITTI's Velodyne has vertical beam angles that are off by about 0.2 degrees, enough to bend flat
ground into a shallow cone. Correcting them halves the drift over the whole dataset.

## Step 2: closing the loop

Odometry drifts slowly. When the car comes back to a place it has seen, that drift can be removed:

- **Scan Context** describes each place as a compact ring-and-sector image of the scan, so
  revisits can be found quickly among thousands of earlier scans;
- **ICP verification** checks every candidate: at least 70 % of the points must align within half
  a metre;
- a **pose graph** with all odometry steps and loops is solved with sparse least squares, and a
  chi-square test removes any loop that disagrees with the rest.

On all eleven KITTI sequences with ground truth (22 km) the odometry drifts 0.63 % of the distance
travelled, close to the authors' own package (0.56 %). Loop closure then cuts the absolute error on
sequence 00 from 2.3 m to 1.0 m, and on sequence 05 from 1.3 m to 0.4 m.

## Step 3: what is every point? RandLA-Net

With the map in place, each point needs a class: road, road marking, vegetation, building, pole,
car, fence. RandLA-Net is built for exactly this scale. It samples points at random instead of
with expensive farthest-point sampling and makes up for it with local feature aggregation and
attentive pooling, and processes about 70,000 points per second on one GPU.

The reimplementation is plain PyTorch with no custom CUDA code: all neighbour and pooling indices
are built with k-d trees in the data loader, and the GPU runs only dense tensor operations. A whole
tile is predicted by covering it with overlapping neighbourhoods and averaging the votes for every
point; the result is written as a LAZ file that opens in CloudCompare or QGIS.

On Toronto-3D, a mobile mapping dataset of a city street, it reaches **81.8 mIoU**, the same as the
published RandLA-Net result (81.8), with 96.8 IoU on the road surface and 94.3 on cars.

## Step 4: measuring the guard rails

The points labelled as barriers are split into individual objects, each object is cut into one-metre
stations along its main direction, and every station gets its rail height above a least-squares
road plane that follows the grade and the crossfall. The output is a height profile per barrier, in
metres, with every station outside the allowed range flagged for an inspector. On a synthetic
test corridor with a 0.75 m rail the measured median is 0.73 m.

## Putting it together

Odometry and loop closure give a consistent map, segmentation says what is in it, and simple
geometry turns the labels into measurements a road owner can act on. The code is in two projects:
[LiDAR SLAM](/work/lidar-slam/) and [LiDAR road-corridor segmentation](/work/lidar-road-segmentation/).
