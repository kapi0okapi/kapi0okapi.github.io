---
title: "Jak zmapować drogę LiDAR-em i zmierzyć jej bariery"
description: Odometria LiDAR z domykaniem pętli, RandLA-Net do rozpoznania każdego punktu i profil wysokości każdej bariery metr po metrze. Sprawdzone na KITTI i Toronto-3D.
published: 2026-01-10
tags: [LiDAR, SLAM, chmury punktów, RandLA-Net, KITTI, Toronto-3D]
cover: ../../../assets/projects/lidar-road-segmentation.png
coverAlt: Posegmentowana chmura punktów korytarza drogowego i profil wysokości bariery
project: lidar-road-segmentation
---

Samochód mapujący z LiDAR-em na dachu zbiera miliony punktów na minutę. Żeby zamienić je w coś,
z czego zarządca drogi może skorzystać, potrzebne są trzy kroki: umieścić każdy skan we właściwym
miejscu, rozpoznać, czym jest każdy punkt, i zmierzyć obiekty, które mają znaczenie. Ten artykuł
pokazuje wszystkie trzy, każdy zbudowany od zera i sprawdzony z opublikowanymi wynikami.

## Krok 1: gdzie był samochód? Odometria LiDAR

Każdy skan jest dopasowywany do lokalnej mapy poprzednich skanów, co daje ruch samochodu między
kolejnymi skanami. Proces wzorowany jest na KISS-ICP:

1. **Przewiduj** nową pozycję modelem stałej prędkości: samochód nie zmienia prędkości znacząco w
   ciągu dziesiątej części sekundy.
2. **Przerzedź** skan na siatce wokseli, żeby gęste punkty blisko samochodu nie przeważały nad
   dalekimi.
3. **Dopasuj** go do lokalnej mapy wokseli metodą ICP punkt do punktu z odpornym jądrem.
4. **Dostosuj** próg dopasowania do tego, jak mocno ICP musiało ostatnio poprawiać predykcję, żeby
   metoda działała i w mieście, i na autostradzie z tymi samymi ustawieniami.

Velodyne w KITTI ma pionowe kąty wiązek przesunięte o około 0,2 stopnia, co wystarczy, by płaski
teren wygiął się w płaski stożek. Ich korekta zmniejsza dryf w całym zbiorze o połowę.

## Krok 2: domykanie pętli

Odometria powoli dryfuje. Kiedy samochód wraca w miejsce, które już widział, ten dryf można usunąć:

- **Scan Context** opisuje każde miejsce jako zwarty obraz skanu w pierścieniach i sektorach, więc
  powroty można szybko znaleźć wśród tysięcy wcześniejszych skanów;
- **weryfikacja ICP** sprawdza każdego kandydata: co najmniej 70 % punktów musi się dopasować z
  dokładnością do pół metra;
- **graf pozycji** ze wszystkimi krokami odometrii i pętlami jest rozwiązywany rzadką metodą
  najmniejszych kwadratów, a test chi-kwadrat usuwa pętle niezgodne z resztą.

Na wszystkich jedenastu sekwencjach KITTI z danymi referencyjnymi (22 km) odometria dryfuje o
0,63 % przejechanej odległości, blisko oficjalnej paczki autorów (0,56 %). Domykanie pętli
zmniejsza potem błąd bezwzględny na sekwencji 00 z 2,3 m do 1,0 m, a na sekwencji 05 z 1,3 m do
0,4 m.

## Krok 3: czym jest każdy punkt? RandLA-Net

Gdy mapa jest gotowa, każdy punkt potrzebuje klasy: jezdnia, oznakowanie, roślinność, budynek,
słup, samochód, płot. RandLA-Net powstał dokładnie dla takiej skali. Losuje punkty zamiast
kosztownego próbkowania najdalszych punktów, a nadrabia to lokalną agregacją cech i poolingiem z
mechanizmem uwagi, przetwarzając około 70 000 punktów na sekundę na jednej karcie GPU.

Reimplementacja to czysty PyTorch bez własnego kodu CUDA: wszystkie indeksy sąsiadów i poolingu
powstają z drzew k-d w procesach ładujących dane, a GPU wykonuje tylko gęste operacje na
tensorach. Cała płytka jest przewidywana przez pokrycie jej nakładającymi się otoczeniami i
uśrednienie głosów dla każdego punktu; wynik jest zapisywany jako plik LAZ, który otwiera się w
CloudCompare albo QGIS.

Na Toronto-3D, zbiorze z mapowania ulicy miejskiej, osiąga **81,8 mIoU**, tyle samo co
opublikowany wynik RandLA-Net (81,8), z 96,8 IoU na jezdni i 94,3 na samochodach.

## Krok 4: pomiar barier

Punkty oznaczone jako bariery są dzielone na pojedyncze obiekty, każdy obiekt jest cięty na odcinki
co metr wzdłuż głównego kierunku, a każdy odcinek dostaje wysokość bariery nad płaszczyzną drogi
dopasowaną metodą najmniejszych kwadratów, uwzględniającą spadek podłużny i poprzeczny. Wynikiem
jest profil wysokości każdej bariery w metrach, w którym każdy odcinek poza dopuszczalnym zakresem
jest oznaczany dla inspektora. Na syntetycznym korytarzu testowym z barierą o wysokości 0,75 m
zmierzona mediana wynosi 0,73 m.

## Wszystko razem

Odometria i domykanie pętli dają spójną mapę, segmentacja mówi, co na niej jest, a prosta geometria
zamienia etykiety w pomiary, na podstawie których zarządca drogi może działać. Kod jest w dwóch
projektach: [LiDAR SLAM](/work/lidar-slam/) i
[segmentacja korytarza drogowego z LiDAR-u](/work/lidar-road-segmentation/).
