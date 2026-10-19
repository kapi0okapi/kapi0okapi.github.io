---
title: "How to find guard rails in road photos with Norway's road register as the teacher"
description: Train a guard-rail detector without hand labels, using NVDB geometry and Statens vegvesen's road photos, then map where photos and register disagree. AP 0.98.
published: 2026-04-25
tags: [weak supervision, NVDB, Vegbilder, GeoPandas, EfficientNet, road inspection]
cover: ../../../assets/projects/guardrail-inspector.jpg
coverAlt: A road photo from Trondheim with the guard rails the model found, next to the NVDB map
project: guardrail-inspector
---

Norway keeps a detailed register of its roads, NVDB, and it records where every guard rail
stands. Statens vegvesen also photographs most national and county roads every year, one
forward-looking photo about every 20 metres. Put the two together and you can teach a model to
see guard rails without labelling a single photo by hand, and then use the model to check the
register. This article shows how.

## Step 1: the data

Both sources are open:

- **NVDB API v4** gives the guard rails as polylines, together with their end terminals and the
  inspection records that say whether a rail needs action.
- **The Vegbilder WFS** gives every road photo with its position, heading and a link to the
  image.

Everything is kept in EPSG:25833, the projection both services publish, so distances are plain
metres. For Trondheim, 2023 and 2024, that is about 30,000 photos.

## Step 2: labels from geometry

For every photo, each nearby guard rail is cut into one-metre points and moved into the camera's
frame using the photo's position and heading. A rail counts as *visible on the left* when at least
five metres of it lie between 4 and 25 metres ahead and to the left; the same for the right side
and for an end terminal coming up. Borderline cases, a rail that just starts at 24 metres, get the
label "unknown" and are left out of the loss.

These labels are *weak*: they come from a register, not from a person looking at the photo. But
they are free, consistent and available for every photo in the country.

## Step 3: the model

A pretrained CNN with five sigmoid outputs (rail left, rail right, end terminal left and right,
needs action) is trained with a masked, class-weighted binary cross-entropy. Two details matter:

- **A flip is not just a flip.** Mirroring a road photo moves the left rail to the right, so the
  augmentation swaps the left and right labels too.
- **Split by place, not by photo.** Neighbouring photos show the same rail, so train, validation
  and test are split by one-kilometre grid cells. The test score is measured on roads the model
  has never seen.

Four backbones were compared; EfficientNet-B3 had the best validation score and is the one that
is deployed. On the held-out test cells it reaches:

| Label | Average precision |
|---|---|
| guard rail on the left | **0.980** |
| guard rail on the right | 0.939 |
| end terminal ahead, left / right | 0.567 / 0.518 |

The rails themselves are found almost perfectly; end terminals are short objects that appear in
only a few photos, and they are the next thing to improve with more data.

## Step 4: where photos and register disagree

With a probability for every photo, the photos of each drive are ordered by road metre. Three or
more consecutive photos where the model and the register disagree become a *deviation stretch*:
either a rail that is visible but not registered, or a registered rail that the photos do not
show. In Trondheim this gives 24 stretches, each a short list of photos that an inspector can
open and judge in seconds, instead of driving the whole network.

The stretches are written to GeoJSON and shown in a TypeScript and MapLibre viewer on top of
Kartverket's topographic map, together with the registered rails, the inspection flags and the
photos coloured by the model.

## Using it elsewhere

Nothing in the pipeline is specific to Trondheim or to guard rails. Any object that NVDB
registers with a geometry, from road signs to lighting poles, can become weak labels for road
photos in the same way. The code is in the [guardrail-inspector project](/work/guardrail-inspector/),
and the register comparison grew into the [road inspection platform](/work/inspection-platform/).
