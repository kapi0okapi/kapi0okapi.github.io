---
title: Guardrail inspector
summary: Weak labels from NVDB geometry on Statens vegvesen's road photos, a multi-label CNN, and a map of where photos and register disagree.
description: Is Norway's road register right about guard rails? Weak labels from NVDB GIS geometry on road photos, a ConvNeXt classifier and a deviation map.
area: Road infrastructure
featured: true
order: 2
repo: https://github.com/kapi0okapi/guardrail-inspector
tags: [NVDB, Vegbilder, GeoPandas, ConvNeXt, DINOv3, weak supervision, TypeScript]
cover: ../../assets/projects/guardrail-inspector.jpg
coverAlt: Road photos from Trondheim with guard-rail labels generated automatically from NVDB geometry
metrics:
  - { value: "0.98", label: "AP, guard rail on the left (test)" }
  - { value: "0.751", label: "mAP, EfficientNet-B3 (test)" }
  - { value: "24", label: "stretches where photos and NVDB disagree" }
---

NVDB, Norway's national road database, records where guard rails stand. Statens vegvesen
photographs most national and county roads every year. This project joins the two: it trains a
model on the register's own geometry as weak supervision, and maps the stretches where the
photos and the register disagree.

## How it works

1. **Data.** NVDB API v4 for guard rails, end terminals and inspection records; the Vegbilder
   WFS for photo positions and headings. Everything in EPSG:25833.
2. **Weak labels.** Each guard rail is densified to 1 m points and transformed into every
   camera's frame. A rail counts as *visible on the left* when at least 5 m of it lies 4-25 m
   ahead and to the left. Borderline cases get an "unknown" label that is masked out of the loss.
3. **Training.** A multi-label CNN (ConvNeXt-T with ImageNet-22k or DINOv3 weights,
   EfficientNet-B3, ResNet-50) with masked, class-weighted BCE. A horizontal flip mirrors the
   scene, so the augmentation also swaps the left/right labels. Train/val/test are split by
   1 km grid cells so neighbouring photos never leak across splits.
4. **Deviations.** Runs of photos where model and register disagree become stretches on a
   TypeScript + MapLibre map.

## Results

Trondheim, test photos from 1 km cells never seen in training:

| Backbone | AP left | AP right | AP end left | AP end right | mAP |
|---|---|---|---|---|---|
| ConvNeXt-T, ImageNet-22k | 0.970 | 0.922 | 0.420 | 0.490 | 0.701 |
| ConvNeXt-T, DINOv3 | 0.973 | 0.932 | 0.453 | 0.587 | 0.736 |
| **EfficientNet-B3** | **0.980** | **0.939** | **0.567** | 0.518 | **0.751** |
| ResNet-50 | 0.969 | 0.916 | 0.468 | 0.549 | 0.725 |

Every backbone finds the rails themselves; the small end terminals separate them. EfficientNet-B3
had the best validation score and draws the deviation map. The geometry of the weak labels
later became the SQL comparison in the [road inspection platform](/work/inspection-platform/).
