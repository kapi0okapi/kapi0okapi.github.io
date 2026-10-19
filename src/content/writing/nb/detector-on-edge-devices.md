---
title: "Slik kjører du en objektdetektor på en edge-enhet: YOLO26 i INT8 med 97 % av nøyaktigheten"
description: Eksporter YOLO26 til ONNX Runtime, OpenVINO, Core ML og TensorRT, kvantiser til INT8 på riktig måte og velg kjøremiljøet som passer maskinvaren. Målt på hele COCO.
published: 2026-06-27
tags: [edge-AI, kvantisering, INT8, ONNX Runtime, OpenVINO, Core ML, YOLO26]
cover: ../../../assets/writing/int8-pareto.png
coverAlt: COCO-nøyaktighet mot latens for YOLO26n-varianter på en Apple M4 Pro
project: edge-optimization
---

En detektor som kjører i 200 bilder i sekundet på en GPU i et datasenter, er til liten nytte hvis
kameraet sitter på en drone, en produksjonslinje eller en telefon. På slike enheter teller tre
ting: størrelsen på modellen, minnet den trenger og tiden per bilde, og de teller mer enn den
siste tidelen av et poeng i nøyaktighet. Denne artikkelen viser hvordan du tar YOLO26n, den
minste modellen i den nyeste YOLO-generasjonen, ut på edge-maskinvare, og hvordan du måler at
ingenting viktig går tapt på veien.

## Én modell, mange kjøremiljøer

Hver type maskinvare har et kjøremiljø som får mest ut av den:

| Maskinvare | Kjøremiljø | Format |
|---|---|---|
| alle CPU-er, også i nettleseren | ONNX Runtime | ONNX |
| Intel-CPU-er og -GPU-er | OpenVINO | OpenVINO IR |
| iPhone, iPad, Mac (Neural Engine) | Core ML | ML-pakke |
| NVIDIA-GPU-er og Jetson | TensorRT | engine |

YOLO26 gjør eksporten enkel fordi hodet er *ende-til-ende*: nettverket gir selv ut høyst 300
ferdige bokser, så det finnes ikke noe eget NMS-steg som må lages på nytt på hver enhet. Den
eksporterte fila er hele detektoren.

## INT8: en tredjedel av størrelsen

Når vekter og aktiveringer kvantiseres fra 32-bits flyttall til 8-bits heltall, blir modellen tre
ganger mindre og, på maskinvare med raske heltallsenheter, raskere. Statisk kvantisering trenger
noen hundre kalibreringsbilder for å velge verdiområdet til hver tensor; her kommer de fra
COCO-treningssettet, aldri fra valideringssettet modellen måles på.

To regler avgjør hvor mye nøyaktighet som overlever:

1. **La dekodingen i hodet bli i float.** Hodet i YOLO26 slår til slutt sammen boksekoordinater i
   piksler (0 til 640) og klassesannsynligheter (0 til 1) i én tensor. Én INT8-skala kan ikke
   romme begge områdene, så disse få og billige nodene blir værende i 32-bits flyttall.
2. **Mål hvilke lag som er følsomme.** Når hver blokk holdes i float etter tur, med resten i INT8,
   ser du hvor presisjonen betyr noe. Én gruppe skiller seg ut: klassegrenen i hodet er verdt
   2,1 mAP, mer enn noen blokk i ryggraden. Å holde den i float koster nesten ingenting i
   størrelse.

Persentilkalibrering, som ser bort fra de sjeldne ekstreme aktiveringene, gir mer enn ett poeng
ekstra sammenlignet med enkle min-maks-områder.

## Resultatet

På alle 5 000 bildene i COCO val2017 med den offisielle metrikken:

| Modell | Størrelse | mAP50-95 |
|---|---|---|
| ONNX FP32 | 9,9 MB | 40,3 |
| Core ML FP16 | 5,1 MB | 40,2 |
| OpenVINO INT8 | 3,4 MB | 39,3 |
| **ONNX INT8, klassegren i float, persentil** | **3,4 MB** | **39,1** |
| ONNX INT8, standard Ultralytics-eksport | 3,0 MB | 34,1 |

INT8-modellen beholder 97 % av float-nøyaktigheten med en tredjedel av størrelsen, og ligger fem
poeng foran standardeksporten.

## Velg kjøremiljø etter enheten

Hastigheten avhenger mer av maskinvaren enn av formatet. På en Apple M4 Pro:

- **Neural Engine** kjører Core ML FP16-modellen på **7,5 ms**, klart det raskeste alternativet;
- på **CPU-en** ligger FP32 og INT8 tett med flere tråder (rundt 10 ms), så der er INT8 først og
  fremst en gevinst i størrelse;
- på en **x86-CPU** kjører OpenVINOs INT8-modell 1,7 til 2,2 ganger raskere enn FP32 (5,9 ms for
  YOLO26n med åtte tråder);
- på en **GPU** i et datasenter med TensorRT tar FP16 allerede rundt 2 ms, og INT8 sparer bare en
  tidel av et millisekund med batch 1.

Nøye kvantisering etter trening står seg også mot kvantiseringsbevisst trening: ti epoker med QAT
på hele COCO når 38,3 mAP, under de 39,1 som den kalibrerte INT8-modellen får.

Oppskriften er altså: eksporter én gang, kvantiser nøye og mål så på enheten du faktisk skal
bruke, for det raskeste valget på én brikke er sjelden det raskeste på den neste.

## Prøv selv

INT8-modellen fra denne artikkelen kjører i nettleseren din i [laben](/lab/): 3,4 MB,
WebAssembly, ingen server. Koden, sensitivitetsanalysen og alle tabellene ligger i
[edge-optimization-prosjektet](/work/edge-optimization/).
