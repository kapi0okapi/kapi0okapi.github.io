---
title: Vehicle counter
summary: YOLO26 and five multi-object trackers count each vehicle once per line and direction - 2.7 % counting error on traffic cameras it never saw.
description: Vehicle detection, tracking and counting with YOLO26 and five trackers, fine-tuned on UA-DETRAC and scored on held-out cameras against annotated tracks.
area: Computer vision
order: 12
repo: https://github.com/kapi0okapi/vehicle-counter
tags: [object tracking, YOLO26, ByteTrack, multi-object tracking, traffic, TensorRT]
cover: ../../assets/projects/vehicle-counter.jpg
coverAlt: Vehicles with track ids and trails crossing a count line on a Beijing street
video: /media/projects/vehicle-counter.mp4
metrics:
  - { value: "2.7 %", label: "counting error, unseen cameras" }
  - { value: "9.7 → 2.7 %", label: "error, COCO vs. fine-tuned" }
  - { value: "357 FPS", label: "YOLO26m, TensorRT FP16, A100" }
---

Detection, tracking and counting of vehicles in video files, RTSP streams or webcams. A YOLO26
detector finds the vehicles, a tracker links them across frames, and each vehicle is counted
**once** per line as it crosses, split by direction and class.

## Results

UA-DETRAC, 9 camera sites held out from training, 637 vehicles crossing the count lines. Each
camera gets one count line across its road, perpendicular to the direction of its traffic, and
the true count runs the same rule over the annotated tracks.

| Detector | Tracker | Count error |
|---|---|---|
| YOLO26s, COCO weights | ByteTrack | 9.7 % |
| YOLO26s, fine-tuned | ByteTrack | 5.7 % |
| YOLO26m, fine-tuned | ByteTrack | 3.3 % |
| **YOLO26m, fine-tuned** | **BoT-SORT** | **2.7 %** |
| YOLO26m, fine-tuned | OC-SORT | 3.3 % |
| YOLO26m, fine-tuned | TrackTrack | 3.8 % |
| YOLO26m, fine-tuned | FastTracker | 3.1 % |

- **Fine-tuning matters most.** Traffic cameras look down on the road from far away; training on
  UA-DETRAC cuts the counting error from 9.7 % to 2.7 %.
- **Counted once, in the right direction.** A crossing is the intersection of a track's movement
  segment with the count segment; the sign of the cross product gives the direction, and each
  track-line pair counts at most once.
- **Fast enough for many cameras.** The TensorRT FP16 engine of YOLO26m takes 2.8 ms per 960 px
  frame on an A100.
