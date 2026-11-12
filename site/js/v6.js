// Weg der vier Winde – v6 (Testfassung)
// Weiches Scrollen (Lenis), Szenenwechsel (GSAP), geführter Weg durch das
// Medizinrad mit Windübergängen und Seitenfenster für die Begleitungen.
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // Adressleiste am Handy löst keine Neuberechnung (und kein Springen) aus
  ScrollTrigger.config({ ignoreMobileResize: true });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var layer = function (name) { return document.querySelector('.sky-layer[data-scene="' + name + '"]'); };
  var winds = ["sueden", "westen", "norden", "osten"];
  // aus welcher Himmelsrichtung ein Wind hereinweht: Ursprung am Bildrand und Windrichtung
  var origin = { sueden: ["50%", "115%"], westen: ["-15%", "50%"], norden: ["50%", "-15%"], osten: ["115%", "50%"] };
  var blow = { sueden: [0, -1], westen: [1, 0], norden: [0, 1], osten: [-1, 0] };

  // ---------- weiches Scrollen ----------
  var lenis = null;
  if (!reduced && window.Lenis) {
    // lerp statt fester Dauer: gleitet gleichmäßig nach, ohne Anfahr-Ruck
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToTarget(target, opts) {
    if (lenis) lenis.scrollTo(target, opts || { duration: 2.4 });
    else target.scrollIntoView();
  }
  function jumpTo(target) {
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true }); else target.scrollIntoView();
    ScrollTrigger.update();
  }

  // ---------- Ankommen: in das Licht hineinfliegen ----------
  var hero = { trigger: "#ankommen", start: "top top", end: "bottom top", scrub: 1.2 };
  if (!reduced) gsap.to(layer("mitte").querySelector("img"), { scale: 1.45, ease: "none", scrollTrigger: hero });
  gsap.to(".hero-inner", { opacity: 0, y: reduced ? 0 : -80, ease: "none", scrollTrigger: { trigger: "#ankommen", start: "top top", end: "60% top", scrub: 1.2 } });
  gsap.to(".sky-veil", { opacity: 1, ease: "none", scrollTrigger: { trigger: "#willkommen", start: "top bottom", end: "top 30%", scrub: 1.2 } });

  // ---------- die vier Winde: Himmel wechselt die Stimmung ----------
  var fades = [];
  winds.forEach(function (name) {
    var section = document.getElementById(name);
    var el = layer(name);
    fades.push(gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 90%", end: "top 10%", scrub: 1.2 } }));
    ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom top", onToggle: function (self) { el.classList.toggle("is-live", self.isActive); } });
    if (!reduced) {
      gsap.fromTo(el.querySelector("img"), { scale: 1.14 }, { scale: 1, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    }
  });
  // überdeckte Himmel gar nicht mehr zeichnen: ist ein Wind ganz da, verschwinden die Ebenen darunter
  var stack = [layer("mitte"), document.querySelector(".sky-veil")];
  winds.forEach(function (name, i) {
    var below = stack.concat(winds.slice(0, i).map(layer));
    ScrollTrigger.create({ trigger: document.getElementById(name), start: "top 8%",
      onEnter: function () { below.forEach(function (el) { el.classList.add("is-covered"); }); },
      onLeaveBack: function () { below.forEach(function (el) { el.classList.remove("is-covered"); }); } });
  });
  ScrollTrigger.create({ trigger: "#ankommen", endTrigger: "#kompass", start: "top top", end: "bottom top", onToggle: function (self) { layer("mitte").classList.toggle("is-live", self.isActive); } });
  layer("mitte").classList.add("is-live");
  gsap.to(".sky-dawn", { opacity: 1, ease: "none", scrollTrigger: { trigger: "#begleitungen", start: "top bottom", end: "top 25%", scrub: 1.2 } });

  // ---------- Inhalte steigen sanft auf ----------
  if (!reduced) {
    gsap.utils.toArray(".rise").forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 46, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    // Fotos und Gemälde schweben beim Scrollen leicht gegen die Bewegung
    gsap.utils.toArray(".welcome-photo img, .energy-art img, .depth-art, .joy-photo, .side-photo-art, .head-photo").forEach(function (el) {
      gsap.fromTo(el, { yPercent: 5 }, { yPercent: -5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    });
    // Mensch. Tier. Pflanze. … erscheinen nacheinander
    gsap.from(".energy-list span", { opacity: 0, y: 14, duration: .9, stagger: .22, ease: "power2.out", scrollTrigger: { trigger: ".energy-list", start: "top 85%", once: true } });
    // der Weg im Medizinrad zeichnet sich: Süden, Westen, Norden, Osten
    gsap.fromTo(".compass-lines .route", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut", scrollTrigger: { trigger: ".compass-rose", start: "top 70%", once: true } });
    gsap.fromTo(".compass-lines .route-tip", { opacity: 0 }, { opacity: 1, duration: .6, delay: 2.4, scrollTrigger: { trigger: ".compass-rose", start: "top 70%", once: true } });
    // vom Funktionieren ins Wahrnehmen: Zeile für Zeile
    gsap.utils.toArray(".shift-rows li").forEach(function (row) {
      gsap.timeline({ scrollTrigger: { trigger: row, start: "top 85%", once: true } })
        .from(row.querySelector(".from"), { opacity: 0, x: -20, duration: .8, ease: "power2.out" })
        .from(row.querySelector(".to"), { opacity: 0, x: 20, duration: .9, ease: "power2.out" }, .35);
    });
  }

  // ---------- Endlos-Animationen nur, solange ihr Abschnitt zu sehen ist ----------
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("is-off", !en.isIntersecting); });
    }, { rootMargin: "10% 0px" });
    document.querySelectorAll("main > section").forEach(function (sec) { io.observe(sec); });
  }

  // ---------- Natur: die Passionsblume öffnet sich Bild für Bild ----------
  (function () {
    var wrap = document.querySelector(".bloom-scroll");
    if (!wrap) return;
    var canvas = wrap.querySelector(".bloom-canvas"), ctx = canvas.getContext("2d");
    var COUNT = +wrap.dataset.frames || 95;
    var small = window.matchMedia("(max-width: 760px)").matches;
    // Bilder relativ zum Skript laden, damit es auch in Kopien der Seite in Unterordnern klappt
    var here = document.querySelector('script[src$="js/v6.js"]');
    var base = here ? here.src.replace(/js\/v6\.js.*$/, "") : "";
    var dir = base + "assets/bloom-frames/" + (small ? "880" : "1160") + "/f";
    var frames = new Array(COUNT), started = false, pos = 0, shown = -1, queued = false;
    function src(i) { return dir + String(i + 1).padStart(3, "0") + ".webp"; }
    function load(i) {
      return new Promise(function (res) {
        var img = new Image();
        img.decoding = "async";
        img.onload = function () { (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(function () { frames[i] = img; request(); res(); }); };
        img.onerror = res;
        img.src = src(i);
      });
    }
    // alle Bilder vorladen: erst grob (jedes 8., 4., 2. Bild), dann den Rest.
    // So läuft die Animation auch bei langsamem Handynetz sofort und wird dann feiner.
    function preloadAll() {
      if (started) return;
      started = true;
      var order = [], seen = {};
      [8, 4, 2, 1].forEach(function (step) {
        for (var k = 0; k < COUNT; k += step) if (!seen[k]) { seen[k] = 1; order.push(k); }
      });
      if (!seen[COUNT - 1]) order.push(COUNT - 1);
      var next = 0;
      function worker() { if (next >= order.length) return Promise.resolve(); var i = order[next++]; return (frames[i] ? Promise.resolve() : load(i)).then(worker); }
      for (var w = 0; w < 4; w++) worker();
    }
    // Canvas in Gerätepixeln (scharf auf Retina); die freigestellte Blüte wird ganz gezeigt
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; ctx.imageSmoothingQuality = "high"; shown = -1; request(); }
    }
    function nearest(i) { for (var d = 0; d < COUNT; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; } return null; }
    function put(img, alpha) {
      var cw = canvas.width, ch = canvas.height, sc = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      var w = img.naturalWidth * sc, h = img.naturalHeight * sc;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    // zwischen zwei Bildern weich überblenden: die Bewegung wirkt flüssiger als die 18 Bilder pro Sekunde des Videos
    function draw() {
      queued = false;
      var i = Math.floor(pos), f = pos - i, a = frames[i] || nearest(i), b = frames[Math.min(i + 1, COUNT - 1)];
      var key = Math.round(pos * 8);
      if (!a || key === shown) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // additiv mischen: (1 − f) · A + f · B ergibt exakt die Zwischenstufe,
      // ohne dass halbtransparente Ränder kurz dichter werden (kein Hell-dunkel-Flackern)
      if (b && b !== a && f > .02) {
        ctx.globalCompositeOperation = "lighter";
        put(a, 1 - f);
        put(b, f);
        ctx.globalCompositeOperation = "source-over";
      } else put(a, 1);
      ctx.globalAlpha = 1;
      shown = key;
    }
    function request() { if (!queued) { queued = true; requestAnimationFrame(draw); } }
    window.addEventListener("resize", size);
    // Canvas-Größe nachziehen, wenn sich das Layout ändert (sonst wirkt die Blüte verzerrt)
    if ("ResizeObserver" in window) new ResizeObserver(size).observe(canvas);
    load(0).then(function () { size(); request(); });
    // spätestens kurz nach dem Laden der Seite, sonst sobald die Blüte in die Nähe kommt
    window.addEventListener("load", function () { setTimeout(preloadAll, 1200); });
    if ("IntersectionObserver" in window) {
      var near = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { preloadAll(); near.disconnect(); } }, { rootMargin: "400% 0px" });
      near.observe(wrap);
    } else preloadAll();

    var steps = gsap.utils.toArray(".bloom-step", wrap);
    var copy = wrap.querySelector(".bloom-copy");
    var seq = { f: 0 };
    var stage = wrap.querySelector(".bloom-stage");
    function open(tl, trigger, len) {
      return tl
        .to(seq, { f: COUNT - 1, ease: "sine.inOut", duration: len, onUpdate: function () { pos = seq.f; request(); } }, 0)
        .fromTo(".bloom-view canvas", { scale: .94 }, { scale: 1, ease: "sine.inOut", duration: len }, 0)
        // Lichtkreise öffnen sich Schicht für Schicht
        .fromTo(".bl-r1", { scale: .55, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: "sine.out", duration: .35 * len }, .1 * len)
        .fromTo(".bl-r2", { scale: .55, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: "sine.out", duration: .35 * len }, .35 * len)
        .fromTo(".bl-r3", { scale: .55, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: "sine.out", duration: .35 * len }, .6 * len);
    }
    var mm = gsap.matchMedia();
    // Computer: Die Blüte steht fest, der Text scrollt ganz normal vorbei. Die Blüte öffnet sich
    // mit dem Lesefortschritt; der Abschnitt, der gerade gelesen wird, ist hell, die anderen ruhen.
    mm.add("(min-width: 761px)", function () {
      open(gsap.timeline({ scrollTrigger: { trigger: copy, start: "top 70%", end: "bottom 75%", scrub: .6 } }), copy, 1);
      steps.forEach(function (st) {
        ScrollTrigger.create({ trigger: st, start: "top 68%", end: "bottom 32%", toggleClass: "is-on" });
      });
    });
    // Handy: Blüte und Text stehen still. Beim Scrollen öffnet sich die Blüte und unter ihr
    // wechselt sanft ein Satz nach dem anderen; nichts gleitet unter die Blüte.
    mm.add("(max-width: 760px)", function () {
      wrap.classList.add("bloom-fixed");
      function place() { wrap.style.setProperty("--copy-top", Math.round((parseFloat(getComputedStyle(stage).top) || 0) + stage.offsetHeight) + "px"); }
      place();
      var current = -1;
      function show(i) {
        if (i === current) return;
        current = i;
        steps.forEach(function (st, k) { st.classList.toggle("is-on", k === i); });
      }
      show(0);
      // die Blüte ist ganz offen, wenn der letzte Satz erscheint, und bleibt dann noch stehen
      open(gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: .6 } }), wrap, .85).set({}, {}, 1);
      ScrollTrigger.create({ trigger: wrap, start: "top top", end: "bottom bottom", onRefreshInit: place,
        onUpdate: function (self) { show(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))); } });
      return function () { wrap.classList.remove("bloom-fixed"); steps.forEach(function (st) { st.classList.remove("is-on"); }); };
    });
  })();

  // ---------- Bilder erst zeigen, wenn sie geladen sind: kein leerer Rahmen, kein Aufblitzen ----------
  document.querySelectorAll("main img[loading='lazy']").forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    img.style.opacity = "0";
    function show() {
      img.style.opacity = "";
      if (img.animate) img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: "ease-out" });
    }
    // erst entpacken, dann zeigen: so stockt das erste Zeichnen beim Scrollen nicht
    img.addEventListener("load", function () {
      if (img.decode) img.decode().then(show, show); else show();
    }, { once: true });
    img.addEventListener("error", function () { img.style.opacity = ""; }, { once: true });
  });

  // ---------- Kontaktformular: öffnet das E-Mail-Programm mit der fertigen Nachricht ----------
  var form = document.querySelector("form[data-mail]");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var body = "Name: " + f.name.value.trim() + "\nErreichbar unter: " + f.kontakt.value.trim() + "\n\n" + f.nachricht.value.trim();
    window.location.href = "mailto:" + form.dataset.mail + "?subject=" + encodeURIComponent("Nachricht über die Website") + "&body=" + encodeURIComponent(body);
  });

  // ---------- WhatsApp: erscheint erst, wenn eine Nummer hinterlegt ist ----------
  document.querySelectorAll(".wa-link").forEach(function (a) {
    var n = (a.dataset.wa || "").replace(/\D/g, "");
    if (!n) return;
    a.href = "https://wa.me/" + n;
    document.querySelectorAll(".wa-row").forEach(function (r) { r.hidden = false; });
  });

  // ---------- Windrose, Leiste und Wegweiser: wo bin ich ----------
  var bar = document.querySelector(".bar");
  var rose = document.querySelector(".rose");
  var journey = document.querySelector(".journey");
  var current = -1;
  ["ankommen"].concat(winds, ["begleitungen"]).forEach(function (name) {
    var link = rose.querySelector('[data-for="' + name + '"]');
    var section = document.getElementById(name);
    var end = name === "ankommen" ? document.getElementById("kompass") : section;
    ScrollTrigger.create({
      trigger: section, endTrigger: end, start: "top 50%", end: "bottom 50%",
      onToggle: function (self) {
        link.classList.toggle("is-active", self.isActive);
        if (name === "westen") {
          [bar, rose, journey].forEach(function (el) { el.classList.toggle("is-dark", self.isActive); });
        }
        var i = winds.indexOf(name);
        if (i < 0) return;
        if (self.isActive) { current = i; showStation(i); }
        else if (current === i) { current = -1; journey.classList.remove("is-on"); }
      }
    });
  });
  function showStation(i) {
    var s = document.getElementById(winds[i]);
    journey.querySelector(".journey-no").textContent = s.dataset.no;
    journey.querySelector(".journey-name").textContent = s.dataset.label;
    journey.classList.add("is-on");
  }
  journey.querySelectorAll(".journey-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { step(+btn.dataset.step); });
  });
  // eine Station weiter oder zurück; vor dem Süden liegt das Medizinrad, nach dem Osten die Übersicht
  function step(dir) {
    if (current < 0) return;
    var next = current + dir;
    if (next < 0) return scrollToTarget(document.getElementById("kompass"));
    if (next >= winds.length) return scrollToTarget(document.getElementById("begleitungen"));
    travel(winds[next]);
  }

  // ---------- Windböe: feine, geschwungene Windfäden und Nebelschleier ----------
  function gust(v, dur, parent) {
    var holder = parent;
    if (!holder) { holder = document.createElement("div"); holder.className = "travel"; document.body.appendChild(holder); }
    var c = document.createElement("canvas");
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    var g = c.getContext("2d"); g.scale(dpr, dpr);
    holder.appendChild(c);
    var span = v[0] ? W : H, across = v[0] ? H : W;
    var threads = [], puffs = [];
    for (var k = 0; k < (W < 700 ? 48 : 84); k++) {
      threads.push({
        start: -Math.random() * span * .5, side: Math.random() * across,
        speed: (.75 + Math.random() * .9) * span * 1.15, delay: Math.random() * dur * .42,
        amp: 14 + Math.random() * 70, freq: 1.4 + Math.random() * 2.6, ph: Math.random() * 6.3,
        w: .5 + Math.random() * 1.9, a: .35 + Math.random() * .55, gold: Math.random() < .3, trail: []
      });
    }
    for (k = 0; k < 7; k++) puffs.push({ start: -Math.random() * span * .4, side: Math.random() * across, speed: (.5 + Math.random() * .5) * span, r: 120 + Math.random() * 220, delay: Math.random() * .4 });
    // Punkt in Bildschirmkoordinaten: entlang der Windrichtung plus seitliches Wehen
    function at(along, side) {
      if (v[0] > 0) return [along, side]; if (v[0] < 0) return [W - along, side];
      if (v[1] > 0) return [side, along]; return [side, H - along];
    }
    var t0 = performance.now();
    (function frame(now) {
      var t = (now - t0) / 1000;
      g.clearRect(0, 0, W, H);
      var fade = Math.max(0, 1 - Math.max(0, t - (dur - .6)) / .6);
      puffs.forEach(function (p) {
        var lt = t - p.delay; if (lt < 0) return;
        var q = at(p.start + lt * p.speed, p.side + Math.sin(lt * 1.3) * 30);
        var rg = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], p.r);
        rg.addColorStop(0, "rgba(255,250,238," + (.28 * fade * Math.min(1, lt * 3)) + ")"); rg.addColorStop(1, "rgba(255,250,238,0)");
        g.fillStyle = rg; g.fillRect(q[0] - p.r, q[1] - p.r, p.r * 2, p.r * 2);
      });
      g.lineCap = "round";
      threads.forEach(function (th) {
        var lt = t - th.delay; if (lt < 0) return;
        th.trail.push(at(th.start + lt * th.speed, th.side + Math.sin(lt * th.freq + th.ph) * th.amp + Math.sin(lt * 7 + th.ph) * 4));
        if (th.trail.length > 24) th.trail.shift();
        var life = Math.min(1, lt / .2) * fade * th.a;
        for (var i = 1; i < th.trail.length; i++) {
          var f = i / th.trail.length;
          g.strokeStyle = th.gold ? "rgba(232,205,148," + (life * f) + ")" : "rgba(255,251,240," + (life * f) + ")";
          g.lineWidth = th.w * (.4 + f);
          g.beginPath(); g.moveTo(th.trail[i - 1][0], th.trail[i - 1][1]); g.lineTo(th.trail[i][0], th.trail[i][1]); g.stroke();
        }
      });
      if (t < dur) requestAnimationFrame(frame);
      else if (!parent) holder.remove(); else c.remove();
    })(t0);
  }

  // ---------- Windübergang: die Böe trägt die Seite fort, der echte Himmel öffnet sich ----------
  var busy = false;
  var main = document.querySelector("main");
  // Deckkraft aller Himmel sofort auf den Stand der neuen Position setzen (kein Nachziehen, kein Flackern)
  function settleSky() {
    fades.forEach(function (tw) { var t = tw.scrollTrigger && tw.scrollTrigger.getTween(); if (t) t.progress(1); });
  }
  function travel(name, ox, oy) {
    var target = document.getElementById(name);
    if (!target || busy) return;
    if (reduced) { jumpTo(target); return; }
    busy = true;
    var v = blow[name];
    var lay = layer(name), img = lay.querySelector("img");
    lay.style.setProperty("--x", ox || origin[name][0]);
    lay.style.setProperty("--y", oy || origin[name][1]);
    lay.style.setProperty("--r", "0%");
    lay.classList.remove("is-covered");
    lay.classList.add("is-opening");
    gsap.set(lay, { autoAlpha: 1 });
    gust(v, 2.8);
    gsap.timeline()
      // die Böe erfasst die Seite und trägt sie fort
      .to(main, { x: v[0] * 70, y: v[1] * 40, opacity: 0, filter: "blur(5px)", duration: .95, ease: "power2.in" }, 0)
      // der neue Himmel weht aus seiner Richtung herein und wird klar
      .to(lay, { "--r": "180%", duration: 1.7, ease: "power2.inOut" }, .2)
      .fromTo(img, { filter: "blur(18px)" }, { filter: "blur(0px)", duration: 1.7, ease: "power2.out" }, .2)
      // unsichtbar an die neue Stelle, der Himmel steht schon
      .add(function () {
        jumpTo(target);
        settleSky();
        lay.classList.remove("is-opening");
        lay.style.removeProperty("--r");
        img.style.filter = "";
      }, 1.95)
      // der Inhalt weht mit dem Wind herein
      .fromTo(main, { x: -v[0] * 50, y: -v[1] * 30, opacity: 0, filter: "blur(5px)" },
        { x: 0, y: 0, opacity: 1, filter: "blur(0px)", duration: 1.15, ease: "power3.out", clearProps: "transform,opacity,filter" }, 2.0)
      .add(function () { busy = false; }, 3.1);
  }
  document.querySelectorAll("[data-travel]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); travel(a.dataset.travel); });
  });

  // Wischen zur Seite wechselt zwischen den Winden (Handy und Tablet)
  var touch = null;
  document.addEventListener("touchstart", function (e) {
    var t = e.touches[0];
    // nicht in Wisch-Leisten und nicht am Bildschirmrand (Zurück-Geste)
    if (current < 0 || e.touches.length > 1 || t.clientX < 30 || t.clientX > window.innerWidth - 30 || e.target.closest(".ask-list, .prices, .wheel, .sheet, input, textarea")) { touch = null; return; }
    touch = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!touch) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touch.x, dy = t.clientY - touch.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && Date.now() - touch.time < 800) step(dx < 0 ? 1 : -1);
    touch = null;
  }, { passive: true });

  // Pfeiltasten links und rechts am Computer
  document.addEventListener("keydown", function (e) {
    if (current < 0 || sheetOpen || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  });

  // ---------- Navigation: ruhig durch den Himmel gleiten ----------
  document.querySelectorAll('.bar a[href^="#"], .rose a, .gate:not([data-travel]), main a.btn[href^="#"]:not([data-travel]), .foot a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });

  // ---------- Medizinrad: Medaillons zur Information ----------
  // Sie öffnen keine Seite. Beim Hereinscrollen leuchten sie der Reihe nach auf
  // (Süden, Westen, Norden, Osten). Beim Darüberfahren oder Antippen tritt ein
  // Medaillon hervor, zusammen mit seiner Beschreibung darunter, und umgekehrt.
  var cards = document.querySelectorAll(".wind-card"), quals = document.querySelectorAll(".qualities li[data-wind]");
  function light(wind, on) {
    cards.forEach(function (c) { c.classList.toggle("is-lit", on && c.dataset.wind === wind); });
    quals.forEach(function (q) { q.classList.toggle("is-lit", on && q.dataset.wind === wind); });
  }
  [cards, quals].forEach(function (list) {
    list.forEach(function (el) {
      el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") light(el.dataset.wind, true); });
      el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") light(el.dataset.wind, false); });
      el.addEventListener("click", function () { light(el.dataset.wind, !el.classList.contains("is-lit")); });
    });
  });
  var rose = document.querySelector(".compass-rose");
  if (rose && !reduced) {
    ScrollTrigger.create({ trigger: rose, start: "top 70%", once: true, onEnter: function () {
      ["sueden", "westen", "norden", "osten"].forEach(function (w, i) {
        setTimeout(function () { light(w, true); }, 400 + i * 650);
      });
      setTimeout(function () { light("", false); }, 400 + 4 * 650 + 300);
    } });
  }

  // ---------- Menü am Handy ----------
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    bar.classList.toggle("menu-open", open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("is-open"); }); });
      if (lenis) lenis.stop();
    } else {
      menu.classList.remove("is-open");
      if (lenis) lenis.start();
      setTimeout(function () { if (menuBtn.getAttribute("aria-expanded") === "false") menu.hidden = true; }, 500);
    }
  }
  menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      setMenu(false);
      var href = a.getAttribute("href");
      if (href.charAt(0) !== "#") return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) setTimeout(function () { scrollToTarget(target, { duration: 1.8 }); }, 120);
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false); });

  // ---------- Seitenfenster: Begleitung aufklappen ----------
  var sheet = document.querySelector(".sheet");
  var panel = sheet.querySelector(".sheet-panel");
  var sheetOpen = false, opener = null;
  function openOffer(id, btn) {
    var src = document.querySelector('.offer-store [data-id="' + id + '"]');
    if (!src) return;
    opener = btn;
    sheet.querySelector(".sheet-wind").textContent = src.dataset.wind;
    sheet.querySelector(".sheet-body").innerHTML = src.innerHTML;
    sheet.querySelector(".sheet-body h3").id = "sheet-title";
    panel.scrollTop = 0;
    sheet.hidden = false;
    if (lenis) lenis.stop();
    sheetOpen = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.classList.add("is-open"); }); });
    sheet.querySelector(".sheet-close").focus({ preventScroll: true });
  }
  function closeOffer() {
    if (!sheetOpen) return;
    sheetOpen = false;
    sheet.classList.remove("is-open");
    if (lenis) lenis.start();
    setTimeout(function () { if (!sheetOpen) sheet.hidden = true; }, reduced ? 0 : 700);
    if (opener) opener.focus({ preventScroll: true });
  }
  document.querySelectorAll("[data-offer]").forEach(function (btn) {
    btn.addEventListener("click", function () { openOffer(btn.dataset.offer, btn); });
  });
  sheet.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      closeOffer();
      if (el.matches("a[href^='#']")) { e.preventDefault(); scrollToTarget(document.querySelector(el.getAttribute("href"))); }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (!sheetOpen) return;
    if (e.key === "Escape") closeOffer();
    // Fokus bleibt im Fenster
    if (e.key === "Tab") {
      var f = panel.querySelectorAll("button, a[href]");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---------- Handy: Punkte unter dem Rad der Begleitungen ----------
  var wheel = document.querySelector(".wheel");
  var dots = document.querySelector(".wheel-dots");
  // Reihenfolge beim Wischen: Herzstück, dann Süden, Westen, Norden, Osten
  var order = [wheel.querySelector(".wheel-heart")].concat(winds.map(function (w) { return wheel.querySelector('.wheel-q[data-wind="' + w + '"]'); }));
  order.forEach(function (el, i) { el.style.order = i; dots.appendChild(document.createElement("span")); });
  function markDot() {
    var mid = wheel.scrollLeft + wheel.clientWidth / 2, best = 0, dist = Infinity;
    order.forEach(function (el, i) { var c = el.offsetLeft + el.offsetWidth / 2; if (Math.abs(c - mid) < dist) { dist = Math.abs(c - mid); best = i; } });
    dots.querySelectorAll("span").forEach(function (s, i) { s.classList.toggle("is-active", i === best); });
  }
  wheel.addEventListener("scroll", markDot, { passive: true });
  markDot();

  // Handy: Preis-Leiste beim Laden auf die Empfehlung in der Mitte stellen
  var prices = document.querySelector(".prices");
  var featured = document.querySelector(".price--featured");
  function centerFeatured() {
    if (prices && featured && prices.scrollWidth > prices.clientWidth) {
      prices.scrollLeft = featured.offsetLeft - (prices.clientWidth - featured.offsetWidth) / 2;
    }
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); centerFeatured(); markDot(); });
  // Am Handy laden Bilder und Schriften nach und verschieben die Seite:
  // dann alle Scroll-Punkte neu berechnen (nur bei echter Höhenänderung)
  if ("ResizeObserver" in window) {
    var lastH = 0, refreshTimer;
    new ResizeObserver(function () {
      var h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    }).observe(document.querySelector("main"));
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
