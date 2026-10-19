---
title: Age estimation
summary: Apparent age from aligned face images - three heads compared, errors reported per age group, gender and ethnicity.
description: Age estimation from faces with MediaPipe alignment, label-distribution learning and ConvNeXt, with errors broken down by group and ONNX export.
area: Computer vision
order: 15
repo: https://github.com/kapi0okapi/age-estimation
tags: [face analysis, regression, label distribution learning, ConvNeXt, DINOv3, ONNX]
cover: ../../assets/projects/age-estimation.jpg
coverAlt: Title card for the age estimation project
metrics:
  - { value: "4.25 years", label: "mean absolute error, UTKFace test" }
  - { value: "68.7 %", label: "within 5 years" }
  - { value: "1.3 → 7.9", label: "error from children to over-65s" }
---

Estimates apparent age from a photo. Faces are aligned with five MediaPipe landmarks and a
least-squares similarity transform; a pretrained CNN predicts a distribution over ages 0-100
and the reported age is its expected value. **[Try it in the lab](/lab/#age)**: the DINOv3 model
runs in your browser, from the webcam or a photo.

- **Three interchangeable heads** - L1 regression, label-distribution learning (DLDL-v2) and the
  mean-variance loss - behind one config switch.
- **Errors broken down by group:** a single mean absolute error can hide large gaps between age
  groups, genders and ethnicities.
- **Benchmarked against a unified protocol** (Paplhám & Franc, CVPR 2024), whose main lesson is
  that pretraining and resolution matter more than the choice of head.

## Results

| Backbone | Head | MAE (years) |
|---|---|---|
| ResNet-50 | regression / mean-variance / DLDL | 4.83 / 4.69 / 4.74 |
| ConvNeXt-T, ImageNet-22k | DLDL | 4.40 |
| **ConvNeXt-T, DINOv3** | DLDL | **4.25** |

On 2371 test faces, the head changes the error by about 0.1 years and the backbone by half a
year, as the unified benchmark predicts. The error grows with age, from 1.3 years for children
to 7.9 for people over 65, and varies less between genders (4.0 and 4.5) than between ages.
