# Bildwelt „Weg der vier Winde“ – Anleitung & Prompts

Ziel: eine einheitliche, gemalte Himmelswelt (Öl + Aquarell) für die neue Seite.
Vier Winde mit Krafttier, Thema und Lichtstimmung, dazu eine Mitte (Ankommen).

| Bereich | Krafttier | Thema | Licht |
|---|---|---|---|
| Mitte | – | Ankommen, die vier Winde treffen sich | Morgendämmerung: Perlweiß, Champagnergold, Rosé |
| Süden | Schlange | Altes ablegen, loslassen | warmes Goldlicht: Bernstein, Honig, Aprikose |
| Westen | Jaguar | Mut zur Tiefe, Schatten | Dämmerung: Violett, Indigo, Mauve, letzter Goldsaum |
| Norden | Kolibri | Weisheit, der eigene Weg | klare Höhenluft: Silberblau, Aquamarin, Perlmutt |
| Osten | Kondor | Vision, Neubeginn | Sonnenaufgang: Roségold, Pfirsich, Koralle, Elfenbein |

---

## 1. Werkzeug

**Midjourney** (aktuelle Version, bezahltes Abo – nur damit sind die Bilder kommerziell nutzbar).
Es ist für gemalte, atmosphärische Bilder das stärkste Werkzeug und kann mit einer
**Stilreferenz** (`--sref`) dafür sorgen, dass alle Bilder wie aus einer Hand aussehen.
Alles in **einem** Werkzeug machen – gemischte Generatoren sehen nie ganz einheitlich aus.

Zum Vergrößern danach: Midjourney „Upscale (Subtle)“, für das Beste zusätzlich
**Topaz Gigapixel** oder **Magnific** auf mind. 3840 px Breite.

## 2. Ablauf

1. **Stil-Schlüsselbild erzeugen** (Prompt A). 4–8 Durchgänge, das schönste Bild wählen.
   Es legt den Malstil für alles Weitere fest – hier lohnt sich Geduld.
2. Das gewählte Bild hochskalieren und seine **Bild-URL kopieren**
   (in Midjourney: Bild öffnen → „Copy Image URL“).
3. In allen weiteren Prompts `STILREF-URL` durch diese URL ersetzen.
4. Szenen (B), Wolken-Elemente (C), Krafttier-Zeichen (D) erzeugen.
   Pro Prompt mehrere Durchgänge, jeweils das beste Bild wählen.
5. Jede Szene zusätzlich im **Hochformat** erzeugen (für Handys):
   denselben Prompt mit `--ar 9:16` statt `--ar 21:9`.
6. Alles hochskalieren, als **PNG** speichern, mit den Dateinamen aus Abschnitt 6
   benennen und hier im Chat hochladen. Zuschnitt, Freistellen, Komprimieren
   und Einbau übernimmt Claude.

### Prüfen vor dem Hochladen

- Kein Text, keine Buchstaben, keine Signatur, kein Rahmen
- Tiere nur **angedeutet** in Wolken/Licht – nie comichaft, nie bedrohlich
- Keine verformten Tierteile (Flügel, Beine, Augen genau ansehen)
- Ruhige, freie Fläche dort, wo später Text oder das Logo sitzt
- Einheitlicher Malstil über alle Bilder (nebeneinander anschauen)

---

## 3. Der Stil-Baustein

Dieser Text steckt in jedem Prompt (schon eingefügt) – hier nur zur Erklärung:

> luminous fine-art oil painting with delicate watercolor glazes, soft impasto
> in the cloud highlights, visible linen canvas texture and paper grain,
> subtle gold leaf shimmer, airy negative space, serene, sacred, heavenly,
> meditative, museum quality, in the spirit of J. M. W. Turner's light and
> Albert Bierstadt's skies

Gemeinsames Ende jedes Prompts (Ausschlüsse):

```
--no text, letters, words, watermark, signature, frame, border, people, buildings, cartoon, 3d render, CGI, plastic, harsh contrast, oversaturated, fantasy kitsch
```

