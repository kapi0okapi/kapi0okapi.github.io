---
title: Monocular depth on KITTI
summary: Eleven depth models from one camera on KITTI's Eigen split, published numbers reproduced, and a real-time model fine-tuned to measure in metres.
description: Depth Anything V2 and 3, Depth Pro and YOLO26-depth on KITTI Eigen, error per object class, and a real-time model fine-tuned to measure in metres.
area: Computer vision
order: 7
featured: true
repo: https://github.com/kapi0okapi/monocular-depth
tags: [depth estimation, Depth Anything, Depth Pro, YOLO26, KITTI, metric depth]
cover: ../../assets/projects/monocular-depth.jpg
coverAlt: Road photo of the E6 and its depth map from Depth Anything V2, split along a diagonal
video: /media/drive/depth.mp4
metrics:
  - { value: "0.070", label: "AbsRel, DA-V2 Large (paper 0.074)" }
  - { value: "0.937", label: "δ1, YOLO26x-depth (docs 0.932)" }
  - { value: "0.075", label: "AbsRel in metres, my fine-tuned YOLO26s" }
---

How far away is the guard rail, from one camera? Eleven depth models from four families on the
KITTI Eigen test split (652 frames with improved ground truth), each read the way its authors
evaluate it, with the published numbers next to mine and the error broken down by what the
pixel shows. **[Try the fine-tuned model in the lab](/lab/#depth)**: point at a photo to read distances.

## Results

| Model | Alignment | AbsRel | δ1 | Published |
|---|---|---|---|---|
| Depth Anything V2-Large | scale + shift | **0.070** | **0.956** | 0.074 / 0.946 |
| **YOLO26s-depth, fine-tuned on KITTI** | **none** | 0.075 | 0.932 | - |
| YOLO26x-depth | median | 0.075 | 0.937 | δ1 0.932 |
| Depth Anything 3 Metric-Large | none | 0.099 | 0.918 | - |
| Depth Pro, true focal length | none | 0.118 | 0.848 | - |

## Findings

- **A real-time metric model.** Fine-tuned on KITTI's training drives, YOLO26s-depth gives depth
  in metres with AbsRel 0.075 and no per-image alignment, ahead of every metric foundation model
  in the benchmark, at 0.02 s per image.

- **Input geometry matters for YOLO26-depth.** The models are trained on frames stretched to a
  768 × 768 square, and fed the same way here they reproduce the documented δ1 (0.887 / 0.918 /
  0.937 for s / m / x). A letterboxed frame, the default of `predict()`, drops δ1 to 0.65-0.70.
- **Depth Pro has the best shape, not the best scale:** aligned by the median it beats every
  model (AbsRel 0.060), but its metric output depends on its own focal-length estimate.
- **Thin structures are the hard part.** For every model the error on poles, signs and fences is
  two to four times the error on the road.
