---
title: "How to measure distance in metres with a single camera"
description: "Fine-tune a real-time depth model on KITTI so it gives metric depth from one photo: AbsRel 0.075 with no scaling, ahead of large foundation models, at 20 ms per image."
published: 2026-08-08
tags: [monocular depth, YOLO26, KITTI, metric depth, fine-tuning]
cover: ../../../assets/projects/monocular-depth.jpg
coverAlt: A road photo and its depth map, split along a diagonal
project: monocular-depth
---

How far away is that guard rail? A stereo camera or a LiDAR can measure it directly, but most
vehicles, drones and phones have one ordinary camera. Monocular depth models estimate distance
from a single image, and the newest ones are good enough to measure with. This article shows how
to turn a small real-time model into one that gives depth in metres, and how to check that it
does.

## Relative depth or metric depth?

Most depth models predict *relative* depth: the shape of the scene is right, but the scale is
unknown. To score them, the prediction is rescaled to match the ground truth on every image, which
is fine for a benchmark and useless in a car, where there is no ground truth to rescale with.
*Metric* models output metres directly. That is what a measurement needs, and that is how they
are scored here: as they come, with no per-image scaling.

## A benchmark first

Before training anything, it pays to know what the existing models do on the target data. On the
KITTI Eigen test split (652 street frames with LiDAR ground truth), eleven models were evaluated,
each the way its authors evaluate it:

| Model | Output | AbsRel ↓ | Time per image |
|---|---|---|---|
| Depth Anything V2-Large | relative, aligned per image | 0.070 | 1.35 s |
| YOLO26x-depth | relative, aligned per image | 0.075 | 0.08 s |
| Depth Anything 3 Metric-Large | metres | 0.099 | 0.13 s |
| Depth Pro, true focal length | metres | 0.118 | 5.15 s |

The best relative models are very accurate, but they need the scale from somewhere. The metric
foundation models give metres directly, at an error of 10-12 %.

## Fine-tuning a small model into a metric one

YOLO26s-depth is the small, real-time member of the newest YOLO family. Fine-tuned on KITTI's
training drives for ten epochs, it learns the scale of the scene from the data. Three details make
the result trustworthy:

- **The same input in training and use.** The model is trained on frames resized exactly the way
  they are resized at inference, so it never sees an input it was not trained on.
- **A clean validation set.** Every twelfth training drive is held out. It is used to pick the
  best checkpoint and to fit the single scale factor that maps the output to metres, so the test
  frames are only touched for the final score.
- **The official protocol.** The test uses the standard Garg crop and a range of 80 metres, so
  the numbers compare directly with published ones.

## The result

| Model | Output | AbsRel ↓ | δ1 ↑ | Time per image |
|---|---|---|---|---|
| **YOLO26s-depth, fine-tuned** | **metres** | **0.075** | **0.932** | **0.02 s** |
| Depth Anything 3 Metric-Large | metres | 0.099 | 0.918 | 0.13 s |
| Depth Pro, true focal length | metres | 0.118 | 0.848 | 5.15 s |

The fine-tuned model is the most accurate metric model in the comparison: its average error is
7.5 % of the distance, with no scaling of any kind. Measured for shape alone, it equals Depth
Anything V2-Large (AbsRel 0.070) while running almost seventy times faster.

Broken down by what the pixel shows, it is the best model of all on the road surface (4 % error)
and on cars (7 %). Thin objects such as poles and signs remain harder for every model, which is
worth knowing before measuring them from one camera.

## What it is good for

A metric depth model turns any calibrated camera into a rough range finder: distance to the car
ahead, to a pedestrian, to a guard rail or to the ground under a drone. Fine-tuning on the camera
and the kind of scene it will see is what makes the metres reliable, and a held-out set from the
same setting is how you know they are. The code and all evaluations are in the
[monocular-depth project](/work/monocular-depth/).
