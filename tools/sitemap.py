"""Schreibt sitemap.xml und robots.txt für die Website.

Aufruf:  python3 tools/sitemap.py [https://eigene-domain.de]

Ohne Angabe wird die bisherige Testadresse verwendet. Beim Umzug auf die eigene
Domain einmal mit der neuen Adresse aufrufen. Der alte, geheime Pfad wird bewusst
nicht erwähnt (auch nicht in robots.txt), damit er nicht bekannt wird.
"""
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "site"
BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://blaufuchs-m8t3.pages.dev").rstrip("/")

PAGES = [
    ("", "1.0"),
    ("ueber-mich/", "0.8"),
    ("illumination/", "0.8"),
    ("cord-cutting/", "0.8"),
    ("entkopplung/", "0.8"),
    ("taeter-opfer-retter-dreieck/", "0.8"),
    ("extraktion/", "0.8"),
    ("rueckverbindung-seelenrueckholung/", "0.8"),
    ("innere-landkarte/", "0.8"),
    ("kreative-integration/", "0.7"),
    ("lebensspuren/", "0.6"),
    ("impressum/", "0.2"),
    ("datenschutz/", "0.2"),
]

today = date.today().isoformat()
urls = "\n".join(
    f"  <url><loc>{BASE}/{p}</loc><lastmod>{today}</lastmod><priority>{prio}</priority></url>"
    for p, prio in PAGES if (ROOT / p / "index.html").exists()
)
(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "\n</urlset>\n", encoding="utf-8")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n", encoding="utf-8")
print("sitemap.xml und robots.txt für", BASE)
