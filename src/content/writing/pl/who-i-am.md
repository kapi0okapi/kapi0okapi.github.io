---
title: "Kim jestem: inżynier AI, który buduje systemy wizyjne działające poza laboratorium"
description: Kacper Pawlowski, inżynier AI w Lighthouse Consulting i student studiów magisterskich na NTNU w Trondheim. Co buduję, jak pracuję i czego szukam.
published: 2026-10-09
tags: [o mnie, inżynier AI, widzenie komputerowe, NTNU, Trondheim]
cover: ../../../assets/portrait.jpg
coverAlt: Portret Kacpra Pawlowskiego
---

Nazywam się Kacper Pawlowski. Jestem inżynierem AI w Lighthouse Consulting i studentem studiów
magisterskich na NTNU w Trondheim. Buduję systemy widzenia komputerowego i percepcji 3D: od
pierwszego spojrzenia na surowe dane, przez model, aż po oprogramowanie działające na sprzęcie,
dla którego powstało.

## Czym zajmuję się w pracy

W Lighthouse Consulting buduję systemy widzenia komputerowego do konserwacji predykcyjnej. Cel
łatwo opisać: wykryć zużycie i usterki wcześnie, żeby klient mógł zaplanować naprawę zamiast
reagować na awarię. W praktyce to automatyczna inspekcja wizualna na liniach przemysłowych, od
klasycznego przetwarzania obrazu po głębokie uczenie, dobierane do tego, czego wymaga problem.

Równolegle ze studiami pracuję też jako konsultant techniczny w Pango Consulting, gdzie utrzymuję
i rozwijam systemy klientów, oraz jako dyspozytor ruchu w Boreal Buss i Vy Buss w Trondheim.
Dyspozytornia nauczyła mnie czegoś, czego nie dał żaden przedmiot: podejmowania dobrych decyzji
szybko, przy niepełnych informacjach, kiedy czekają autobusy i pasażerowie.

## Co studiuję

Robię na NTNU dwa kierunki magisterskie: informatykę ze specjalizacją w sztucznej inteligencji
oraz fizykę i matematykę ze specjalnością matematyka przemysłowa. Z tej drugiej pochodzą narzędzia
mojej pracy w 3D: algebra liniowa, optymalizacja i teoria estymacji, czyli matematyka stojąca za
SLAM, bundle adjustment i filtrami Kalmana. Spędziłem semestr wymiany na Instituto Superior
Técnico w Lizbonie, a przed NTNU ukończyłem liceum w Orkdal jako najlepszy uczeń rocznika.

## Co buduję

Moje projekty mają wspólny schemat: prawdziwy problem, prawdziwe dane, model i wynik, który da się
sprawdzić z czymś niezależnym. Kilka przykładów:

- **Bariery drogowe na zdjęciach z drogi.** Model, który znajduje bariery na zdjęciach Statens
  vegvesen, uczony z norweskim rejestrem dróg w roli nauczyciela, oraz mapa miejsc, gdzie zdjęcia
  i rejestr się nie zgadzają.
- **Odległość w metrach z jednej kamery.** Model głębi działający w czasie rzeczywistym,
  dotrenowany na KITTI, który mierzy odległość dokładniej niż duże modele metryczne, z którymi go
  porównałem, w 20 ms na zdjęcie.
- **Mapowanie LiDAR-em.** Segmentacja chmur punktów zgodna z opublikowanymi wynikami RandLA-Net
  oraz napisana od zera odometria LiDAR z domykaniem pętli, oceniona na całym KITTI.
- **Wdrożenia na urządzenia brzegowe.** Detektor trzy razy mniejszy w INT8, który zachowuje 97 %
  dokładności, na ONNX Runtime, OpenVINO, Core ML i TensorRT.
- **Drony.** Właśnie buduję wykrywanie małych obiektów z powietrza i system, który decyduje, gdzie
  dron może bezpiecznie wylądować.

Ciężkie treningi liczą się na superkomputerze z GPU; modele kończą jako pliki ONNX, usługi w
Dockerze albo, w [laboratorium](/lab/), jako detektor działający w Twojej przeglądarce.

## Jak pracuję

Mierzę wyniki względem niezależnego punktu odniesienia, kiedy tylko istnieje: liczb opublikowanych
przez autorów metody, trajektorii referencyjnej, krajowego rejestru. Dbam o powtarzalność, od
pobrania danych po zadanie w Slurmie, żeby ktoś inny mógł odtworzyć wynik. I zwracam uwagę na to,
gdzie model ma działać, bo model dokładny na GPU, ale za wolny na docelowym urządzeniu, nie
rozwiązuje niczyjego problemu.

## Języki i kontakt

Mówię po angielsku, norwesku, polsku, niemiecku i ukraińsku.

Jeśli pracujesz nad widzeniem komputerowym, percepcją 3D albo edge AI, zwłaszcza dla dróg,
infrastruktury lub przemysłu, napisz do mnie: [contact@kacperpawlowski.tech](mailto:contact@kacperpawlowski.tech),
[LinkedIn](https://www.linkedin.com/in/kacper-pawlowski-914ab8297/) albo
[GitHub](https://github.com/kapi0okapi). Moje projekty są zebrane w zakładce [work](/work/).