---

## A. Stil-Schlüsselbild

```
A sacred heavenly skyscape at first light, towering soft cumulus clouds glowing from within, pearl white, champagne gold, blush rose and soft lavender, gentle rays of light, luminous fine-art oil painting with delicate watercolor glazes, soft impasto in the cloud highlights, visible linen canvas texture and paper grain, subtle gold leaf shimmer along the cloud edges, airy negative space, serene, sacred, meditative, timeless, museum quality, in the spirit of J. M. W. Turner's light and Albert Bierstadt's skies --ar 3:2 --style raw --stylize 350 --no text, letters, words, watermark, signature, frame, border, people, buildings, cartoon, 3d render, CGI, plastic, harsh contrast, oversaturated, fantasy kitsch
```

---

## B. Die fünf Szenen (Hintergründe)

### B0 – Mitte / Ankommen

```
Vast panoramic sky at dawn seen from above the clouds, a calm luminous sea of clouds below, in the exact center a soft circular opening of radiant light where four gentle wind currents spiral inward and meet, very low horizon, wide calm empty sky in the center of the composition, pearl white, champagne gold, blush rose, soft lavender, luminous fine-art oil painting with delicate watercolor glazes, soft impasto in the cloud highlights, visible linen canvas texture, subtle gold leaf shimmer, serene, sacred, heavenly, museum quality, in the spirit of J. M. W. Turner's light --ar 21:9 --style raw --stylize 300 --sref STILREF-URL --sw 250 --no text, letters, words, watermark, signature, frame, border, people, buildings, animals, cartoon, 3d render, CGI, plastic, harsh contrast, oversaturated, fantasy kitsch
```

### B1 – Süden / Schlange / Loslassen

```
Warm golden hour sky over distant Andean foothills, amber, honey and apricot light, one long sinuous cloud winding gracefully across the whole sky like a gentle serpent, its form only softly suggested, translucent veils of cloud peeling away like shed skin and dissolving into warm light, a feeling of release and letting go, calm wide sky on the left third for text, luminous fine-art oil painting with delicate watercolor glazes, soft impasto in the cloud highlights, visible linen canvas texture, subtle gold leaf shimmer, serene, sacred, heavenly, museum quality, in the spirit of J. M. W. Turner's light --ar 21:9 --style raw --stylize 300 --sref STILREF-URL --sw 250 --no text, letters, words, watermark, signature, frame, border, people, buildings, realistic snake, scales, fangs, cartoon, 3d render, CGI, plastic, harsh contrast, oversaturated, fantasy kitsch
```

### B2 – Westen / Jaguar / Mut zur Tiefe

```
Deep twilight sky, dusky violet, indigo and smoky mauve with a last thin seam of gold on the horizon, heavy velvety clouds with soft shadowed depths, the silhouette of a calmly resting jaguar subtly formed by the darker clouds, discoverable only at second glance, the first stars appearing, a perfectly still mountain lake below mirroring the sky, quiet courage, mystery and depth, peaceful not frightening, calm open sky on the right third for text, luminous fine-art oil painting with delicate watercolor glazes, soft impasto, visible linen canvas texture, subtle gold leaf shimmer, sacred, museum quality, in the spirit of Albert Bierstadt's skies --ar 21:9 --style raw --stylize 300 --sref STILREF-URL --sw 250 --no text, letters, words, watermark, signature, frame, border, people, buildings, realistic big cat, teeth, aggressive, cartoon, 3d render, CGI, plastic, harsh contrast, oversaturated, fantasy kitsch
```

### B3 – Norden / Kolibri / Weisheit

