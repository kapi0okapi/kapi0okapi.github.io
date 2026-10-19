---
title: "Slik bygger du et system som leser klokka på en analog urskive"
description: Et U-Net finner skiven, viserne og klokka 12, og projektiv geometri gjør dem om til timer og minutter. 98,6 % av skrå, roterte klokker lest innen 5 minutter.
published: 2026-02-21
tags: [segmentering, U-Net, syntetiske data, projektiv geometri, PyTorch]
cover: ../../../assets/projects/clock-reader.jpg
coverAlt: En skrå analog klokke, segmenteringsmaskene og den rettede urskiven med klokkeslettet som er lest av
project: clock-reader
---

Å lese en analog klokke er lett for mennesker og overraskende vanskelig for en datamaskin.
Klokka kan stå på skrå, være rotert, ligge halvt i skygge, ha en sekundviser som krysser de andre
og tall i hvilken som helst stil. Denne artikkelen viser hvordan du bygger en leser som takler
alt dette: den leser 98,6 % av skrå og roterte testklokker innen fem minutter, med en
medianfeil på seks sekunder.

## La nettverket se og geometrien lese

Den åpenbare løsningen er å trene et nettverk som tar et bilde og svarer «10:42». Det fungerer
på klokker som ligner treningsdataene, og feiler på måter som er vanskelige å forklare. En bedre
arbeidsdeling er:

1. et **segmenteringsnettverk** finner delene av klokka: skiven, time-, minutt- og
   sekundviseren, navet i midten og posisjonen til klokka 12;
2. **geometri** gjør disse delene om til et klokkeslett.

Nettverket trenger bare å svare på «hvilke piksler tilhører minuttviseren?», et spørsmål med et
klart svar som kan sjekkes. Selve klokkeslettet kommer fra eksakt matematikk, og hver avlesning
kan spores tilbake til maskene den kom fra.

## Treningsdata fra kode

Et segmenteringsnettverk trenger en etikett for hver piksel, og ingen vil male ti tusen visere
for hånd. Derfor blir klokkene tegnet: en prosedyrisk generator lager urskiver i mange stiler
(romerske og arabiske tall, streker, logoer, farger), visere i ulike former, og deretter alt et
ekte bilde legger til: perspektiv, rotasjon i bildeplanet, rot i bakgrunnen, uskarphet, gjenskinn
og JPEG-komprimering. Siden programmet tegner hvert element, vet det også nøyaktig hvilken piksel
som tilhører hvilken del.

Generatoren er så rask at det ikke finnes noe datasett i det hele tatt: seksten data-loadere
tegner rundt 1 500 klokker i sekundet, og hver epoke ser 40 000 nye.

## Nettverket

Modellen er et U-Net med en ResNet-34-koder forhåndstrent på ImageNet, trent med kryssentropi og
Dice-tap på sju klasser. Den tar et utsnitt på 256 × 256 av klokka, og hvis klokka er en del av
et større bilde, finner en YOLO26-detektor den først. Treningen tar rundt 70 minutter på én
A100-GPU.

## Fra masker til timer og minutter

Det geometriske steget har fem deler:

1. **Tilpass skiven.** En sirkel sett på skrå blir en ellipse, så en ellipse tilpasses omrisset
   av skiven.
2. **Fjern perspektivet.** Sentrum i en sirkel er polen til linja i det uendelige. Polaren til
   navet med hensyn til ellipsen er derfor forsvinningslinja til skiveplanet; når den sendes
   tilbake til det uendelige, og ellipsen til en sirkel, får vi skiven rett forfra.
3. **Finn klokka 12.** Den segmenterte 12-markøren bestemmer den gjenværende rotasjonen, så også
   roterte klokker leses riktig.
4. **Mål viserne.** Vinkelen til hver viser er middelretningen til pikslene, vektet med kvadratet
   av avstanden fra navet, så den lange spissen teller mer enn den korte enden.
5. **Sjekk timer mot minutter.** Minuttene kommer fra minuttviseren. Timen er den der forventet
   vinkel for timeviseren, (time + minutter / 60) × 30°, passer best med det som observeres. Ei
   klokke som viser 2:58 har timeviseren nesten på 3, og regelen leser den likevel som 2:58.

## Resultater

På 2 000 nye syntetiske klokker med skråstilling, rotasjon, rot og gjenskinn:

| Metode | Lest innen 5 minutter |
|---|---|
| U-Net (ResNet-34) + geometri | **98,6 %** |
| de samme klokkene rett forfra | 99,7 % |
| perfekte masker + geometri (øvre grense) | 100 % |

97,6 % leses innen ett minutt, og medianfeilen er 0,1 minutt. Med perfekte masker leser
geometrien hver eneste klokke, så nøyaktigheten til hele systemet er nøyaktigheten til
segmenteringen.

Det er augmentasjonene som gjør leseren robust: trening med rotasjon i bildeplanet gir 28
prosentpoeng på roterte klokker, og perspektiv gir 11. En mindre ResNet-18-koder leser 97,9 % med
14 i stedet for 24 millioner parametere.

## Slik kjører du den

Modellen bruker rundt 40 ms på en vanlig bærbar CPU og eksporteres til ONNX for utrulling:

```bash
clock-read --checkpoint runs/resnet34_unet/best.pt --source photo.jpg
clock-read --checkpoint runs/resnet34_unet/best.pt --source photos/ --detect   # finn klokkene først
python -m clock_reader.export --checkpoint runs/resnet34_unet/best.pt
```

Den samme oppskriften fungerer for andre målere med viser: trykkmålere, termometre og målere på
industrielt utstyr. Bytt ut tegneprogrammet, behold geometrien. Koden ligger i
[clock-reader-prosjektet](/work/clock-reader/).
