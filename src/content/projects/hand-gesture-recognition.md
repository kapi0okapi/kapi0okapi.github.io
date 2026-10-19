---
title: Hand gesture recognition
summary: Static and dynamic gestures from hand keypoints - an MLP, a graph network and a causal TCN against an end-to-end YOLO26.
description: Real-time hand gesture recognition from MediaPipe keypoints - MLP, graph network and causal TCN - compared with an end-to-end YOLO26 detector.
area: Computer vision
order: 13
repo: https://github.com/kapi0okapi/hand-gesture-recognition
tags: [gesture recognition, MediaPipe, graph neural network, TCN, YOLO26]
cover: ../../assets/projects/hand-gesture-recognition.png
coverAlt: Hand landmarks from HaGRID and synthetic dynamic gestures
video: /media/projects/hand-gestures.mp4
metrics:
  - { value: "99.3 %", label: "gesture accuracy, YOLO26s detector" }
  - { value: "95.8 %", label: "static gestures, people never seen" }
  - { value: "28 ms", label: "keypoint pipeline per photo, CPU" }
---

Real-time recognition of 33 static hand gestures and dynamic ones (swipes, push/pull, rotations,
grab/release) from a webcam. MediaPipe finds 21 landmarks per hand and small networks classify
them in about 10 ms per frame on a laptop CPU. **[Try it in the lab](/lab/#gestures)** with your webcam.

- **Static gestures on about a million real hands:** HaGRID's landmarks instead of 1.5 TB of
  photos; an MLP on engineered features against a graph network along the bones of the hand.
- **Dynamic gestures without a dynamic dataset:** real hand shapes animated with minimum-jerk
  motion and corrupted like a live detector would corrupt them, classified by a causal temporal
  convolutional network - verified by a unit test never to look into the future.
- **Two paradigms on the same photos:** keypoints + classifier against a YOLO26 detector trained
  end to end, compared on hand recall, gesture accuracy and latency.

On 4080 held-out photos, the YOLO26 detector finds 99.6 % of the hands and names 99.3 % of the
gestures correctly; the keypoint pipeline misses about one hand in ten but runs faster on a CPU
(28 ms against 41 ms per photo) and gives the skeleton the dynamic gestures need.
