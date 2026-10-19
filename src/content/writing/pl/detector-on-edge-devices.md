---
title: "Jak uruchomić detektor obiektów na urządzeniu brzegowym: YOLO26 w INT8 z 97 % dokładności"
description: Eksport YOLO26 do ONNX Runtime, OpenVINO, Core ML i TensorRT, poprawna kwantyzacja do INT8 i wybór środowiska pod sprzęt. Zmierzone na całym COCO.
published: 2026-06-27
tags: [edge AI, kwantyzacja, INT8, ONNX Runtime, OpenVINO, Core ML, YOLO26]
cover: ../../../assets/writing/int8-pareto.png
coverAlt: Dokładność na COCO w funkcji opóźnienia dla wariantów YOLO26n na Apple M4 Pro
project: edge-optimization
---

Detektor, który na GPU w centrum danych przetwarza 200 klatek na sekundę, niewiele daje, jeśli
kamera jest na dronie, linii produkcyjnej albo w telefonie. Na takich urządzeniach liczą się trzy
rzeczy: rozmiar modelu, pamięć, której potrzebuje, i czas na klatkę, i liczą się bardziej niż
ostatnia dziesiąta część punktu dokładności. Ten artykuł pokazuje, jak przenieść YOLO26n,
najmniejszy model najnowszej generacji YOLO, na sprzęt brzegowy i jak zmierzyć, że po drodze nie
ginie nic ważnego.

## Jeden model, wiele środowisk

Każdy rodzaj sprzętu ma środowisko, które wyciska z niego najwięcej:

| Sprzęt | Środowisko | Format |
|---|---|---|
| dowolny procesor, także w przeglądarce | ONNX Runtime | ONNX |
| procesory i karty Intela | OpenVINO | OpenVINO IR |
| iPhone, iPad, Mac (Neural Engine) | Core ML | pakiet ML |
| karty NVIDIA i Jetson | TensorRT | engine |

YOLO26 ułatwia eksport, bo jego głowica działa *end-to-end*: sama sieć zwraca najwyżej 300
gotowych ramek, więc nie ma osobnego kroku NMS do napisania od nowa na każdym urządzeniu.
Wyeksportowany plik to cały detektor.

## INT8: trzy razy mniej

Kwantyzacja wag i aktywacji z 32-bitowych liczb zmiennoprzecinkowych do 8-bitowych liczb
całkowitych zmniejsza model trzykrotnie, a na sprzęcie z szybkimi jednostkami całkowitoliczbowymi
także go przyspiesza. Kwantyzacja statyczna potrzebuje kilkuset obrazów kalibracyjnych do wyboru
zakresu każdego tensora; tutaj pochodzą ze zbioru treningowego COCO, nigdy ze zbioru
walidacyjnego, na którym model jest oceniany.

O tym, ile dokładności przetrwa, decydują dwie zasady:

1. **Dekodowanie w głowicy zostaje we float.** Głowica YOLO26 na końcu łączy współrzędne ramek w
   pikselach (od 0 do 640) i prawdopodobieństwa klas (od 0 do 1) w jeden tensor. Jedna skala INT8
   nie pomieści obu zakresów, więc tych kilka tanich węzłów zostaje w 32-bitowym float.
2. **Zmierz, które warstwy są wrażliwe.** Gdy po kolei zostawia się każdy blok we float, a resztę
   w INT8, widać, gdzie precyzja ma znaczenie. Wyróżnia się jedna grupa: gałąź klas w głowicy jest
   warta 2,1 mAP, więcej niż jakikolwiek blok szkieletu. Zostawienie jej we float prawie nic nie
   kosztuje w rozmiarze.

Kalibracja percentylowa, która pomija rzadkie skrajne aktywacje, dodaje ponad punkt względem
prostych zakresów min-max.

## Wynik

Na wszystkich 5000 obrazach COCO val2017 z oficjalną metryką:

| Model | Rozmiar | mAP50-95 |
|---|---|---|
| ONNX FP32 | 9,9 MB | 40,3 |
| Core ML FP16 | 5,1 MB | 40,2 |
| OpenVINO INT8 | 3,4 MB | 39,3 |
| **ONNX INT8, gałąź klas we float, percentyl** | **3,4 MB** | **39,1** |
| ONNX INT8, standardowy eksport Ultralytics | 3,0 MB | 34,1 |

Model INT8 zachowuje 97 % dokładności wersji float przy jednej trzeciej rozmiaru i wyprzedza
standardowy eksport o pięć punktów.

## Wybierz środowisko pod urządzenie

Szybkość zależy bardziej od sprzętu niż od formatu. Na Apple M4 Pro:

- **Neural Engine** uruchamia model Core ML FP16 w **7,5 ms**, zdecydowanie najszybciej;
- na **procesorze** FP32 i INT8 są blisko siebie przy kilku wątkach (około 10 ms), więc tam INT8
  to głównie zysk na rozmiarze;
- na **procesorze x86** model INT8 w OpenVINO działa 1,7 do 2,2 razy szybciej niż FP32 (5,9 ms dla
  YOLO26n na ośmiu wątkach);
- na **karcie GPU** w centrum danych z TensorRT FP16 zajmuje już około 2 ms, a INT8 oszczędza przy
  batchu 1 tylko dziesiątą część milisekundy.

Staranna kwantyzacja po treningu dorównuje też treningowi z kwantyzacją: dziesięć epok QAT na
całym COCO daje 38,3 mAP, mniej niż 39,1 skalibrowanego modelu INT8.

Przepis jest więc taki: wyeksportuj raz, skwantyzuj starannie, a potem zmierz na urządzeniu,
którego naprawdę użyjesz, bo najszybszy wybór na jednym układzie rzadko jest najszybszy na
następnym.

## Wypróbuj

Model INT8 z tego artykułu działa w Twojej przeglądarce w [laboratorium](/lab/): 3,4 MB,
WebAssembly, bez serwera. Kod, analiza wrażliwości i wszystkie tabele są w
[projekcie edge-optimization](/work/edge-optimization/).
