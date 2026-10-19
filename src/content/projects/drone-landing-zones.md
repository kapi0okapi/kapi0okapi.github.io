---
title: Drone landing zones
summary: Where can a drone land? YOLO26-sem labels the ground below it, and a rule in metres picks the nearest clear spot away from people.
description: Safe landing-site selection for drones - YOLO26 semantic segmentation of nadir photos and a clearance rule in metres, checked against hand-labelled masks.
area: Computer vision
order: 11
repo: https://github.com/kapi0okapi/drone-landing-zones
tags: [drones, semantic segmentation, YOLO26, safe landing, distance transform]
cover: ../../assets/projects/drone-landing-zones.jpg
coverAlt: A garden seen from above with two people below the drone and the landing spot it chose 6 m away
metrics:
  - { value: "94 %", label: "safe landing decisions on test photos" }
  - { value: "38 %", label: "safe without the camera" }
  - { value: "94.0", label: "IoU, landable ground" }
---

A drone that has to land, because its battery is low or its link is lost, needs to know where it
can touch down. This project labels the ground below it pixel by pixel with YOLO26-sem (grass,
paved area, roof, tree, water, person and 16 more classes) and turns the labels into a decision
in metres: the nearest spot where a disc the size of the drone lies on flat open ground, with a
buffer around every person.

## How the decision is made

- **Metres, not pixels.** The flight altitude and the camera's field of view give the size of a
  pixel on the ground, so the same rule works from 5 m and from 30 m.
- **Clearance from a distance transform.** For every pixel, the radius of the largest clear disc
  around it, after removing a 3 m buffer around people and animals.
- **Nearest, with a margin.** The drone takes the closest candidate, planned with an extra
  0.75 m around obstacles and buffers so small errors at segmentation boundaries cannot put it
  next to a person.

## Results

80 unseen test photos from the Semantic Drone Dataset (TU Graz), every decision checked against
the hand-labelled mask:

| Policy | Safe decisions | Median diversion |
|---|---|---|
| descend where the drone is | 37.5 % | 0 m |
| **clear disc, buffer and margin** | **93.8 %** | 3.6 m |

The network labels landable ground with 94.0 IoU and people with 71.4, at 56 ms per photo; the
small YOLO26n-sem for an onboard computer reaches 86 % safe decisions.