```
Clear high-altitude morning sky above snow-capped Andean peaks, silver-blue, pale aquamarine and mother-of-pearl, crisp luminous air, delicate feathery cirrus clouds gracefully forming the outline of a hovering hummingbird with wings spread wide, only softly suggested, tiny points of fading starlight, a sense of ancestral wisdom, lightness and clarity, calm open sky on the left third for text, luminous fine-art oil painting with delicate watercolor glazes, soft impasto, visible linen canvas texture, subtle silver and gold leaf shimmer, serene, sacred, heavenly, museum quality --ar 21:9 --style raw --stylize 300 --sref STILREF-URL --sw 250 --no text, letters, words, watermark, signature, frame, border, people, buildings, realistic bird, cartoon, 3d render, CGI, plastic, harsh contrast, oversaturated, fantasy kitsch
```

### B4 – Osten / Kondor / Neubeginn

```
Sunrise breaking over a vast sea of clouds, rose gold, peach, soft coral and luminous ivory, the first rays of the sun fanning gently upward, broad cloud formations shaped like the outstretched wings of an Andean condor soaring across the horizon, only softly suggested, vision, new beginning, uplifting and expansive, calm open sky on the right third for text, luminous fine-art oil painting with delicate watercolor glazes, soft impasto in the cloud highlights, visible linen canvas texture, subtle gold leaf shimmer, serene, sacred, heavenly, museum quality, in the spirit of J. M. W. Turner's light --ar 21:9 --style raw --stylize 300 --sref STILREF-URL --sw 250 --no text, letters, words, watermark, signature, frame, border, people, buildings, realistic bird, beak, talons, cartoon, 3d render, CGI, plastic, harsh contrast, oversaturated, fantasy kitsch
```

---

## C. Wolken-Elemente für die Tiefenebenen

Diese Wolken werden einzeln übereinandergelegt und bewegen sich beim Scrollen
unterschiedlich schnell. Deshalb **auf reinem Schwarz** – daraus stellt Claude
sie sauber frei. Jeden Prompt mehrmals laufen lassen (`--repeat 3`), um
verschiedene Formen zu bekommen. Insgesamt reichen **8–10 schöne Wolken**.

### C1 – Einzelne große Wolke

```
A single soft cumulus cloud, isolated and complete, glowing pearl and champagne highlights with faint blush rose in the shadows, soft feathered edges, luminous fine-art oil painting with delicate watercolor glazes, soft impasto, centered on a pure flat black background, nothing else in the image --ar 3:2 --style raw --stylize 250 --sref STILREF-URL --sw 200 --no text, letters, watermark, signature, frame, sky, horizon, landscape, ground, gradient background, stars
```

### C2 – Lange, flache Wolkenbank

```
A single long horizontal band of soft stratus clouds, isolated and complete, delicate pearl, champagne gold and lavender, wispy torn edges, luminous fine-art oil painting with delicate watercolor glazes, centered on a pure flat black background, nothing else in the image --ar 4:1 --style raw --stylize 250 --sref STILREF-URL --sw 200 --no text, letters, watermark, signature, frame, sky, horizon, landscape, ground, gradient background, stars
```

### C3 – Kleine Wolkenfetzen

```
Three small separate wisps of cloud floating apart from each other, soft pearl and gold highlights, translucent edges, luminous oil and watercolor painting, on a pure flat black background, generous black space between them --ar 3:2 --style raw --stylize 250 --sref STILREF-URL --sw 200 --no text, letters, watermark, signature, frame, sky, horizon, landscape, ground, gradient background, stars
```

### C4 – Wolkentor (für den Klick-Übergang)

Zwei Wolkenwände, die sich beim Klick auf einen Wind öffnen.

```
A dense soft wall of luminous clouds filling the entire frame, parting slightly in the very middle to reveal a narrow vertical seam of warm golden light, pearl white and champagne gold, luminous fine-art oil painting with delicate watercolor glazes, soft impasto, serene and sacred --ar 16:9 --style raw --stylize 250 --sref STILREF-URL --sw 200 --no text, letters, watermark, signature, frame, people, buildings, animals
```

### C5 – Windschleier

Feine Windlinien, die über den Himmel ziehen.

