---
title: Analogue clock reader
summary: Reads the time from a photo with no learned time model - a U-Net segments the hands, projective geometry does the rest.
description: Reading analogue clocks with a U-Net trained on synthetic data and projective geometry (pole-polar rectification) instead of a learned time model.
area: Computer vision
order: 14
repo: https://github.com/kapi0okapi/clock-reader
tags: [segmentation, U-Net, synthetic data, projective geometry]
cover: ../../assets/projects/clock-reader.jpg
coverAlt: A tilted test clock read step by step - photo, U-Net masks of the hands and the 12 o'clock marker, and the dial rectified to a frontal view
video: /media/projects/clock-reader.mp4
metrics:
  - { value: "98.6 %", label: "tilted, rotated clocks read within 5 min" }
  - { value: "0.1 min", label: "median reading error" }
  - { value: "+28 pts", label: "from roll augmentation (ablation)" }
---

The network never predicts the time. A U-Net segments the dial, the hands, the pivot and the
12 o'clock marker; geometry turns the masks into hours and minutes. All training data is
rendered procedurally, so every pixel comes with an exact label.

The interesting part is the geometry. A circle seen at an angle projects to an ellipse; the
centre of the circle is the pole of the line at infinity, so the polar of the projected pivot
with respect to the fitted ellipse is the vanishing line of the dial plane. Mapping it back to
infinity removes the perspective exactly. With ground-truth masks the geometric step reads 100 %
of the synthetic test clocks; a classical Hough + Otsu pipeline reads 8.7 % of tilted ones.

## Results

Trained on a supercomputer (one NVIDIA A100, 40 epochs, about 70 minutes) and scored on 2000 unseen
synthetic clocks with perspective tilt, ±25° roll, clutter, blur and glare:

| Method | Read within 5 min | Facing the camera |
|---|---|---|
| Classical: Hough circle + Otsu + geometry | 8.7 % | 69.7 % |
| U-Net (ResNet-34) + geometry | **98.6 %** | **99.7 %** |
| Ground-truth masks + geometry (upper bound) | 100 % | 100 % |

![Share of clocks read within 5 minutes per method, and the augmentation ablation](../../assets/projects/clock-reader-results.png)

The median error is 0.1 minutes and no clock fails to read. A ResNet-18 encoder loses 0.7 points
and is only 7 % faster on a CPU, because the U-Net decoder dominates the compute.

## Ablation

Training without one augmentation at a time, scored on the same distorted clocks, shows what each
is worth: without perspective tilt 87.5 %, without in-plane roll 70.7 %. Both cost nothing on
frontal clocks - they only matter on the clocks real photos look like.
