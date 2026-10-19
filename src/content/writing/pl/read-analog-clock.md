---
title: "Jak zbudować system, który odczytuje godzinę z zegara analogowego"
description: U-Net znajduje tarczę, wskazówki i godzinę 12, a geometria zamienia je na godzinę. 98,6 % przechylonych i obróconych zegarów odczytanych z dokładnością do 5 minut.
published: 2026-02-21
tags: [segmentacja, U-Net, dane syntetyczne, geometria rzutowa, PyTorch]
cover: ../../../assets/projects/clock-reader.jpg
coverAlt: Przechylony zegar analogowy, maski segmentacji i wyprostowana tarcza z odczytaną godziną
project: clock-reader
---

Odczytanie zegara analogowego jest łatwe dla człowieka i zaskakująco trudne dla komputera. Zegar
może być przechylony, obrócony, w połowie w cieniu, z sekundnikiem przecinającym pozostałe
wskazówki i cyframi w dowolnym stylu. Ten artykuł pokazuje, jak zbudować czytnik, który radzi
sobie z tym wszystkim: odczytuje 98,6 % przechylonych i obróconych zegarów testowych z
dokładnością do pięciu minut, z medianą błędu sześciu sekund.

## Niech sieć patrzy, a geometria czyta

Oczywiste podejście to wytrenować sieć, która dostaje zdjęcie i odpowiada „10:42”. Działa to na
zegarach podobnych do danych treningowych i zawodzi w sposób trudny do wyjaśnienia. Lepszy
podział pracy wygląda tak:

1. **sieć segmentacyjna** znajduje części zegara: tarczę, wskazówkę godzinową, minutową i
   sekundnik, oś w środku oraz położenie godziny 12;
2. **geometria** zamienia te części na godzinę.

Sieć musi tylko odpowiedzieć na pytanie „które piksele należą do wskazówki minutowej?”, a na nie
istnieje jasna odpowiedź, którą da się sprawdzić. Sama godzina wynika z dokładnej matematyki, a
każdy odczyt można prześledzić aż do masek, z których powstał.

## Dane treningowe z kodu

Sieć segmentacyjna potrzebuje etykiety dla każdego piksela, a nikt nie chce ręcznie malować
dziesięciu tysięcy wskazówek. Dlatego zegary są rysowane: generator proceduralny tworzy tarcze w
wielu stylach (cyfry rzymskie i arabskie, kreski, logotypy, kolory), wskazówki różnych kształtów,
a potem wszystko, co dodaje prawdziwe zdjęcie: perspektywę, obrót w płaszczyźnie obrazu, bałagan
w tle, rozmycie, odblaski i kompresję JPEG. Skoro program rysuje każdy element, wie też dokładnie,
który piksel należy do której części.

Generator jest na tyle szybki, że zbioru danych w ogóle nie ma: szesnaście procesów ładujących
rysuje około 1500 zegarów na sekundę, a każda epoka widzi 40 000 nowych.

## Sieć

Model to U-Net z koderem ResNet-34 wstępnie wytrenowanym na ImageNet, uczony entropią krzyżową i
stratą Dice na siedmiu klasach. Dostaje wycinek 256 × 256 z zegarem, a jeśli zegar jest częścią
większego zdjęcia, najpierw znajduje go detektor YOLO26. Trening trwa około 70 minut na jednej
karcie A100.

## Od masek do godzin i minut

Krok geometryczny ma pięć części:

1. **Dopasuj tarczę.** Okrąg widziany pod kątem rzutuje się na elipsę, więc do obrysu tarczy
   dopasowywana jest elipsa.
2. **Usuń perspektywę.** Środek okręgu jest biegunem prostej w nieskończoności. Biegunowa osi
   względem dopasowanej elipsy jest więc linią zbiegu płaszczyzny tarczy; po odesłaniu jej z
   powrotem do nieskończoności, a elipsy na okrąg, widzimy tarczę na wprost.
3. **Znajdź godzinę 12.** Posegmentowany znacznik godziny 12 wyznacza pozostały obrót, więc
   obrócone zegary też są odczytywane poprawnie.
4. **Zmierz wskazówki.** Kąt każdej wskazówki to średni kierunek jej pikseli, ważony kwadratem
   odległości od osi, więc długi koniec liczy się bardziej niż krótki ogon.
5. **Sprawdź godziny względem minut.** Minuty pochodzą ze wskazówki minutowej. Godzina to ta,
   dla której oczekiwany kąt wskazówki godzinowej, (godzina + minuty / 60) × 30°, najlepiej
   zgadza się z obserwacją. Zegar wskazujący 2:58 ma wskazówkę godzinową prawie na 3, a ta reguła
   i tak odczytuje 2:58.

## Wyniki

Na 2000 nowych syntetycznych zegarach z przechyleniem, obrotem, bałaganem i odblaskami:

| Metoda | Odczyt z dokładnością do 5 minut |
|---|---|
| U-Net (ResNet-34) + geometria | **98,6 %** |
| te same zegary ustawione na wprost | 99,7 % |
| idealne maski + geometria (górna granica) | 100 % |

97,6 % zegarów jest odczytywanych z dokładnością do minuty, a mediana błędu wynosi 0,1 minuty.
Z idealnymi maskami geometria odczytuje każdy zegar, więc dokładność całego systemu to
dokładność segmentacji.

To augmentacje sprawiają, że czytnik jest odporny: trening z obrotem w płaszczyźnie obrazu
dodaje 28 punktów procentowych na obróconych zegarach, a perspektywa 11. Mniejszy koder ResNet-18
odczytuje 97,9 % przy 14 zamiast 24 milionów parametrów.

## Jak go uruchomić

Model potrzebuje około 40 ms na zwykłym procesorze laptopa i eksportuje się do ONNX:

```bash
clock-read --checkpoint runs/resnet34_unet/best.pt --source photo.jpg
clock-read --checkpoint runs/resnet34_unet/best.pt --source photos/ --detect   # najpierw znajdź zegary
python -m clock_reader.export --checkpoint runs/resnet34_unet/best.pt
```

Ten sam przepis działa dla innych przyrządów ze wskazówką: manometrów, termometrów i liczników na
urządzeniach przemysłowych. Wymień renderer, zostaw geometrię. Kod jest w
[projekcie clock-reader](/work/clock-reader/).
