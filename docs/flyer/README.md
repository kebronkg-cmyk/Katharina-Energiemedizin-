# Flyer „Weg der vier Winde“

**Fassung A** (ruhige Bild-Vorderseite): `flyer-din-lang-druck.pdf`, Vorschau `vorschau-vorne.png` / `vorschau-hinten.png`
**Fassung B** (Vorderseite mit Infos und QR-Code, für Auslagen): `flyer-b-din-lang-druck.pdf`, Vorschau `vorschau-b-vorne.png` / `vorschau-b-hinten.png`

| | |
|---|---|
| Format | DIN lang hoch, 99 × 210 mm, beidseitig farbig (4/4) |
| Datenformat | 103 × 214 mm (2 mm Beschnitt rundum), Texte ≥ 6 mm vom Rand |
| Bilder | ca. 300 dpi, Gemälde aus der Website |

## Vor dem Druck ergänzen
- [ ] Telefon / E-Mail (Platz unter Instagram)
- [ ] QR-Code auf die endgültige Domain umstellen (zeigt zurzeit auf die Vorschau-Seite)
- [ ] Freigabe der Texte durch Katharina

## Empfehlung zum Druck
- **Papier:** 300 g/m² matt (Bilderdruck oder Naturpapier). Optional **Softtouch-Cellophanierung** für eine samtige, hochwertige Haptik.
- **Auflage:** 250 Stück zum Start reichen; der Stückpreis sinkt bei mehr deutlich.
- **Kosten:** Für 250 Stück DIN lang 4/4 rechnen Ratgeber mit grob 22 – 35 € auf Standardpapier, mit 300 g und Veredelung eher 40 – 80 €.
- **Anbieter:** Saxoprint, wir-machen-druck, flyeralarm (günstig, schnell) oder **dieUmweltDruckerei** (100 % Recyclingpapier, Ökostrom; passt gut zu Katharinas Arbeit).
- **Ablauf:** Format „DIN lang hoch, 99 × 210 mm“ wählen → PDF hochladen → Datencheck des Anbieters bestätigen.
  Die Datei ist in RGB angelegt; die Druckerei rechnet in CMYK um. Für ganz exakte Farben einen Probedruck bestellen.

## Zum Angebot auf dem Flyer
Das Angebot ist das **kostenlose Kennenlernen (bis 30 Minuten)**. Rabatte oder Gutscheine
auf die Begleitungen selbst sind wegen des Heilmittelwerbegesetzes (§ 7 HWG, Zuwendungen)
riskant und sollten nur nach rechtlicher Prüfung ergänzt werden.

## Neu erzeugen
`node docs/flyer/build.js` (Fassung A) bzw. `node docs/flyer/build.js flyer-b-din-lang` (Fassung B), benötigt Playwright