```
Flowing translucent ribbons of wind spiraling gently through the air, painted as fine brushstrokes of brushed gold and pearl, delicate and airy, elegant spiral motion, on a pure flat black background, nothing else --ar 21:9 --style raw --stylize 250 --sref STILREF-URL --sw 150 --no text, letters, watermark, signature, frame, clouds, sky, landscape, stars
```

---

## D. Die vier Krafttier-Zeichen

Kleine, edle Goldzeichen für den Kompass und die Bereiche. Auf Schwarz, damit
sie freigestellt werden können. Claude kann die gewählten Zeichen danach als
scharfe Vektorgrafik (Goldlinie) nachzeichnen.

```
An elegant minimalist emblem of a serpent gently coiled into a spiral, drawn as a single continuous fine line of brushed gold leaf, sacred geometry, subtle Andean textile influence, perfectly centered on a pure flat black background, lots of empty space around it --ar 1:1 --style raw --stylize 150 --no text, letters, watermark, signature, frame, circle border, scales, fangs, realistic
```

```
An elegant minimalist emblem of a jaguar resting calmly in profile, drawn as a single continuous fine line of brushed gold leaf, sacred geometry, subtle Andean textile influence, perfectly centered on a pure flat black background, lots of empty space around it --ar 1:1 --style raw --stylize 150 --no text, letters, watermark, signature, frame, circle border, teeth, aggressive, realistic
```

```
An elegant minimalist emblem of a hovering hummingbird with wings spread, drawn as a single continuous fine line of brushed gold leaf, sacred geometry, subtle Andean textile influence, perfectly centered on a pure flat black background, lots of empty space around it --ar 1:1 --style raw --stylize 150 --no text, letters, watermark, signature, frame, circle border, realistic
```

```
An elegant minimalist emblem of an Andean condor soaring with wings fully outstretched, drawn as a single continuous fine line of brushed gold leaf, sacred geometry, subtle Andean textile influence, perfectly centered on a pure flat black background, lots of empty space around it --ar 1:1 --style raw --stylize 150 --no text, letters, watermark, signature, frame, circle border, talons, realistic
```

---

## E. Optional für das Beste: lebendiger Himmel als Video

Das Startbild (B0) leicht bewegt – Wolken ziehen kaum merklich, das Licht „atmet“.
Mit einem Bild-zu-Video-Werkzeug (z. B. **Runway**, **Kling** oder **Google Veo**),
B0 als erstes Bild, 8–10 Sekunden:

```
Camera completely static. The clouds drift extremely slowly from left to right, the light in the center gently breathes and glows, a few soft wisps move with the wind. Calm, meditative, seamless, no new objects appear, no camera movement, painterly look preserved.
```

Claude macht daraus eine nahtlose Endlosschleife und baut sie so ein, dass auf
Handys und bei „Bewegung reduzieren“ das Standbild erscheint.

---

## 6. Dateinamen fürs Hochladen

| Datei | Inhalt |
|---|---|
| `stil-schluessel.png` | A |
| `szene-mitte-quer.png`, `szene-mitte-hoch.png` | B0 |
| `szene-sueden-quer.png`, `szene-sueden-hoch.png` | B1 |
| `szene-westen-quer.png`, `szene-westen-hoch.png` | B2 |
| `szene-norden-quer.png`, `szene-norden-hoch.png` | B3 |
| `szene-osten-quer.png`, `szene-osten-hoch.png` | B4 |
| `wolke-01.png` … `wolke-10.png` | C1–C3 |
| `wolkentor.png` | C4 |
| `windschleier.png` | C5 |
| `zeichen-schlange.png`, `zeichen-jaguar.png`, `zeichen-kolibri.png`, `zeichen-kondor.png` | D |
| `himmel-loop.mp4` (optional) | E |

Bilder können auch nach und nach kommen – mit dem Stil-Schlüsselbild und B0
kann Claude schon den Prototyp der Startseite bauen.
