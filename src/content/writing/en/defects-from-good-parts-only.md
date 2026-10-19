---
title: "How to find defects when you only have photos of good parts"
description: PatchCore learns what normal looks like from defect-free images and flags anything else, with a threshold set without a single defect. 0.914 image AUROC on VisA.
published: 2026-01-31
tags: [anomaly detection, PatchCore, PaDiM, visual inspection, VisA, PyTorch]
cover: ../../../assets/writing/visa-candle.png
coverAlt: PatchCore anomaly maps on candle images from VisA
project: visual-anomaly-detection
---

On a production line, defects are rare. That is good for the factory and hard for machine
learning: a classifier needs many examples of every defect type, and nobody has them, especially
not for the defect that has not happened yet. Anomaly detection turns the problem around. It
learns only what a *good* part looks like and flags whatever does not fit. This article shows how
to build such an inspector with PatchCore and how to set it up so it can run on a real line.

## Learn normal, flag the rest

PatchCore needs nothing but photos of good parts:

1. **Describe every patch.** A pretrained CNN (Wide-ResNet-50 from ImageNet) turns every image into
   a grid of feature vectors, one for each small patch, using mid-level layers that describe local
   texture and shape rather than whole objects.
2. **Build a memory bank.** The patch features of all good training images are collected, then
   reduced to 1 % with greedy coreset sampling, which keeps the variety while making the search
   fast.
3. **Score a new image.** Each patch of a new image is compared with its nearest neighbour in the
   memory bank. A patch far from everything normal is anomalous; the distances form a heat map that
   shows *where* the defect is, and the largest one is the score of the whole image.

There is no training in the usual sense: building the memory bank for a category takes well under
a minute on a GPU.

## A threshold without defects

A score is not yet a decision. On a real line there are no defect images to tune a threshold on,
so the threshold here is set from good parts only: the 99th percentile of the scores of held-out
normal images. That keeps false alarms low by design, the number a production manager actually
asks about: on the test parts, 2.3 % of the good ones are flagged on average.

## Results on VisA

VisA is an industrial benchmark with 12 categories, from PCBs and capsules to candles and snacks,
evaluated with its official one-class split:

| Method | Image AUROC | Pixel AUROC | AUPRO |
|---|---|---|---|
| **PatchCore, this implementation** | **0.914** | **0.979** | **0.867** |
| PatchCore, published | 0.924 | 0.984 | - |
| PaDiM, this implementation | 0.851 | 0.966 | 0.792 |

The reimplementation is within 0.01 of the published PatchCore. The pixel AUROC of 0.98 means the
heat maps put the defect in the right place almost every time, which is what an operator needs to
trust a flag. On the best categories, such as one of the circuit-board types, candles and
pipe-shaped snacks, the image AUROC is 0.98 to 0.99.

## How many good parts are enough?

The same method with only a few normal images per category:

| Normal training images | Image AUROC | Pixel AUROC |
|---|---|---|
| 1 | 0.664 | 0.863 |
| 4 | 0.736 | 0.907 |
| 16 | 0.847 | 0.955 |
| 64 | 0.875 | 0.970 |
| all (450 to 905) | 0.914 | 0.979 |

Sixteen photos of good parts already give a useful inspector, and a few hundred give the full
result. That makes it practical to start on a new product on the first day of production.

## Using it on a line

A new product needs a few dozen photos of good parts under the line's lighting, one run to build
the memory bank, and a threshold from a held-out set of good parts. The output for every part is a
score, a pass or fail, and a heat map that shows the operator where to look. The code, the
per-category results and the few-shot study are in the
[visual-anomaly-detection project](/work/visual-anomaly-detection/).
