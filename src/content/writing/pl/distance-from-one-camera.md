---
title: "Jak zmierzyć odległość w metrach jedną kamerą"
description: "Dotrenuj model głębi czasu rzeczywistego na KITTI, żeby z jednego zdjęcia dawał metry: AbsRel 0,075 bez skalowania, lepiej niż duże modele, w 20 ms na zdjęcie."
published: 2026-08-08
tags: [głębia monokularna, YOLO26, KITTI, głębia metryczna, dotrenowanie]
cover: ../../../assets/projects/monocular-depth.jpg
coverAlt: Zdjęcie drogi i jego mapa głębi, podzielone po przekątnej
project: monocular-depth
---

Jak daleko jest ta bariera? Kamera stereo albo LiDAR zmierzą to bezpośrednio, ale większość
pojazdów, dronów i telefonów ma jedną zwykłą kamerę. Monokularne modele głębi szacują odległość z
pojedynczego zdjęcia, a najnowsze są na tyle dobre, że można nimi mierzyć. Ten artykuł pokazuje,
jak zamienić mały model czasu rzeczywistego w taki, który podaje głębię w metrach, i jak sprawdzić,
że naprawdę to robi.

## Głębia względna czy metryczna?

Większość modeli głębi przewiduje głębię *względną*: kształt sceny się zgadza, ale skala jest
nieznana. Żeby je ocenić, predykcję skaluje się na każdym zdjęciu do danych referencyjnych. Na
benchmarku to wystarcza, ale w samochodzie jest bezużyteczne, bo nie ma tam danych referencyjnych,
do których można by skalować. Modele *metryczne* podają metry bezpośrednio. Tego potrzebuje pomiar
i tak są tu oceniane: bez żadnego skalowania na zdjęcie.

## Najpierw benchmark

Zanim zaczniesz cokolwiek trenować, warto wiedzieć, jak istniejące modele radzą sobie z Twoimi
danymi. Na zbiorze testowym KITTI Eigen (652 klatki uliczne z głębią z LiDAR-u) oceniłem jedenaście
modeli, każdy tak, jak oceniają go jego autorzy:

| Model | Wyjście | AbsRel ↓ | Czas na zdjęcie |
|---|---|---|---|
| Depth Anything V2-Large | względne, dopasowane na zdjęcie | 0,070 | 1,35 s |
| YOLO26x-depth | względne, dopasowane na zdjęcie | 0,075 | 0,08 s |
| Depth Anything 3 Metric-Large | metry | 0,099 | 0,13 s |
| Depth Pro, prawdziwa ogniskowa | metry | 0,118 | 5,15 s |

Najlepsze modele względne są bardzo dokładne, ale skalę trzeba skądś wziąć. Metryczne modele
fundamentalne podają metry bezpośrednio, z błędem 10-12 %.

## Mały model, który mierzy w metrach

YOLO26s-depth to mały model czasu rzeczywistego z najnowszej rodziny YOLO. Dotrenowany przez
dziesięć epok na przejazdach treningowych KITTI uczy się skali sceny z danych. Trzy szczegóły
sprawiają, że wynikowi można ufać:

- **To samo wejście w treningu i w użyciu.** Model uczy się na klatkach skalowanych dokładnie tak
  jak przy inferencji, więc nigdy nie widzi wejścia, na którym nie był trenowany.
- **Czysty zbiór walidacyjny.** Co dwunasty przejazd treningowy jest wydzielony. Służy do wyboru
  najlepszego checkpointu i do dopasowania jednego współczynnika skali, który zamienia wyjście na
  metry, więc klatki testowe są używane tylko do końcowego wyniku.
- **Oficjalny protokół.** Test używa standardowego wycięcia Garga i zakresu 80 metrów, więc liczby
  można bezpośrednio porównać z opublikowanymi.

## Wynik

| Model | Wyjście | AbsRel ↓ | δ1 ↑ | Czas na zdjęcie |
|---|---|---|---|---|
| **YOLO26s-depth, dotrenowany** | **metry** | **0,075** | **0,932** | **0,02 s** |
| Depth Anything 3 Metric-Large | metry | 0,099 | 0,918 | 0,13 s |
| Depth Pro, prawdziwa ogniskowa | metry | 0,118 | 0,848 | 5,15 s |

Dotrenowany model jest najdokładniejszym modelem metrycznym w porównaniu: średni błąd to 7,5 %
odległości, bez żadnego skalowania. Oceniany tylko pod względem kształtu dorównuje Depth Anything
V2-Large (AbsRel 0,070), działając prawie siedemdziesiąt razy szybciej.

W podziale na to, co pokazuje piksel, jest najlepszy ze wszystkich na nawierzchni drogi (4 % błędu)
i na samochodach (7 %). Cienkie obiekty, takie jak słupy i znaki, pozostają trudniejsze dla każdego
modelu, i warto o tym pamiętać, zanim zacznie się je mierzyć jedną kamerą.

## Do czego to się przydaje

Metryczny model głębi zamienia skalibrowaną kamerę w prosty dalmierz: odległość do auta przed
nami, do pieszego, do bariery albo do ziemi pod dronem. To dotrenowanie na konkretnej kamerze i
rodzaju scen sprawia, że metry są wiarygodne, a wydzielony zbiór z tego samego otoczenia pozwala to
sprawdzić. Kod i wszystkie ewaluacje są w [projekcie monocular-depth](/work/monocular-depth/).
