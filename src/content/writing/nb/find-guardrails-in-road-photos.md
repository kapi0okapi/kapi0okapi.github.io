---
title: "Slik finner du rekkverk i vegbilder med Nasjonal vegdatabank som lærer"
description: Tren en rekkverksdetektor uten manuelle etiketter, med NVDB-geometri og Statens vegvesens vegbilder, og kartlegg hvor bildene og registeret er uenige. AP 0,98.
published: 2026-04-25
tags: [svak veiledning, NVDB, Vegbilder, GeoPandas, EfficientNet, veginspeksjon]
cover: ../../../assets/projects/guardrail-inspector.jpg
coverAlt: Et vegbilde fra Trondheim med rekkverkene modellen fant, ved siden av NVDB-kartet
project: guardrail-inspector
---

Norge har et detaljert register over vegnettet, Nasjonal vegdatabank (NVDB), og det viser hvor
hvert rekkverk står. Statens vegvesen fotograferer også de fleste riks- og fylkesveger hvert år,
med ett bilde framover omtrent hver 20. meter. Setter du de to sammen, kan du lære en modell å se
rekkverk uten å merke ett eneste bilde for hånd, og deretter bruke modellen til å sjekke
registeret. Denne artikkelen viser hvordan.

## Steg 1: dataene

Begge kildene er åpne:

- **NVDB API v4** gir rekkverkene som polylinjer, sammen med rekkverksender og
  inspeksjonsregistreringer som sier om et rekkverk trenger tiltak.
- **Vegbilder-WFS** gir hvert vegbilde med posisjon, retning og lenke til bildet.

Alt holdes i EPSG:25833, projeksjonen begge tjenestene publiserer, så avstander er vanlige meter.
For Trondheim i 2023 og 2024 blir det rundt 30 000 bilder.

## Steg 2: etiketter fra geometri

For hvert bilde deles hvert rekkverk i nærheten opp i punkter med én meters avstand og flyttes
inn i kameraets koordinatsystem ut fra bildets posisjon og retning. Et rekkverk regnes som
*synlig til venstre* når minst fem meter av det ligger mellom 4 og 25 meter foran og til venstre;
det samme gjelder høyre side og en rekkverksende som kommer. Grensetilfeller, som et rekkverk som
begynner akkurat ved 24 meter, får etiketten «ukjent» og holdes utenfor tapsfunksjonen.

Disse etikettene er *svake*: de kommer fra et register, ikke fra en person som ser på bildet. Men
de er gratis, konsistente og finnes for hvert bilde i landet.

## Steg 3: modellen

Et forhåndstrent CNN med fem sigmoid-utganger (rekkverk venstre, rekkverk høyre, rekkverksende
venstre og høyre, trenger tiltak) trenes med maskert, klassevektet binær kryssentropi. To detaljer
er viktige:

- **En speiling er ikke bare en speiling.** Når et vegbilde speiles, flyttes rekkverket til
  venstre over til høyre, så augmentasjonen bytter også om venstre- og høyre-etikettene.
- **Del etter sted, ikke etter bilde.** Nabobilder viser det samme rekkverket, så trening,
  validering og test deles etter rutenettceller på én kilometer. Testresultatet måles på veger
  modellen aldri har sett.

Fire ryggrader ble sammenlignet; EfficientNet-B3 hadde best valideringsresultat og er den som
brukes. På testcellene oppnår den:

| Etikett | Gjennomsnittlig presisjon |
|---|---|
| rekkverk til venstre | **0,980** |
| rekkverk til høyre | 0,939 |
| rekkverksende foran, venstre / høyre | 0,567 / 0,518 |

Selve rekkverkene finnes nesten perfekt; rekkverksender er korte objekter som bare er med på noen
få bilder, og de er neste ting å forbedre med mer data.

## Steg 4: der bildene og registeret er uenige

Med en sannsynlighet for hvert bilde sorteres bildene fra hver kjøring etter vegmeter. Tre eller
flere bilder på rad der modellen og registeret er uenige, blir en *avviksstrekning*: enten et
rekkverk som er synlig men ikke registrert, eller et registrert rekkverk som bildene ikke viser. I
Trondheim gir det 24 strekninger, hver en kort liste med bilder som en inspektør kan åpne og
vurdere på sekunder, i stedet for å kjøre hele vegnettet.

Strekningene skrives til GeoJSON og vises i en visning laget med TypeScript og MapLibre over
Kartverkets topografiske kart, sammen med de registrerte rekkverkene, inspeksjonsflaggene og
bildene farget etter modellen.

## Bruk andre steder

Ingenting i arbeidsflyten er spesifikt for Trondheim eller for rekkverk. Ethvert objekt som NVDB
registrerer med geometri, fra skilt til lysmaster, kan bli svake etiketter for vegbilder på samme
måte. Koden ligger i [guardrail-inspector-prosjektet](/work/guardrail-inspector/), og
sammenligningen med registeret vokste videre til [veginspeksjonsplattformen](/work/inspection-platform/).
