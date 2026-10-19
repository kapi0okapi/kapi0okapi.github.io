---
title: "Slik kartlegger du en veg med LiDAR og måler rekkverkene"
description: LiDAR-odometri med sløyfelukking, RandLA-Net for hva hvert punkt er, og en høydeprofil meter for meter for hvert rekkverk. Sjekket på KITTI og Toronto-3D.
published: 2026-01-10
tags: [LiDAR, SLAM, punktskyer, RandLA-Net, KITTI, Toronto-3D]
cover: ../../../assets/projects/lidar-road-segmentation.png
coverAlt: En segmentert punktsky av en vegkorridor og høydeprofilen til et rekkverk
project: lidar-road-segmentation
---

En kartleggingsbil med LiDAR på taket samler millioner av punkter i minuttet. For å gjøre dem om
til noe en vegeier kan bruke, trengs tre steg: legge hver skanning på riktig sted, avgjøre hva hvert
punkt er, og måle objektene som betyr noe. Denne artikkelen viser alle tre, hvert bygget fra bunnen
av og sjekket mot publiserte resultater.

## Steg 1: hvor var bilen? LiDAR-odometri

Hver skanning registreres mot et lokalt kart av skanningene før den, og det gir bilens bevegelse
fra én skanning til den neste. Arbeidsflyten følger KISS-ICP:

1. **Forutsi** den nye posisjonen med en modell for konstant fart: en bil endrer ikke farten mye på
   en tidel av et sekund.
2. **Tynn ut** skanningen på et voksel-rutenett, slik at tette punkter nær bilen ikke veier tyngre
   enn punkter langt unna.
3. **Tilpass** den til et lokalt vokselkart med punkt-til-punkt-ICP og en robust kjerne.
4. **Juster** terskelen for samsvar etter hvor mye ICP nylig måtte korrigere prediksjonen, slik at
   metoden fungerer både i byen og på motorvegen med de samme innstillingene.

Velodyne-sensoren i KITTI har vertikale strålevinkler som er rundt 0,2 grader feil, nok til å bøye
flat mark til en grunn kjegle. Når de korrigeres, halveres avdriften over hele datasettet.

## Steg 2: sløyfelukking

Odometri driver sakte av. Når bilen kommer tilbake til et sted den har sett, kan avdriften fjernes:

- **Scan Context** beskriver hvert sted som et kompakt bilde av skanningen i ringer og sektorer, så
  gjenbesøk kan finnes raskt blant tusenvis av tidligere skanninger;
- **ICP-verifisering** sjekker hver kandidat: minst 70 % av punktene må passe innen en halv meter;
- en **posisjonsgraf** med alle odometristeg og sløyfer løses med glissen minste kvadraters metode,
  og en kji-kvadrat-test fjerner sløyfer som ikke stemmer med resten.

På alle elleve KITTI-sekvensene med fasit (22 km) driver odometrien 0,63 % av kjørt avstand, nær
forfatternes egen pakke (0,56 %). Sløyfelukkingen reduserer så den absolutte feilen på sekvens 00
fra 2,3 m til 1,0 m, og på sekvens 05 fra 1,3 m til 0,4 m.

## Steg 3: hva er hvert punkt? RandLA-Net

Med kartet på plass trenger hvert punkt en klasse: vegbane, vegoppmerking, vegetasjon, bygning,
stolpe, bil, gjerde. RandLA-Net er laget for akkurat denne skalaen. Den trekker punkter tilfeldig i
stedet for med kostbar farthest-point-sampling og veier opp for det med lokal aggregering av
egenskaper og oppmerksomhetsbasert pooling, og den behandler rundt 70 000 punkter i sekundet på én
GPU.

Reimplementasjonen er ren PyTorch uten egen CUDA-kode: alle indekser for naboer og pooling bygges
med k-d-trær i datalasteren, og GPU-en kjører bare tette tensoroperasjoner. En hel flis predikeres
ved å dekke den med overlappende nabolag og ta snittet av stemmene for hvert punkt; resultatet
skrives som en LAZ-fil som kan åpnes i CloudCompare eller QGIS.

På Toronto-3D, et kartleggingsdatasett fra en bygate, når den **81,8 mIoU**, det samme som det
publiserte resultatet for RandLA-Net (81,8), med 96,8 IoU på vegbanen og 94,3 på biler.

## Steg 4: måling av rekkverkene

Punktene som er merket som barrierer deles i enkeltobjekter, hvert objekt kuttes i stasjoner på én
meter langs hovedretningen, og hver stasjon får rekkverkshøyden over et vegplan tilpasset med minste
kvadraters metode, som følger stigning og tverrfall. Resultatet er en høydeprofil per rekkverk, i
meter, der hver stasjon utenfor tillatt område flagges for en inspektør. På en syntetisk
testkorridor med et rekkverk på 0,75 m er målt median 0,73 m.

## Alt sammen

Odometri og sløyfelukking gir et konsistent kart, segmentering forteller hva som er i det, og enkel
geometri gjør etikettene om til målinger en vegeier kan handle på. Koden ligger i to prosjekter:
[LiDAR SLAM](/work/lidar-slam/) og [LiDAR-segmentering av vegkorridorer](/work/lidar-road-segmentation/).
