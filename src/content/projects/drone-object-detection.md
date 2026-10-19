---
title: Drone object detection
summary: People and vehicles seen from a drone - YOLO26s on VisDrone at 640 px, at 1280 px and on overlapping tiles, scored by object size.
description: Small-object detection from drones with YOLO26 on VisDrone - whole images against overlapping tiles, AP by object size with the official ignore regions.
area: Computer vision
order: 10
repo: https://github.com/kapi0okapi/drone-object-detection
tags: [drones, small objects, YOLO26, tiling, VisDrone, PyTorch]
cover: ../../assets/projects/drone-object-detection.jpg
coverAlt: YOLO26s detections of cars, people and motorbikes on a busy street seen from a drone
metrics:
  - { value: "26.5", label: "AP on VisDrone test-dev" }
  - { value: "×1.8", label: "AP on small objects vs. 640 px" }
  - { value: "14 ms", label: "per photo, tiles + whole image" }
---

From a drone, people and cars are a few dozen pixels wide: 68 % of the objects in VisDrone's
test set are smaller than 32 × 32 pixels in the original photo. Shrinking a 2000 × 1500 photo to
the usual 640 px input throws most of those pixels away. This project trains YOLO26s three ways
and measures what helps small objects most.

## Results

VisDrone test-dev, 1610 photos, scored like the official toolkit (ignored regions, up to 500
detections per image):

| Training | Inference | AP | AP small | AP large |
|---|---|---|---|---|
| whole image, 640 px | whole image, 640 px | 17.4 | 8.8 | 38.3 |
| whole image, 1280 px | whole image, 1280 px | 25.6 | 15.7 | 47.2 |
| **640 px tiles** | **tiles + whole image** | **26.5** | **16.2** | **49.6** |

- **Tiles keep the pixels.** Training and predicting on overlapping 640 px tiles nearly doubles
  the AP on small objects, and one extra pass over the whole image keeps the large ones.
- **One model for any camera.** The tiled model keeps a 640 px input, so a higher-resolution
  drone camera only means more tiles, not a new model.
- **Scored the official way.** VisDrone marks crowds and far clutter as regions to ignore; they
  become crowd boxes in the COCO evaluation, so a detection there is neither rewarded nor punished.
