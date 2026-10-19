---
title: Visual anomaly detection
summary: PatchCore and PaDiM from scratch on VisA - finding and localising defects after seeing only normal parts.
description: PatchCore and PaDiM reimplemented in PyTorch on the VisA benchmark - image and pixel AUROC, AUPRO, thresholds set without defect examples.
area: Computer vision
order: 9
featured: true
repo: https://github.com/kapi0okapi/visual-anomaly-detection
tags: [anomaly detection, PatchCore, PaDiM, VisA, industrial inspection]
cover: ../../assets/projects/visual-anomaly-detection.png
coverAlt: PatchCore anomaly heat maps on candles from the VisA dataset
metrics:
  - { value: "0.914", label: "image AUROC (paper 0.924)" }
  - { value: "0.979", label: "pixel AUROC (paper 0.984)" }
  - { value: "12", label: "VisA categories" }
---

Industrial visual inspection when defects are rare: PatchCore and PaDiM learn only from normal
images and flag what does not fit. Both are reimplemented in PyTorch and evaluated on all 12
categories of VisA.

| Method | Image AUROC | Pixel AUROC | AUPRO |
|---|---|---|---|
| PatchCore (WRN-50), this repo | **0.914** | **0.979** | 0.867 |
| PatchCore, published | 0.924 | 0.984 | - |
| PaDiM, this repo | 0.851 | 0.966 | 0.792 |
| PatchCore on DINOv3 ConvNeXt-T | 0.826 | 0.951 | 0.732 |

The decision threshold comes from normal images only - the 99th percentile of held-out normal
scores - as it would on a production line without defect examples. Sixteen photos of good
parts per category already reach 0.85 image AUROC. A newer self-supervised
backbone (DINOv3) was worse on every category but one: PatchCore's design was tuned on
Wide-ResNet features.
