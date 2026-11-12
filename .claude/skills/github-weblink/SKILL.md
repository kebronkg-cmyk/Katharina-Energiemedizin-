---
name: github-weblink
description: Macht eine statische Website (HTML/CSS/JS) aus dem aktuellen Repository als Vorschau unter https://<owner>.github.io/<repo>/ erreichbar und gibt dem Nutzer die fertigen, klickbaren GitHub-Links mit genauen Einstellungen. Verwenden, wenn der Nutzer sagt „GitHub Weblink“, „schick mir den Link zur Vorschau“, „ich will die Seite auf GitHub sehen“, „GitHub Pages einrichten“ oder eine Vorschau-URL für eine Website will.
---

# GitHub Weblink

Ziel: Der Nutzer bekommt einen funktionierenden Vorschau-Link `https://<owner>.github.io/<repo>/` und eine kurze Klick-Anleitung mit **fertig ausgefüllten Links** (Owner, Repo und Branch eingesetzt). Er soll nichts suchen oder abtippen müssen.

## 1. Ausgangslage klären (selbst, ohne Rückfrage)

- `git remote get-url origin` → `<owner>` und `<repo>` ermitteln (Groß-/Kleinschreibung und Sonderzeichen wie ein `-` am Ende exakt übernehmen).
- Aktuellen Branch ermitteln: `git branch --show-current` → `<branch>`.
- Wo liegt die Website? Ordner mit der `index.html` finden (Hauptordner, `site/`, `public/`, `dist/` …) → `<ordner>`.
- Ist es eine reine statische Seite? Falls ein Build nötig ist (z. B. Vite, Next export), erst bauen und den Ausgabeordner als `<ordner>` nehmen.

## 2. Website für den Unterpfad vorbereiten

GitHub Pages liefert unter `/<repo>/` aus, nicht unter `/`. Deshalb:

- **Alle Pfade relativ machen:** `href="/css/…"` → `href="css/…"`, in Unterseiten `../css/…`. Gilt für `src`, `href`, `srcset`, CSS-`url(...)`, Pfade in JS (z. B. per `document.currentScript.src` als Basis) und `fetch`-Pfade.
- `<link rel="canonical">` und absolute Domain-Links nicht anfassen, sie dürfen absolut bleiben.
- Leere Datei `.nojekyll` in den veröffentlichten Ordner legen (sonst werden Ordner mit `_` ignoriert).
- Lokal testen, **unter dem Unterpfad**: z. B. Ordner unter `/tmp/test/<repo>/` verlinken, `python3 -m http.server` im Elternordner starten und `http://localhost:8000/<repo>/` mit Playwright öffnen. Prüfen: keine 404 bei CSS, JS, Bildern, Schriften; Unterseiten-Links funktionieren.
- Hinweis an den Nutzer, falls zutreffend: Formulare, die einen Server oder Dienst wie Netlify Forms brauchen, funktionieren auf GitHub Pages nicht.

## 3. Veröffentlichungsweg wählen

**Standard: GitHub Actions** (funktioniert mit jedem Ordner und auch auf einem Arbeitsbranch).

`.github/workflows/pages.yml` anlegen, `<ordner>` und `<branch>` einsetzen:

```yaml
# Veröffentlicht <ordner> auf GitHub Pages
name: GitHub Pages

on:
  push:
    branches: [main, <branch>]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: <ordner>        # "." wenn die Website im Hauptordner liegt
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Alternative: „Deploy from a branch“** nur, wenn die `index.html` direkt im Hauptordner (oder in `/docs`) liegt. Dann kein Workflow nötig, aber `.nojekyll` im Hauptordner.

Committen und pushen (eigener, klarer Commit).

## 4. Dem Nutzer die Klick-Anleitung schicken

Immer mit **eingesetzten** Werten, kurz und nummeriert. Vorlage:

> **1. GitHub Pages einschalten**
> https://github.com/<owner>/<repo>/settings/pages
> Unter „Build and deployment“ → „Source“ **GitHub Actions** wählen.
>
> **2. Den Arbeitsbranch freigeben** (nur nötig, wenn `<branch>` nicht `main` ist)
> https://github.com/<owner>/<repo>/settings/environments → **github-pages** → „Deployment branches and tags“ → „Add deployment branch or tag rule“ → `<branch>` eintragen.
> *Oder einfacher:* den Pull Request zusammenführen: https://github.com/<owner>/<repo>/pulls
>
> **3. Veröffentlichung starten**
> https://github.com/<owner>/<repo>/actions/workflows/pages.yml → **„Run workflow“** → Branch `<branch>` → grüner Button. Nach ca. 1 Minute ist die Seite da.
>
> **Dein Vorschau-Link:**
> https://<owner>.github.io/<repo>/

Bei „Deploy from a branch“ stattdessen: Source **Deploy from a branch** → Branch `<branch>` → Ordner `/ (root)` → Save.

Hinweis anfügen: Der Link aktualisiert sich ab jetzt bei jedem Push automatisch.

## 5. Prüfen, bevor „fertig“ gesagt wird

Nachdem der Nutzer die Schritte gemacht hat (oder bei jedem späteren Push):

```bash
for i in $(seq 1 20); do
  c=$(curl -s -o /dev/null -w '%{http_code}' "https://<owner>.github.io/<repo>/?v=$RANDOM")
  echo $c; [ "$c" = 200 ] && break; sleep 15
done
```

- Zusätzlich eine CSS- und eine Bild-URL prüfen (200) und einen Screenshot mit Playwright machen.
- 404 auf der Startseite: Pages noch nicht eingeschaltet, Workflow nicht gelaufen oder falscher `path`.
- README statt Website sichtbar: „Deploy from a branch“ zeigt auf einen Ordner ohne `index.html` → auf GitHub Actions umstellen oder `path` korrigieren.
- Seite ohne Styles: absolute Pfade übersehen (Schritt 2).
- Erst wenn alles 200 liefert und der Screenshot stimmt, dem Nutzer den Link als funktionierend melden.

## 6. Mehrere Fassungen als eigene Links

Will der Nutzer Varianten vergleichen, jede Fassung in einen Unterordner des veröffentlichten Ordners legen (`v2/`, `v3/` …). Links:
`https://<owner>.github.io/<repo>/v2/`, `…/v3/` usw. Pfade in den Unterordnern ebenfalls relativ halten.

## 7. Aktualisierungen sichtbar machen

Browser speichern CSS/JS bis zu einige Stunden. Nach Änderungen an CSS/JS die Verweise mit Versionskennung versehen (`style.css?v=<hash>`), damit Nutzer und Kunden sofort die neue Fassung sehen. Zum schnellen Ansehen einen Link mit `?neu=<zahl>` schicken.

## 8. Wichtige Hinweise für den Nutzer

- **Öffentlich:** Bei einem öffentlichen Repository kann jeder mit dem Link auch den Quellcode sehen (`github.com/<owner>/<repo>`). Bei vertraulichen Kundenprojekten darauf hinweisen.
- **Privates Repository:** Im kostenlosen GitHub-Plan gibt es dafür keine github.io-Seite. Dann einen anderen Hoster vorschlagen (z. B. Cloudflare Pages oder Netlify, beide kostenlos und mit privaten Repos nutzbar).
- **Suchmaschinen:** Für eine reine Vorschau `<meta name="robots" content="noindex">` setzen, damit die Testseite nicht bei Google erscheint. Vor dem echten Livegang wieder entfernen.
