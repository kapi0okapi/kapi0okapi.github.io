---
title: "Slik finner du feil når du bare har bilder av gode deler"
description: PatchCore lærer hvordan normalt ser ut fra feilfrie bilder og flagger alt annet, med en terskel satt uten ett eneste feilbilde. 0,914 bilde-AUROC på VisA.
published: 2026-01-31
tags: [avviksdeteksjon, PatchCore, PaDiM, visuell inspeksjon, VisA, PyTorch]
cover: ../../../assets/writing/visa-candle.png
coverAlt: PatchCore-avvikskart på stearinlysbilder fra VisA
project: visual-anomaly-detection
---

På en produksjonslinje er feil sjeldne. Det er bra for fabrikken og vanskelig for maskinlæring: en
klassifikator trenger mange eksempler på hver feiltype, og ingen har dem, særlig ikke for feilen som
ennå ikke har skjedd. Avviksdeteksjon snur problemet. Den lærer bare hvordan en *god* del ser ut, og
flagger alt som ikke passer. Denne artikkelen viser hvordan du bygger en slik inspektør med
PatchCore, og hvordan du setter den opp slik at den kan brukes på en ekte linje.

## Lær det normale, flagg resten

PatchCore trenger ikke annet enn bilder av gode deler:

1. **Beskriv hvert utsnitt.** Et forhåndstrent CNN (Wide-ResNet-50 fra ImageNet) gjør hvert bilde om
   til et rutenett av egenskapsvektorer, én for hvert lite utsnitt, fra mellomlag som beskriver
   lokal tekstur og form framfor hele objekter.
2. **Bygg en minnebank.** Egenskapene fra alle gode treningsbilder samles og reduseres til 1 % med
   grådig coreset-utvalg, som tar vare på variasjonen og gjør søket raskt.
3. **Gi et nytt bilde en score.** Hvert utsnitt i et nytt bilde sammenlignes med nærmeste nabo i
   minnebanken. Et utsnitt langt fra alt normalt er avvikende; avstandene danner et varmekart som
   viser *hvor* feilen er, og den største er scoren for hele bildet.

Det finnes ingen trening i vanlig forstand: å bygge minnebanken for en kategori tar godt under et
minutt på en GPU.

## En terskel uten feilbilder

En score er ennå ikke en beslutning. På en ekte linje finnes det ingen feilbilder å stille inn en
terskel på, så terskelen settes her bare fra gode deler: 99-persentilen av scorene til utelatte
normale bilder. Det holder falske alarmer lave med vilje, og det er tallet en produksjonsleder
faktisk spør om: på testdelene flagges i snitt 2,3 % av de gode.

## Resultater på VisA

VisA er en industriell benchmark med 12 kategorier, fra kretskort og kapsler til stearinlys og
snacks, evaluert med den offisielle ettklasse-inndelingen:

| Metode | Bilde-AUROC | Piksel-AUROC | AUPRO |
|---|---|---|---|
| **PatchCore, denne implementasjonen** | **0,914** | **0,979** | **0,867** |
| PatchCore, publisert | 0,924 | 0,984 | - |
| PaDiM, denne implementasjonen | 0,851 | 0,966 | 0,792 |

Reimplementasjonen ligger innen 0,01 fra publisert PatchCore. En piksel-AUROC på 0,98 betyr at
varmekartene plasserer feilen riktig nesten hver gang, og det er det en operatør trenger for å stole
på et flagg. På de beste kategoriene, som en av kretskorttypene, stearinlys og rørformede snacks, er
bilde-AUROC 0,98 til 0,99.

## Hvor mange gode deler er nok?

Den samme metoden med bare noen få normale bilder per kategori:

| Normale treningsbilder | Bilde-AUROC | Piksel-AUROC |
|---|---|---|
| 1 | 0,664 | 0,863 |
| 4 | 0,736 | 0,907 |
| 16 | 0,847 | 0,955 |
| 64 | 0,875 | 0,970 |
| alle (450 til 905) | 0,914 | 0,979 |

Seksten bilder av gode deler gir allerede en nyttig inspektør, og noen hundre gir hele resultatet.
Det gjør det mulig å starte på et nytt produkt fra første produksjonsdag.

## Bruk på en linje

Et nytt produkt trenger noen titalls bilder av gode deler under linjens belysning, én kjøring for å
bygge minnebanken og en terskel fra et utelatt sett med gode deler. Resultatet for hver del er en
score, godkjent eller ikke, og et varmekart som viser operatøren hvor hun eller han skal se. Koden,
resultatene per kategori og studien med få bilder ligger i
[visual-anomaly-detection-prosjektet](/work/visual-anomaly-detection/).
