---
title: "Slik måler du avstand i meter med ett kamera"
description: "Finjuster en sanntids dybdemodell på KITTI slik at den gir dybde i meter fra ett bilde: AbsRel 0,075 uten skalering, foran store grunnmodeller, på 20 ms per bilde."
published: 2026-08-08
tags: [monokulær dybde, YOLO26, KITTI, metrisk dybde, finjustering]
cover: ../../../assets/projects/monocular-depth.jpg
coverAlt: Et vegbilde og dybdekartet, delt langs en diagonal
project: monocular-depth
---

Hvor langt unna er det rekkverket? Et stereokamera eller en LiDAR kan måle det direkte, men de
fleste kjøretøy, droner og telefoner har ett vanlig kamera. Monokulære dybdemodeller anslår
avstand fra ett enkelt bilde, og de nyeste er gode nok til å måle med. Denne artikkelen viser
hvordan du gjør en liten sanntidsmodell om til en som gir dybde i meter, og hvordan du sjekker at
den gjør det.

## Relativ eller metrisk dybde?

De fleste dybdemodeller anslår *relativ* dybde: formen på scenen er riktig, men skalaen er ukjent.
For å score dem skaleres prediksjonen til å passe fasiten på hvert bilde, noe som fungerer i en
benchmark og er ubrukelig i en bil, der det ikke finnes noen fasit å skalere med. *Metriske*
modeller gir meter direkte. Det er det en måling trenger, og slik scores de her: som de er, uten
skalering per bilde.

## Først en benchmark

Før du trener noe, lønner det seg å vite hva de eksisterende modellene gjør på dataene du skal
bruke. På KITTI Eigen-testsettet (652 gatebilder med LiDAR-fasit) ble elleve modeller evaluert,
hver slik forfatterne selv evaluerer den:

| Modell | Utgang | AbsRel ↓ | Tid per bilde |
|---|---|---|---|
| Depth Anything V2-Large | relativ, tilpasset per bilde | 0,070 | 1,35 s |
| YOLO26x-depth | relativ, tilpasset per bilde | 0,075 | 0,08 s |
| Depth Anything 3 Metric-Large | meter | 0,099 | 0,13 s |
| Depth Pro, sann brennvidde | meter | 0,118 | 5,15 s |

De beste relative modellene er svært nøyaktige, men skalaen må komme fra et sted. De metriske
grunnmodellene gir meter direkte, med en feil på 10-12 %.

## Fra liten modell til metrisk modell

YOLO26s-depth er den lille sanntidsmodellen i den nyeste YOLO-familien. Finjustert på KITTIs
treningskjøringer i ti epoker lærer den skalaen i scenen fra dataene. Tre detaljer gjør resultatet
til å stole på:

- **Samme input under trening og bruk.** Modellen trenes på bilder som skaleres nøyaktig slik de
  skaleres ved inferens, så den ser aldri en input den ikke er trent på.
- **Et rent valideringssett.** Hver tolvte treningskjøring holdes utenfor. Den brukes til å velge
  beste sjekkpunkt og til å tilpasse den ene skalafaktoren som gjør utgangen om til meter, så
  testbildene brukes bare til sluttresultatet.
- **Den offisielle protokollen.** Testen bruker standard Garg-utsnitt og et område på 80 meter,
  så tallene kan sammenlignes direkte med publiserte resultater.

## Resultatet

| Modell | Utgang | AbsRel ↓ | δ1 ↑ | Tid per bilde |
|---|---|---|---|---|
| **YOLO26s-depth, finjustert** | **meter** | **0,075** | **0,932** | **0,02 s** |
| Depth Anything 3 Metric-Large | meter | 0,099 | 0,918 | 0,13 s |
| Depth Pro, sann brennvidde | meter | 0,118 | 0,848 | 5,15 s |

Den finjusterte modellen er den mest nøyaktige metriske modellen i sammenligningen:
gjennomsnittsfeilen er 7,5 % av avstanden, uten noen form for skalering. Målt bare på formen er
den like god som Depth Anything V2-Large (AbsRel 0,070), og den kjører nesten sytti ganger
raskere.

Fordelt på hva pikselen viser, er den best av alle på vegbanen (4 % feil) og på biler (7 %). Tynne
objekter som stolper og skilt er fortsatt vanskeligere for alle modeller, og det er verdt å vite
før du måler dem med ett kamera.

## Hva det kan brukes til

En metrisk dybdemodell gjør et kalibrert kamera om til en enkel avstandsmåler: avstand til bilen
foran, til en fotgjenger, til et rekkverk eller til bakken under en drone. Finjustering på kameraet
og den typen scener det skal se, er det som gjør meterne pålitelige, og et utelatt sett fra samme
miljø er hvordan du vet at de er det. Koden og alle evalueringene ligger i
[monocular-depth-prosjektet](/work/monocular-depth/).
