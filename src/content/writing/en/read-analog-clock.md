---
title: "How to build a system that reads the time from an analog clock"
description: A U-Net finds the dial, the hands and 12 o'clock, and projective geometry turns them into hours and minutes. 98.6 % of tilted, rotated clocks read within 5 minutes.
published: 2026-02-21
tags: [segmentation, U-Net, synthetic data, projective geometry, PyTorch]
cover: ../../../assets/projects/clock-reader.jpg
coverAlt: A tilted analog clock, its segmentation masks and the rectified dial with the time read from it
project: clock-reader
---

Reading an analog clock is easy for people and surprisingly hard for a computer. The clock can be
tilted, rotated, half in shadow, with a second hand crossing the others and numerals in any
style. This article shows how to build a reader that handles all of that: it reads 98.6 % of
tilted and rotated test clocks within five minutes, with a median error of six seconds.

## Let the network see, let geometry read

The obvious approach is to train a network that takes a photo and outputs "10:42". It works on
clocks that look like the training data and fails in ways that are hard to explain. A better
split of the work is:

1. a **segmentation network** finds the parts of the clock: the dial, the hour, minute and
   second hands, the pivot in the middle and the 12 o'clock position;
2. **geometry** turns those parts into a time.

The network only has to answer "which pixels belong to the minute hand?", a question with a
clear, checkable answer. The time itself comes from exact mathematics, and every reading can be
traced back to the masks it came from.

## Training data from code

A segmentation network needs a label for every pixel, and nobody wants to paint ten thousand
clock hands by hand. So the clocks are rendered: a procedural generator draws dials in many
styles (Roman and Arabic numerals, ticks, logos, colours), hands of different shapes, and then
everything a real photo adds: perspective tilt, in-plane rotation, background clutter, blur,
glare and JPEG compression. Because the program draws every element, it also knows exactly which
pixel belongs to which part.

The generator is fast enough that there is no dataset at all: sixteen data-loader workers render
about 1,500 clocks per second, and every epoch sees 40,000 new ones.

## The network

The model is a U-Net with a ResNet-34 encoder pretrained on ImageNet, trained with
cross-entropy and Dice loss on seven classes. It takes a 256 × 256 crop of the clock, and if the
clock is part of a larger photo, a YOLO26 detector finds it first. Training takes about 70
minutes on one A100 GPU.

## From masks to hours and minutes

The geometric step has five parts:

1. **Fit the dial.** A circle seen at an angle projects to an ellipse, so an ellipse is fitted to
   the outline of the dial.
2. **Undo the perspective.** The centre of a circle is the pole of the line at infinity. The
   polar of the pivot with respect to the fitted ellipse is therefore the vanishing line of the
   dial plane; mapping it back to infinity, and the ellipse to a circle, gives a frontal view of
   the dial.
3. **Find 12 o'clock.** The segmented 12 o'clock marker fixes the remaining rotation, so rotated
   clocks are read correctly too.
4. **Measure the hands.** Each hand's angle is the mean direction of its pixels, weighted by the
   squared distance from the pivot, so the long tip counts more than the short tail.
5. **Check hours against minutes.** The minutes come from the minute hand. The hour is the one
   whose expected hour-hand angle, (hour + minutes / 60) × 30°, best matches what is observed. A
   clock at 2:58 has its hour hand almost on the 3, and this rule still reads it as 2:58.

## Results

On 2,000 unseen synthetic clocks with tilt, rotation, clutter and glare:

| Method | Read within 5 minutes |
|---|---|
| U-Net (ResNet-34) + geometry | **98.6 %** |
| the same clocks facing the camera | 99.7 % |
| perfect masks + geometry (upper bound) | 100 % |

97.6 % are read within one minute, and the median error is 0.1 minutes. With perfect masks the
geometry reads every clock, so the accuracy of the whole system is the accuracy of the
segmentation.

The augmentations are what make the reader robust: training with in-plane rotation adds 28
percentage points on rotated clocks, and perspective tilt adds 11. A smaller ResNet-18 encoder
reads 97.9 % at 14 instead of 24 million parameters.

## Running it

The model runs in about 40 ms on a laptop CPU and exports to ONNX for deployment:

```bash
clock-read --checkpoint runs/resnet34_unet/best.pt --source photo.jpg
clock-read --checkpoint runs/resnet34_unet/best.pt --source photos/ --detect   # find clocks first
python -m clock_reader.export --checkpoint runs/resnet34_unet/best.pt
```

The same recipe works for other gauges with a needle: pressure gauges, thermometers, meters on
industrial equipment. Change the renderer, keep the geometry. The code is in the
[clock-reader project](/work/clock-reader/).
