---
title: "Jak znaleźć bariery drogowe na zdjęciach z drogi, ucząc się z norweskiego rejestru dróg"
description: Detektor barier bez ręcznych etykiet, z geometrii NVDB i zdjęć Statens vegvesen, oraz mapa miejsc, gdzie zdjęcia i rejestr się nie zgadzają. AP 0,98.
published: 2026-04-25
tags: [słaby nadzór, NVDB, Vegbilder, GeoPandas, EfficientNet, inspekcja dróg]
cover: ../../../assets/projects/guardrail-inspector.jpg
coverAlt: Zdjęcie drogi z Trondheim z barierami znalezionymi przez model, obok mapy NVDB
project: guardrail-inspector
---

Norwegia prowadzi szczegółowy rejestr dróg, NVDB, i zapisuje w nim położenie każdej bariery
drogowej. Statens vegvesen co roku fotografuje też większość dróg krajowych i wojewódzkich,
robiąc zdjęcie do przodu mniej więcej co 20 metrów. Po połączeniu tych dwóch źródeł można nauczyć
model rozpoznawać bariery bez ręcznego oznaczania ani jednego zdjęcia, a potem użyć modelu do
sprawdzenia rejestru. Ten artykuł pokazuje, jak to zrobić.

## Krok 1: dane

Oba źródła są otwarte:

- **NVDB API v4** podaje bariery jako polilinie, razem z ich zakończeniami i wynikami inspekcji,
  które mówią, czy bariera wymaga naprawy.
- **Usługa WFS Vegbilder** podaje każde zdjęcie drogi z położeniem, kierunkiem i linkiem do
  obrazu.

Wszystko jest trzymane w EPSG:25833, odwzorowaniu, w którym publikują obie usługi, więc
odległości to zwykłe metry. Dla Trondheim z lat 2023 i 2024 daje to około 30 000 zdjęć.

## Krok 2: etykiety z geometrii

Dla każdego zdjęcia każda pobliska bariera jest dzielona na punkty co metr i przenoszona do
układu kamery na podstawie położenia i kierunku zdjęcia. Bariera liczy się jako *widoczna po
lewej*, gdy co najmniej pięć metrów jej długości leży od 4 do 25 metrów przed pojazdem i po
lewej stronie; tak samo dla prawej strony i dla zakończenia bariery przed pojazdem. Przypadki
graniczne, na przykład bariera zaczynająca się dokładnie na 24. metrze, dostają etykietę
„nieznane” i nie wchodzą do funkcji straty.

Te etykiety są *słabe*: pochodzą z rejestru, a nie od człowieka patrzącego na zdjęcie. Za to są
darmowe, spójne i dostępne dla każdego zdjęcia w kraju.

## Krok 3: model

Wstępnie wytrenowana sieć konwolucyjna z pięcioma wyjściami sigmoid (bariera po lewej, bariera po
prawej, zakończenie po lewej i po prawej, wymaga naprawy) jest uczona maskowaną, ważoną binarną
entropią krzyżową. Liczą się dwa szczegóły:

- **Odbicie lustrzane to nie tylko odbicie.** Po odbiciu zdjęcia drogi bariera z lewej trafia na
  prawo, więc augmentacja zamienia też etykiety lewej i prawej strony.
- **Podział według miejsca, nie zdjęcia.** Sąsiednie zdjęcia pokazują tę samą barierę, więc zbiór
  treningowy, walidacyjny i testowy są dzielone według kwadratów siatki o boku jednego kilometra.
  Wynik testowy jest mierzony na drogach, których model nigdy nie widział.

Porównałem cztery sieci bazowe; EfficientNet-B3 miał najlepszy wynik walidacyjny i to on jest
wdrożony. Na testowych kwadratach osiąga:

| Etykieta | Średnia precyzja (AP) |
|---|---|
| bariera po lewej | **0,980** |
| bariera po prawej | 0,939 |
| zakończenie bariery przed pojazdem, lewe / prawe | 0,567 / 0,518 |

Same bariery są rozpoznawane niemal bezbłędnie; zakończenia to krótkie obiekty widoczne na
nielicznych zdjęciach i to je najbardziej poprawi więcej danych.

## Krok 4: gdzie zdjęcia i rejestr się nie zgadzają

Mając prawdopodobieństwo dla każdego zdjęcia, zdjęcia z każdego przejazdu porządkuje się według
kilometrażu. Trzy lub więcej kolejnych zdjęć, na których model i rejestr się nie zgadzają, tworzą
*odcinek rozbieżności*: albo bariera widoczna, ale niezarejestrowana, albo zarejestrowana, której
nie widać na zdjęciach. W Trondheim daje to 24 odcinki, każdy jako krótka lista zdjęć, którą
inspektor może otworzyć i ocenić w kilka sekund, zamiast objeżdżać całą sieć dróg.

Odcinki są zapisywane do GeoJSON i pokazywane w przeglądarce napisanej w TypeScript z MapLibre,
na mapie topograficznej Kartverket, razem z zarejestrowanymi barierami, flagami inspekcji i
zdjęciami pokolorowanymi według modelu.

## Zastosowanie gdzie indziej

Nic w tym procesie nie jest specyficzne dla Trondheim ani dla barier. Każdy obiekt, który NVDB
rejestruje z geometrią, od znaków drogowych po latarnie, może w ten sam sposób stać się słabymi
etykietami dla zdjęć z drogi. Kod jest w [projekcie guardrail-inspector](/work/guardrail-inspector/),
a porównanie z rejestrem rozwinęło się w [platformę inspekcji dróg](/work/inspection-platform/).
