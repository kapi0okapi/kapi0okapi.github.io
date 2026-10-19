---
title: Edge optimisation of YOLO26
summary: INT8 YOLO26 on ONNX Runtime, OpenVINO, Core ML and TensorRT - a third of the size at 97 % of the float accuracy.
description: YOLO26 INT8 quantization across ONNX Runtime, OpenVINO, Core ML and TensorRT - layer sensitivity analysis, calibration, accuracy vs latency on COCO.
area: Deployment
order: 8
featured: true
repo: https://github.com/kapi0okapi/edge-optimization
tags: [INT8, quantization, ONNX Runtime, OpenVINO, Core ML, TensorRT, YOLO26]
cover: ../../assets/projects/edge-optimization.png
coverAlt: Accuracy against latency of YOLO26n variants on an Apple M4 Pro
metrics:
  - { value: "39.1", label: "mAP in INT8 (FP32: 40.3)" }
  - { value: "+5.0", label: "mAP over the standard INT8 export" }
  - { value: "7.5 ms", label: "YOLO26n on the Neural Engine" }
---

How small and fast can a detector get before it stops being accurate? YOLO26n exported to every
runtime it targets, quantised to INT8 in several ways and measured on all 5000 COCO val2017
images with the official metric, next to the latency on an Apple M4 Pro. You can run the
quantised model [in your browser](/lab/).

## Results (COCO val2017, mAP50-95)

| Variant | Size | mAP |
|---|---|---|
| ONNX FP32, end-to-end head | 9.9 MB | 40.3 |
| OpenVINO INT8 (NNCF) | 3.4 MB | 39.3 |
| **ONNX INT8, class branch in float, percentile calibration** | 3.4 MB | **39.1** |
| ONNX INT8, Ultralytics `quantize=8` export | 3.0 MB | 34.1 |
| ONNX INT8, everything quantised | 3.1 MB | 0.0 |

## Findings

- **Head decoding stays in float.** YOLO26's NMS-free head concatenates box coordinates in
  pixels (0-640) with class probabilities (0-1) into one tensor, which no single INT8 scale can
  hold; those few cheap nodes stay in float. [How it works](/writing/detector-on-edge-devices/).
- **Layer sensitivity analysis** found one group worth keeping in float: the head's class branch
  (+2.1 mAP). No other block is worth more than 1.2.
- **On Apple silicon INT8 buys size, not CPU speed**: the Neural Engine runs the FP16 Core ML
  model in 7.5 ms, faster than any CPU variant.
- **On x86, OpenVINO's INT8 is 1.7 to 2.2 times faster than FP32**, and on an A100 TensorRT runs
  either model in about 2 ms.
- **Careful calibration beats ten epochs of quantisation-aware training** (39.1 against 38.3 mAP
  for YOLO26n, 46.5 against 45.7 for YOLO26s), with no training at all.
