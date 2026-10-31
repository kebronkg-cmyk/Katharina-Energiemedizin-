"""Hängt an alle Verweise auf CSS- und JS-Dateien eine Versionskennung (?v=…) an.

Aufruf:  python3 tools/versionen.py

Browser behalten CSS und JS einige Stunden im Speicher. Ändert sich eine Datei, ändert
sich die Kennung, und jeder Besucher lädt sofort die neue Fassung. Nach jeder Änderung an
CSS oder JS einmal ausführen (mehrfach ausführbar).
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "site"


def stamp(path):
    return hashlib.md5(path.read_bytes()).hexdigest()[:8]


def build():
    pattern = re.compile(r'((?:href|src)=")((?:\.\./)*)((?:css|js)/[\w.-]+\.(?:css|js))(?:\?v=\w+)?(")')
    cache = {}
    for page in ROOT.rglob("index.html"):
        text = page.read_text(encoding="utf-8")

        def fix(m):
            name = m.group(3)
            path = (page.parent / (m.group(2) + name)).resolve()
            if not path.exists():
                return m.group(0)
            if path not in cache:
                cache[path] = stamp(path)
            return f"{m.group(1)}{m.group(2)}{name}?v={cache[path]}{m.group(4)}"

        new = pattern.sub(fix, text)
        if new != text:
            page.write_text(new, encoding="utf-8")
            print("aktualisiert", page.relative_to(ROOT))


if __name__ == "__main__":
    build()
