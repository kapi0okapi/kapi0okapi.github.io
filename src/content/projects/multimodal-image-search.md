---
title: Multimodal image search
summary: Search photos by sentence or by photo and get answers that cite the photos - 89.7 % Recall@1 on Flickr30k, above every single published model it is compared with.
description: Text and photo search with fused SigLIP 2 and Perception Encoder embeddings, FAISS, Qwen3-VL reranking and multimodal RAG, measured on Flickr30k, COCO and MRAG-Bench.
area: Computer vision
order: 16
repo: https://github.com/kapi0okapi/multimodal-image-search
tags: [multimodal retrieval, RAG, SigLIP 2, Perception Encoder, Qwen3-VL, FAISS]
cover: ../../assets/projects/multimodal-image-search.jpg
coverAlt: The search app showing red double-decker buses for the query a red double-decker bus in the rain
video: /media/projects/multimodal-image-search.mp4
metrics:
  - { value: "89.7", label: "Recall@1, Flickr30k text→image" }
  - { value: "60.4 → 65.1", label: "COCO Recall@1, with VLM reranking" }
  - { value: "55.9 → 61.9 %", label: "MRAG-Bench accuracy, with retrieval" }
---

Search a photo collection with a sentence or with another photo, and ask questions that are
answered from the photos themselves. Two dual encoders, Google's SigLIP 2 and Meta's Perception
Encoder, are fused into one embedding space behind a FAISS index, and the Qwen3-VL
vision-language model reranks the best candidates and writes answers that cite the photos they
come from.

## Results

Recall@1 on the Flickr30k and COCO 5K test sets, zero-shot: how often the right photo comes
first for a caption (text→image) and the right caption for a photo (image→text).

| Model | Flickr30k text→image | Flickr30k image→text | COCO text→image | COCO image→text |
|---|---|---|---|---|
| SigLIP 2 g-opt, published | 86.0 | 95.4 | 56.1 | 72.8 |
| Perception Encoder G, published | 85.7 | 96.2 | 58.1 | 75.4 |
| InternVL-C, 5.5B, published | 85.0 | 95.7 | 58.6 | 74.9 |
| Fusion: SigLIP 2 + Perception Encoder | 87.1 | **97.7** | 60.4 | 77.4 |
| **Fusion, reranked by Qwen3-VL-8B** | **89.7** | 96.8 | **65.1** | **79.2** |

- **Two encoder families, one index.** Each image is stored as its two normalised embeddings
  side by side, scaled so that one inner product is the mean of the two cosine similarities.
  The models make different mistakes, and the fusion of two mid-sized ones beats the largest
  single models.
- **A reranker that needs no tuning.** Qwen3-VL reads each of the top 12 photos with the query
  and scores how sure it is that they match. On its own it ranks about as well as the embeddings,
  but the sum of both scores is 4.7 points better on COCO.
- **At collection scale.** Over all 123k COCO 2017 photos, HNSW over 8-bit vectors finds 98.2 %
  of the exact top 10 in 0.64 ms on one CPU core, with 2.4 kB per photo: 3.7 times less memory
  than the same graph over full vectors, at the same accuracy.
- **Retrieval that helps the answers.** On MRAG-Bench, five reference photos found with SigLIP 2
  raise Qwen3-VL-8B's accuracy from 55.9 % to 61.9 %, more than half of what the ground-truth
  photos give. A CLIP retriever on the same photos reaches 57.7 %.
