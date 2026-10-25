# Weg der vier Winde – Website

Statische Website für Katharina (Energiearbeit & Verkörperung). Reines HTML/CSS mit wenig JavaScript, ohne Build-Schritt. Gehostet auf Netlify.

## Aufbau

```
site/                  wird veröffentlicht (netlify.toml → publish = "site")
  index.html           Startseite (die Reise in vier Kapiteln)
  begleitungen/        alle sieben Begleitungen mit Ankern
  ablauf-preise/       Ablauf, Mesa, Ort, Preise, FAQ
  ueber-mich/          Über mich, Haltung, Spuren des Weges
  kontakt/             Formular (Netlify Forms) + Danke-Seite
  impressum/, datenschutz/, 404.html
  css/style.css        Designsystem (Farben, Schriften, Layout)
  js/main.js           Burger-Menü, sanftes Einblenden
  fonts/               Cormorant Garamond + Nunito Sans, selbst gehostet (OFL)
  img/                 Logo, Bildausschnitte, Grafiken
tools/
  logo_raster.py       stellt das Originallogo aus einem Screenshot frei
  logo.py              Vektor-Nachbau der Bildmarke (Favicon, logo-mark.svg)
  crop.py              schneidet die Bildteile aus den Postern aus
  placeholders.py      Platzhalterbilder, solange die Poster fehlen
raw/                   Originaldateien (nicht im Git, siehe .gitignore)
```

Lokal ansehen: `cd site && python3 -m http.server 8000`, dann http://localhost:8000 öffnen.

Alle Links sind relativ, daher läuft die Seite auf Netlify und auf GitHub Pages (Unterpfad). GitHub Pages wird über `.github/workflows/pages.yml` veröffentlicht. Hinweis: Das Kontaktformular (Netlify Forms) funktioniert nur auf Netlify, nicht auf GitHub Pages.

## Logo

Verwendet wird das **Originallogo** (vier goldene Spiralen, Schriftzug „Weg der vier Winde“, Zeile „Energiemedizin & Verkörperung“, Bogen). Da noch keine Vektordatei vorliegt, wurde es aus einem Screenshot freigestellt:

```
python3 tools/logo_raster.py raw/logo-screenshot.png
```

Das erzeugt `logo.webp` (komplett), `logo-mark.webp` (Spiralen), `logo-schriftzug.webp` und `logo-original.webp` (unverändert). Header = Spiralen + Schriftzug, Hero und Footer = komplettes Logo. Das Favicon ist ein Vektor-Nachbau der Spiralen (`tools/logo.py`).

**Sobald Katharina die Originaldatei (SVG/PDF/PNG in hoher Auflösung) liefert:** diese Dateien in `site/img/` ersetzen.

## Bilder aus den Postern

1. Poster mit den Namen aus dem Briefing (Tabelle 3.2) nach `raw/` legen.
2. `pip install Pillow && python3 tools/crop.py`
3. `tools/preview.html` im Browser öffnen und prüfen: **kein Text, kein Logo, kein Rand** im Ausschnitt. Sonst Werte in `CROPS` (in `tools/crop.py`) anpassen und neu schneiden.

Bis dahin liegen beschriftete Platzhalter in `site/img/` (`tools/placeholders.py`). Sie werden von `crop.py` überschrieben.

## Platzhalter im Text

Alles, was noch von Katharina kommen muss, steht in `[ECKIGEN KLAMMERN]` und ist auf der Seite gelb hinterlegt (CSS-Klasse `.ph`). Suchen mit:

```
grep -rn 'class="ph"' site
```

## Vor dem Livegang

- [ ] Logo freigeben (optional Originaldatei liefern)
- [ ] Poster nach `raw/` legen, `tools/crop.py` laufen lassen, Ausschnitte prüfen
- [ ] Ort/Adresse, Online ja/nein, Kennenlernen telefonisch/online/vor Ort
- [ ] Kontaktdaten, Antwortzeit („innerhalb von [X] Tagen“), „Route planen“-Link
- [ ] Impressum, Kleinunternehmerin ja/nein, Preis-Hinweis
- [ ] Absageregel und Zahlungsweise (Preise + FAQ)
- [ ] Bezeichnung der Tanz-/Ausdrucks-Ausbildung
- [ ] „Spuren des Weges“: Daten eintragen **oder den Abschnitt entfernen** (keine Fantasie-Daten)
- [ ] Gemälde „Alles ist Energie“ von Katharina? Bildunterschrift anpassen oder löschen
- [ ] Datenschutzerklärung mit Generator (e-recht24 / Dr. Schwenke) erstellen und einfügen
- [ ] `[ORT]` in Seitentiteln und in den strukturierten Daten (`index.html`, LocalBusiness) ersetzen
- [ ] Freigabe aller Texte durch Katharina
- [ ] Domain einrichten, Netlify-Formular-Benachrichtigung an Katharinas E-Mail
- [ ] Google-Unternehmensprofil anlegen und verknüpfen

## Technik & Recht

- Keine Cookies, kein Tracking, keine externen Fonts/Karten/Videos → kein Cookie-Banner nötig.
- Instagram nur als Link.
- Hinweis zur energetischen Begleitung (keine Heilversprechen) steht auf jeder Seite vor dem Footer.
- Sicherheits-Header inkl. Content-Security-Policy in `netlify.toml`. Wird das kleine Inline-Skript im `<head>` geändert, muss der sha256-Hash dort angepasst werden.
- Gold (`--gold`) nur für Linien, Ziffern und Akzente; für kleine goldene Schrift auf hellem Grund gibt es `--gold-text` (WCAG AA).
