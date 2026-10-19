---
title: "Hvem jeg er: en AI-ingeniør som bygger synssystemer som fungerer utenfor laben"
description: Kacper Pawlowski, AI-ingeniør i Lighthouse Consulting og masterstudent ved NTNU i Trondheim. Hva jeg bygger, hvordan jeg jobber og hva jeg ser etter.
published: 2026-10-09
tags: [om meg, AI-ingeniør, datasyn, NTNU, Trondheim]
cover: ../../../assets/portrait.jpg
coverAlt: Portrett av Kacper Pawlowski
---

Jeg heter Kacper Pawlowski og er AI-ingeniør i Lighthouse Consulting og masterstudent ved NTNU i
Trondheim. Jeg bygger systemer for datasyn og 3D-persepsjon: fra første blikk på rådataene,
gjennom modellen, til programvare som kjører på maskinvaren den var ment for.

## Hva jeg gjør på jobb

I Lighthouse Consulting bygger jeg datasynssystemer for prediktivt vedlikehold. Målet er enkelt å
formulere: oppdage slitasje og feil tidlig, slik at kunden kan planlegge reparasjonen i stedet for
å reagere på et havari. I praksis betyr det automatisert visuell inspeksjon på industrielle
linjer, med alt fra klassisk bildebehandling til dyp læring, valgt etter hva problemet trenger.

Ved siden av studiene jobber jeg også som teknisk konsulent i Pango Consulting, der jeg
vedlikeholder og videreutvikler kundesystemer, og som trafikkleder for Boreal Buss og Vy Buss i
Trondheim. Trafikkledelse lærte meg noe ingen emner gjorde: å ta gode beslutninger raskt, med
ufullstendig informasjon, mens busser og passasjerer venter.

## Hva jeg studerer

Jeg tar to mastergrader ved NTNU: datateknologi med spesialisering i kunstig intelligens, og
fysikk og matematikk med industriell matematikk. Den andre er der verktøyene bak 3D-arbeidet mitt
kommer fra: lineær algebra, optimering og estimeringsteori, matematikken bak SLAM, bundle
adjustment og Kalman-filtre. Jeg hadde et utvekslingssemester ved Instituto Superior Técnico i
Lisboa, og før NTNU fullførte jeg videregående ved Orkdal som årets beste elev.

## Hva jeg bygger

Prosjektene mine følger ett mønster: et ekte problem, ekte data, en modell og et resultat som kan
sjekkes mot noe uavhengig. Noen eksempler:

- **Rekkverk fra vegbilder.** En modell som finner rekkverk i Statens vegvesens vegbilder, trent
  med Nasjonal vegdatabank som lærer, og et kart over hvor bildene og registeret er uenige.
- **Avstand i meter fra ett kamera.** En sanntids dybdemodell finjustert på KITTI som måler
  avstand mer nøyaktig enn de store metriske grunnmodellene jeg sammenlignet den med, på 20 ms
  per bilde.
- **LiDAR-kartlegging.** Segmentering av punktskyer som treffer de publiserte resultatene for
  RandLA-Net, og en LiDAR-odometri med sløyfelukking skrevet fra bunnen av, evaluert på hele
  KITTI.
- **Edge-utrulling.** En detektor som er tre ganger mindre i INT8 og beholder 97 % av
  nøyaktigheten, på ONNX Runtime, OpenVINO, Core ML og TensorRT.
- **Droner.** Akkurat nå bygger jeg deteksjon av små objekter fra lufta og et system som avgjør
  hvor en drone trygt kan lande.

Den tunge treningen kjører på en GPU-superdatamaskin; modellene ender som ONNX-filer,
Docker-tjenester eller, i [laben](/lab/), som en detektor som kjører i nettleseren din.

## Hvordan jeg jobber

Jeg måler mot en uavhengig referanse når det finnes en: tallene som forfatterne av en metode har
publisert, en referansebane, et nasjonalt register. Jeg holder arbeidsflyten reproduserbar, fra
nedlasting av data til Slurm-jobben, slik at andre kan gjenskape et resultat. Og jeg bryr meg om
hvor en modell skal kjøre, for en modell som er nøyaktig på en GPU men for treg på målenheten,
løser ingen problemer.

## Språk og kontakt

Jeg snakker engelsk, norsk, polsk, tysk og ukrainsk.

Jobber du med datasyn, 3D-persepsjon eller edge-AI, særlig for veg, infrastruktur eller industri,
hører jeg gjerne fra deg: [contact@kacperpawlowski.tech](mailto:contact@kacperpawlowski.tech),
[LinkedIn](https://www.linkedin.com/in/kacper-pawlowski-914ab8297/) eller
[GitHub](https://github.com/kapi0okapi). Prosjektene mine finner du under [work](/work/).
