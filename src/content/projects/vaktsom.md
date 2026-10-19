---
title: Drowning detection
summary: Cameras over the pool follow every bather in 3D through the water surface and alert lifeguards - all 200 simulated ISO 20380 tests passed, with no false alarms in 48 hours of bathing.
description: Drowning detection for public pools with RF-DETR, multi-camera 3D tracking through the water surface, ISO 20380 rules and lifeguard alarms on watches and panels.
area: Computer vision
order: 17
repo: https://github.com/kapi0okapi/vaktsom
tags: [drowning detection, RF-DETR, multi-camera tracking, 3D fusion, Blender, FastAPI]
cover: ../../assets/projects/vaktsom.jpg
coverAlt: The Vaktsom dashboard with a bottom alarm in the sports pool, next to a lifeguard post panel and a watch that acknowledged it
video: /media/projects/vaktsom.mp4
metrics:
  - { value: "200/200", label: "ISO 20380 detection tests, simulated" }
  - { value: "0", label: "false alarms in 4 × 12 h of bathing" }
  - { value: "7.9-9.1 s", label: "bottom to alarm, rendered video" }
---

Vaktsom is a drowning detection and lifeguard alerting system for public swimming pools. Cameras
above the water follow every bather in pool coordinates, and the system raises an alarm when a person lies still on the
bottom, when a person who went under is no longer seen, and when a person at the surface shows the
signs of drowning before going under. Alarms reach the lifeguards on their watches, on wired post
panels and on network sirens, with the basin and the position in words.

## Results

All results come from simulation and rendered video. Eight Blender videos from two calibrated
ceiling cameras run through the full chain: the trained detector, tracking, rules and alarms.

| Detector | Videos passed | Bottom to alarm | Warned before going under | Position error |
|---|---|---|---|---|
| **RF-DETR-L, 704 px** | **8/8** | 7.9-9.1 s | 4/4 active drownings | ≤ 0.08 m |
| RF-DETR-M | 8/8 | 7.9-9.1 s | 4/4 active drownings | ≤ 0.13 m |

In simulation of the NS-EN ISO 20380 tests, a manikin on the bottom at 50 positions in each of four
basins, from a 0.3 m children's pool to a 5 m diving pit, raised the alarm within the standard's
tolerance in all 200 trials, with a median position error of 2 to 4 cm. Twelve hours of busy
bathing per basin gave no false alarm, and all 160 simulated drownings raised the alarm.

- **3D through the water surface.** Rays from calibrated cameras refract at the surface, so a body
  on the bottom of a 5 m pit is placed where it is, and two or more views give its depth, which
  tells a body on the bottom from a swimmer above it.
- **Trained for the view from the ceiling.** About 4,800 Blender renders of pool halls from ceiling
  cameras, labelled through the same water, lift the detection of fully submerged bodies from 52 %
  to 93 %, evenly at every depth down to 6 m.
- **Tracking that holds on to a body.** Views join a person only at depths that person can be at,
  and the still time on the bottom belongs to the spot, so an identity swap over a body never
  restarts the alarm clock.
- **Built to run a pool.** Two alarm paths per basin with one of them wired, escalation, live
  coverage maps, wave-machine and movable-floor modes, roles and device tokens, encrypted alarm
  clips that are deleted beyond recovery, and a monthly report against the standard's limits.
