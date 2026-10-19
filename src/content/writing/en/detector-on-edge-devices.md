---
title: "How to run an object detector on an edge device: YOLO26 in INT8 at 97 % of its accuracy"
description: Export YOLO26 to ONNX Runtime, OpenVINO, Core ML and TensorRT, quantise it to INT8 the right way and pick the runtime that fits the hardware. Measured on all of COCO.
published: 2026-06-27
tags: [edge AI, quantization, INT8, ONNX Runtime, OpenVINO, Core ML, YOLO26]
cover: ../../../assets/writing/int8-pareto.png
coverAlt: COCO accuracy against latency for YOLO26n variants on an Apple M4 Pro
project: edge-optimization
---

A detector that runs at 200 frames per second on a data-centre GPU is of little use if the camera
is on a drone, a factory line or a phone. On those devices three things matter: the size of the
model, the memory it needs and the time per frame, and they matter more than the last tenth of a
point of accuracy. This article shows how to take YOLO26n, the smallest model of the newest YOLO
generation, to edge hardware, and how to measure that nothing important is lost on the way.

## One model, many runtimes

Each kind of hardware has a runtime that gets the most out of it:

| Hardware | Runtime | Format |
|---|---|---|
| any CPU, also in the browser | ONNX Runtime | ONNX |
| Intel CPUs and GPUs | OpenVINO | OpenVINO IR |
| iPhone, iPad, Mac (Neural Engine) | Core ML | ML package |
| NVIDIA GPUs and Jetson | TensorRT | engine |

YOLO26 makes the export easy because its head is *end-to-end*: the network itself outputs at most
300 final boxes, so there is no separate non-maximum suppression step to reimplement on every
device. The exported file is the whole detector.

## INT8: a third of the size

Quantising the weights and activations from 32-bit floats to 8-bit integers makes the model three
times smaller and, on hardware with fast integer units, faster. Static quantisation needs a few
hundred calibration images to choose the range of every tensor; here they come from the COCO
training set, never from the validation set the model is scored on.

Two rules decide how much accuracy survives:

1. **Keep the head's decoding in float.** YOLO26's head ends by joining box coordinates in pixels
   (0 to 640) and class probabilities (0 to 1) into one tensor. A single INT8 scale cannot hold
   both ranges, so these few, cheap nodes stay in 32-bit float.
2. **Measure which layers are sensitive.** Keeping each block in float in turn, with the rest in
   INT8, shows where precision matters. One group stands out: the class branch of the head is
   worth 2.1 mAP, more than any block of the backbone. Keeping it in float costs almost nothing in
   size.

Percentile calibration, which ignores the rare extreme activations, adds more than a point over
the simple min-max ranges.

## The result

On all 5,000 COCO val2017 images with the official metric:

| Model | Size | mAP50-95 |
|---|---|---|
| ONNX FP32 | 9.9 MB | 40.3 |
| Core ML FP16 | 5.1 MB | 40.2 |
| OpenVINO INT8 | 3.4 MB | 39.3 |
| **ONNX INT8, class branch in float, percentile** | **3.4 MB** | **39.1** |
| ONNX INT8, standard Ultralytics export | 3.0 MB | 34.1 |

The INT8 model keeps 97 % of the float accuracy at a third of the size, and is five points ahead
of the standard export.

## Pick the runtime for the device

Speed depends on the hardware more than on the format. On an Apple M4 Pro:

- the **Neural Engine** runs the Core ML FP16 model in **7.5 ms**, the fastest option by far;
- on the **CPU**, FP32 and INT8 are close with several threads (about 10 ms), so INT8 is mainly
  a size win there;
- on an **x86 CPU**, OpenVINO's INT8 model runs 1.7 to 2.2 times faster than FP32 (5.9 ms for
  YOLO26n with eight threads);
- on a data-centre **GPU** with TensorRT, FP16 already takes about 2 ms, and INT8 saves only a
  tenth of a millisecond at batch 1.

Careful post-training quantisation also holds its own against quantisation-aware training: ten
epochs of QAT on all of COCO reach 38.3 mAP, below the 39.1 of the calibrated INT8 model.

So the recipe is: export once, quantise carefully, then measure on the device you will actually
use, because the fastest choice on one chip is rarely the fastest on the next.

## Try it

The INT8 model from this article runs in your browser in the [lab](/lab/): 3.4 MB, WebAssembly, no
server. The code, the sensitivity analysis and all tables are in the
[edge-optimization project](/work/edge-optimization/).
