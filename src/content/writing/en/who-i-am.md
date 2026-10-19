---
title: "Who I am: an AI engineer building vision systems that work outside the lab"
description: Kacper Pawlowski, AI engineer at Lighthouse Consulting and MSc student at NTNU in Trondheim. What I build, how I work and what I am looking for.
published: 2026-10-09
tags: [about, AI engineer, computer vision, NTNU, Trondheim]
cover: ../../../assets/portrait.jpg
coverAlt: Portrait of Kacper Pawlowski
---

I'm Kacper Pawlowski, an AI engineer at Lighthouse Consulting and an MSc student at NTNU in
Trondheim. I build computer vision and 3D perception systems: from the first look at the raw
data, through the model, to software that runs on the hardware it was meant for.

## What I do at work

At Lighthouse Consulting I build computer vision systems for predictive maintenance. The goal is
simple to state: catch wear and faults early, so a client can plan the repair instead of
reacting to a breakdown. In practice that means automated visual inspection on industrial lines,
with everything from classical image processing to deep learning, chosen by what the problem
needs rather than by what is fashionable.

Alongside my studies I also work as a tech consultant at Pango Consulting, maintaining and
extending client systems, and as a traffic manager for Boreal Buss and Vy Buss in Trondheim. Traffic control taught me something no course did: making good decisions quickly,
with incomplete information, when buses and passengers are waiting.

## What I study

I take two master's degrees at NTNU: Computer Science with a specialisation in artificial
intelligence, and Physics and Mathematics with Industrial Mathematics. The second one is where
the tools behind my 3D work come from: linear algebra, optimisation and estimation theory, the
mathematics of SLAM, bundle adjustment and Kalman filters. I spent an exchange semester at
Instituto Superior Técnico in Lisbon, and before NTNU I finished upper secondary school at Orkdal
as the top student of my year.

## What I build

My projects follow one pattern: a real problem, real data, a model, and a result that can be
checked against something independent. A few examples:

- **Guard rails from road photos.** A model that finds guard rails in Statens vegvesen's road
  photos, trained with Norway's road register as the teacher, and a map of where the photos and
  the register disagree.
- **Distance in metres from one camera.** A real-time depth model fine-tuned on KITTI that
  measures distance more accurately than the large metric foundation models I compared it with,
  at 20 ms per image.
- **LiDAR mapping.** Point-cloud segmentation that matches the published RandLA-Net results and
  a LiDAR odometry with loop closure written from scratch, evaluated on all of KITTI.
- **Edge deployment.** A detector three times smaller in INT8 at 97 % of its float accuracy, on
  ONNX Runtime, OpenVINO, Core ML and TensorRT.
- **Drones.** I am currently building small-object detection from the air and a system that
  decides where a drone can land safely.

The heavy training runs on a GPU supercomputer; the models end up as ONNX files, Docker services
or, in the [lab](/lab/), as a detector running in your browser.

## How I work

I measure against an independent reference whenever one exists: the numbers published by the
authors of a method, a ground-truth trajectory, a national register. I keep pipelines
reproducible, from the dataset download to the Slurm job, so a result can be rebuilt by someone
else. And I care about where a model has to run, because a model that is accurate on a GPU and
too slow on the target device does not solve anyone's problem.

## Languages and contact

I speak English, Norwegian, Polish, German and Ukrainian.

If you work on computer vision, 3D perception or edge AI, especially for roads, infrastructure
or industry, I would be glad to hear from you: [contact@kacperpawlowski.tech](mailto:contact@kacperpawlowski.tech),
[LinkedIn](https://www.linkedin.com/in/kacper-pawlowski-914ab8297/) or
[GitHub](https://github.com/kapi0okapi). My projects are collected under [work](/work/).
