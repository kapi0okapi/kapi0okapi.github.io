---
title: Road scene segmentation
summary: Seven segmentation models from 2021 to 2026 under one protocol on KITTI, and a guard-rail class the Cityscapes models lack.
description: YOLO26-sem, SegFormer, Mask2Former and EoMT compared under one protocol on KITTI, plus a guard-rail class learned by fine-tuning - tested on Norwegian E6 photos.
area: Computer vision
order: 6
featured: true
repo: https://github.com/kapi0okapi/road-scene-segmentation
tags: [semantic segmentation, YOLO26, EoMT, Mask2Former, SegFormer, Cityscapes, KITTI]
cover: ../../assets/projects/road-scene-segmentation.jpg
coverAlt: Road photos of the E6 near Trondheim, a zero-shot Cityscapes model and the fine-tuned model that finds guard rails
video: /media/drive/segment.mp4
metrics:
  - { value: "73.9", label: "mIoU, EoMT-L on KITTI" }
  - { value: "54 ms", label: "YOLO26s per image" }
  - { value: "51.9 %", label: "guard-rail IoU after fine-tuning" }
---

Pixel-wise classification of road scenes with four generations of models - SegFormer (2021),
Mask2Former (2022), EoMT (2025) and the real-time YOLO26-sem (2026) - all run under one
inference protocol. Every model is trained on German and Swiss streets (Cityscapes) and tested
without fine-tuning on KITTI, another camera in another city.

## Results (KITTI val, mIoU)

| Model | Cityscapes (paper) | KITTI | ms/image |
|---|---|---|---|
| EoMT-L (DINOv2 ViT-L) | 84.2 | **73.9** | 5667 |
| Mask2Former Swin-L | 83.3 | 65.0 | 2570 |
| SegFormer-B5 | 82.4 | 63.1 | 8519 |
| YOLO26s-sem | 80.8 | 57.6 | 54 |

On Cityscapes, EoMT leads Mask2Former by 0.9 points; on another city the lead is 8.9 points.
The foundation-model encoder transfers. The real-time YOLO26 models lose 23-27 points, with
traffic signs as their weakest class, but run a hundred times faster.

## A class Cityscapes ignores

Cityscapes annotates guard rails but leaves them out of its benchmark, so no model trained on it
predicts them. Fine-tuning YOLO26s-sem on 160 KITTI images with guard rail as a 20th class
teaches the class (51.9 % IoU) - at the price of the old classes, which fall by 12 points
because rare classes vanish. The next training run, on a GPU cluster, mixes Cityscapes and KITTI so the
old classes stay. The fine-tuned model is the one checked against Norway's road register in the
[inspection platform](/work/inspection-platform/).
