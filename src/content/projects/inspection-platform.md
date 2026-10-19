---
title: Road inspection platform
summary: NVDB guard rails, Vegbilder photos and model results in PostGIS - compared in SQL, served as vector tiles, deployed with Terraform on AWS.
description: A FastAPI and PostGIS platform that compares computer-vision results with Norway's road register (NVDB) - vector tiles, MapLibre, Docker, Terraform, CI/CD.
area: Road infrastructure
order: 1
featured: true
repo: https://github.com/kapi0okapi/inspection-platform
tags: [PostGIS, FastAPI, NVDB, MapLibre, Terraform, AWS, Docker]
cover: ../../assets/projects/inspection-platform.jpg
coverAlt: Map of the E6 south of Trondheim with registered guard rails, road photos and stretches where a model disagrees with the register
metrics:
  - { value: "91 %", label: "precision vs. NVDB" }
  - { value: "89 %", label: "recall vs. NVDB" }
  - { value: "31 %", label: "recall on concrete barriers" }
---

The serving layer for my road-inspection projects. Norway's road register (NVDB: road network
and guard rails), the positions of Statens vegvesen's road photos (Vegbilder) and the output of
vision models live in one PostGIS database. A FastAPI service takes uploads from inference
jobs, compares them with the register in SQL, and serves GeoJSON and vector tiles to a
TypeScript/MapLibre map.

## What the database does

- **Linear referencing.** Every photo and detection is snapped to the nearest NVDB road link on
  insert, with its offset along the link - one `COPY` into a temporary table and one
  `INSERT … SELECT` with a k-nearest-neighbour lateral join on the GiST index.
- **What should each photo show?** A SQL function builds the area a forward-looking camera sees
  on each side of the road from the photo's position and heading. A materialised view measures
  how many metres of registered guard rail fall inside it.
- **Where do model and register disagree?** Window functions group consecutive disagreeing
  photos into stretches (a gaps-and-islands query) that the map draws as lines.
- **Vector tiles straight from PostGIS** (`ST_AsMVT`) with minimum zoom levels per layer.

## Result: a model checked against the register

A YOLO26 segmentation model I fine-tuned with a guard-rail class ran on 1193 photos of the E6
near Trondheim. Against NVDB it finds 89 % of the registered rails at 91 % precision. Splitting
the recall by the register's own rail type shows where it fails:

| Registered rail type | Seen by the model |
|---|---|
| Steel tube, round posts | 95 % |
| Bridge railing | 92 % |
| Concrete, New Jersey profile | 31 % |

The model learned the class from German roads in KITTI, where concrete barriers are rare;
steel rails and bridge railings are found nine times out of ten.

## Deployment

Docker Compose for local work; Terraform for AWS: ECS Fargate (ARM64) behind an ALB, RDS
PostgreSQL 17 with its password managed in Secrets Manager, S3 + CloudFront for the front end
with `/api/*` routed to the load balancer. GitHub Actions run ruff, pytest against a PostGIS
service container, the front-end tests, `terraform validate` and image builds; a tag deploys
through OIDC with no AWS keys in the repository.
