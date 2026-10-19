---
title: "Jak wykrywać wady, mając tylko zdjęcia dobrych części"
description: PatchCore uczy się, jak wygląda norma, ze zdjęć bez wad i oznacza wszystko inne, z progiem ustalonym bez ani jednej wady. 0,914 AUROC obrazu na VisA.
published: 2026-01-31
tags: [wykrywanie anomalii, PatchCore, PaDiM, inspekcja wizualna, VisA, PyTorch]
cover: ../../../assets/writing/visa-candle.png
coverAlt: Mapy anomalii PatchCore na zdjęciach świec ze zbioru VisA
project: visual-anomaly-detection
---

Na linii produkcyjnej wady zdarzają się rzadko. To dobrze dla fabryki i trudno dla uczenia
maszynowego: klasyfikator potrzebuje wielu przykładów każdego rodzaju wady, a nikt ich nie ma,
zwłaszcza dla wady, która jeszcze się nie zdarzyła. Wykrywanie anomalii odwraca problem. Uczy się
tylko, jak wygląda *dobra* część, i oznacza wszystko, co nie pasuje. Ten artykuł pokazuje, jak
zbudować taki inspektor z PatchCore i jak go ustawić, żeby działał na prawdziwej linii.

## Naucz się normy, oznacz resztę

PatchCore potrzebuje wyłącznie zdjęć dobrych części:

1. **Opisz każdy fragment.** Wstępnie wytrenowana sieć konwolucyjna (Wide-ResNet-50 z ImageNet)
   zamienia każdy obraz w siatkę wektorów cech, po jednym na mały fragment, z warstw pośrednich,
   które opisują lokalną teksturę i kształt, a nie całe obiekty.
2. **Zbuduj bank pamięci.** Cechy fragmentów wszystkich dobrych zdjęć treningowych są zbierane, a
   potem redukowane do 1 % zachłannym próbkowaniem coreset, które zachowuje różnorodność i
   przyspiesza wyszukiwanie.
3. **Oceń nowe zdjęcie.** Każdy fragment nowego zdjęcia jest porównywany z najbliższym sąsiadem w
   banku pamięci. Fragment daleki od wszystkiego, co normalne, jest anomalią; odległości tworzą mapę
   cieplną, która pokazuje, *gdzie* jest wada, a największa z nich jest wynikiem całego zdjęcia.

Nie ma tu treningu w zwykłym sensie: zbudowanie banku pamięci dla kategorii zajmuje na GPU znacznie
mniej niż minutę.

## Próg bez wad

Wynik to jeszcze nie decyzja. Na prawdziwej linii nie ma zdjęć wad, na których można by ustawić
próg, więc tutaj próg wyznacza się wyłącznie z dobrych części: jako 99. percentyl wyników
wydzielonych zdjęć normalnych. To z założenia utrzymuje fałszywe alarmy na niskim poziomie, a o tę
liczbę pyta kierownik produkcji: na częściach testowych oznaczanych jest średnio 2,3 % dobrych.

## Wyniki na VisA

VisA to przemysłowy benchmark z 12 kategoriami, od płytek drukowanych i kapsułek po świece i
przekąski, oceniany na oficjalnym podziale jednoklasowym:

| Metoda | AUROC obrazu | AUROC pikseli | AUPRO |
|---|---|---|---|
| **PatchCore, ta implementacja** | **0,914** | **0,979** | **0,867** |
| PatchCore, opublikowany | 0,924 | 0,984 | - |
| PaDiM, ta implementacja | 0,851 | 0,966 | 0,792 |

Reimplementacja jest w granicach 0,01 od opublikowanego PatchCore. AUROC pikseli 0,98 oznacza, że
mapy cieplne prawie za każdym razem wskazują wadę we właściwym miejscu, a tego operator potrzebuje,
żeby ufać alarmowi. W najlepszych kategoriach, takich jak jeden z typów płytek drukowanych, świece i
przekąski w kształcie rurek, AUROC obrazu wynosi od 0,98 do 0,99.

## Ile dobrych części wystarczy?

Ta sama metoda z kilkoma zdjęciami normalnymi na kategorię:

| Zdjęcia normalne do treningu | AUROC obrazu | AUROC pikseli |
|---|---|---|
| 1 | 0,664 | 0,863 |
| 4 | 0,736 | 0,907 |
| 16 | 0,847 | 0,955 |
| 64 | 0,875 | 0,970 |
| wszystkie (od 450 do 905) | 0,914 | 0,979 |

Szesnaście zdjęć dobrych części daje już użyteczny inspektor, a kilkaset pełny wynik. Dzięki temu
nowy produkt można zacząć kontrolować od pierwszego dnia produkcji.

## Zastosowanie na linii

Nowy produkt potrzebuje kilkudziesięciu zdjęć dobrych części w oświetleniu linii, jednego
przebiegu do zbudowania banku pamięci i progu z wydzielonego zbioru dobrych części. Dla każdej
części wynikiem jest ocena, decyzja „przechodzi” lub „odrzucona” oraz mapa cieplna, która pokazuje
operatorowi, gdzie patrzeć. Kod, wyniki dla każdej kategorii i badanie z małą liczbą zdjęć są w
[projekcie visual-anomaly-detection](/work/visual-anomaly-detection/).
