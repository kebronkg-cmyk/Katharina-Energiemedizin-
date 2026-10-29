// Weg der vier Winde – v6, Unterseiten: weiches Scrollen, sanftes Aufsteigen,
// Menü am Handy und die Passionsblume
(function () {
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  var bar = document.querySelector(".bar");
  var lenis = null;
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
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false); });
  }

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

  // Galerie: Bild groß öffnen
  var light = document.querySelector(".g-light");
  if (light && light.showModal) {
    var big = light.querySelector("img"), cap = light.querySelector(".g-cap"), from = null;
    // per Delegation, damit auch die verdoppelten Bilder der Galerie-Reihen reagieren
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".g-open");
      if (!btn) return;
      var img = btn.querySelector("img");
      big.src = img.currentSrc || img.src; big.alt = img.alt;
      // erst das schon geladene Vorschaubild, dann ohne Aufblitzen die große Fassung
      if (img.dataset.full) { var hi = new Image(); hi.onload = function () { if (big.alt === img.alt) big.src = hi.src; }; hi.src = img.dataset.full; }
      var fc = btn.parentElement.querySelector("figcaption");
      cap.textContent = fc ? Array.prototype.map.call(fc.children.length ? fc.children : [fc], function (x) { return x.textContent; }).join(" · ") : "";
      from = btn; light.showModal();
    });
    function close() { light.close(); if (from) from.focus({ preventScroll: true }); }
    light.querySelector(".g-close").addEventListener("click", close);
    light.addEventListener("click", function (e) { if (e.target === light) close(); });
  }

  // Galerie: jede Reihe zieht langsam von selbst weiter (die zweite gegenläufig) und lässt
  // sich zugleich wischen, mit der Maus ziehen oder mit dem Trackpad seitlich schieben.
  // Bewegt wird nur per transform, auf Bruchteile eines Pixels genau: so läuft nichts ruckelig.
  // Jede Reihe ist einmal verdoppelt, damit sie endlos und ohne Sprung weiterläuft.
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dragged = false;
  document.querySelectorAll(".gw-row").forEach(function (row, n) {
    var track = row.querySelector(".gw-track");
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (it) {
      var c = it.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.querySelector("button").tabIndex = -1;
      track.appendChild(c);
    });
    var dir = n % 2 ? -1 : 1, cruise = calm ? 0 : 26;
    var half = 0, o = 0, v = dir * cruise, hover = false, held = false, last = 0, seen = true, running = false;
    function measure() { half = track.scrollWidth / 2; }
    function place() {
      if (half) { o %= half; if (o < 0) o += half; }
      track.style.transform = "translate3d(" + (-o).toFixed(2) + "px,0,0)";
    }
    function tick(t) {
      var dt = last ? Math.min(t - last, 50) / 1000 : 0; last = t;
      if (!held) {
        // weich zurück zur Reisegeschwindigkeit, beim Darüberfahren mit der Maus weich anhalten
        var goal = hover ? 0 : dir * cruise;
        v += (goal - v) * Math.min(1, dt * (hover ? 4 : 1.2));
        if (hover && Math.abs(v) < 1) v = 0;
        if (v) { o += v * dt; place(); }
      }
      if (seen && !document.hidden) requestAnimationFrame(tick); else { running = false; last = 0; }
    }
    function run() { if (!running) { running = true; last = 0; requestAnimationFrame(tick); } }
    measure(); place();
    if (dir < 0) { o = half * 0.37; place(); }
    window.addEventListener("load", function () { measure(); place(); });
    window.addEventListener("resize", function () { measure(); place(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; if (seen) run(); }).observe(row);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) run(); });
    row.addEventListener("mouseenter", function () { hover = true; });
    row.addEventListener("mouseleave", function () { hover = false; });

    // Trackpad: seitliches Wischen (oder Umschalt + Mausrad) verschiebt die Reihe;
    // senkrechtes Scrollen bleibt ganz normal bei der Seite
    row.addEventListener("wheel", function (e) {
      var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!dx) return;
      e.preventDefault();
      o += dx; v = 0; place();
    }, { passive: false });

    // Wischen und Ziehen: senkrechte Bewegungen übernimmt der Browser (touch-action: pan-y)
    var id = null, x0 = 0, y0 = 0, oStart = 0, lastX = 0, lastT = 0, vel = 0, horiz = false;
    row.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      id = e.pointerId; x0 = lastX = e.clientX; y0 = e.clientY; lastT = e.timeStamp; oStart = o; vel = 0; horiz = false; dragged = false;
    });
    row.addEventListener("pointermove", function (e) {
      if (e.pointerId !== id) return;
      var dx = e.clientX - x0;
      if (!horiz) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - y0)) return;
        horiz = true; held = true; dragged = true; row.classList.add("is-dragging");
        try { row.setPointerCapture(id); } catch (err) {}
      }
      var dt = Math.max(e.timeStamp - lastT, 1);
      vel = vel * 0.6 + (-(e.clientX - lastX) / dt * 1000) * 0.4;
      lastX = e.clientX; lastT = e.timeStamp;
      o = oStart - dx; place();
    });
    function end(e) {
      if (e.pointerId !== id) return;
      id = null;
      if (!horiz) return;
      held = false; row.classList.remove("is-dragging");
      // Schwung mitnehmen, dann gleitet die Reihe weich in den Selbstlauf zurück
      v = Math.max(-2400, Math.min(2400, vel)); last = 0; run();
    }
    row.addEventListener("pointerup", end);
    row.addEventListener("pointercancel", end);
    run();
  });
  // Rahmen erst zeigen, wenn das Bild da ist: kein leerer goldener Kasten beim Laden
  document.querySelectorAll(".g-open img").forEach(function (img) {
    var box = img.parentElement;
    function show() { box.classList.add("is-in"); }
    if (img.complete && img.naturalWidth) show(); else { img.addEventListener("load", show); img.addEventListener("error", show); }
  });
  // nach dem Ziehen kein Bild aus Versehen öffnen
  document.addEventListener("click", function (e) {
    if (dragged && e.target.closest(".gw-row")) { e.preventDefault(); e.stopImmediatePropagation(); dragged = false; }
  }, true);

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  gsap.utils.toArray(".rise").forEach(function (el) {
    gsap.from(el, { opacity: 0, y: 46, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
  gsap.utils.toArray(".welcome-photo img, .photos-one, .travel-photo").forEach(function (el) {
    gsap.fromTo(el, { yPercent: 6 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 } });
  });

  // Galerie: Bilder treiben beim Scrollen unterschiedlich schnell, das gibt Tiefe
  if (window.matchMedia("(min-width: 761px)").matches) {
    [[".g1", 10], [".g2", -8], [".g3", 14], [".g4", -6], [".g5", 12]].forEach(function (g) {
      var el = document.querySelector(g[0]);
      if (el) gsap.fromTo(el, { yPercent: g[1] }, { yPercent: -g[1], ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: 1.2 } });
    });
  }
  gsap.fromTo(".gallery-sky", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: true } });

  // die Passionsblume öffnet sich Schicht für Schicht
  var petals = gsap.utils.toArray(".bloom-layer");
  if (petals.length) {
    var rings = gsap.utils.toArray(".bloom-ring");
    gsap.set(rings, { xPercent: -50, yPercent: -50, scale: .2, opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ".bloom-flower", start: "top 88%", end: "center 42%", scrub: 1.4 } })
      .fromTo(petals[0], { "--r": "0%", rotate: -70, scale: 1.3 }, { "--r": "34%", rotate: 0, scale: 1, ease: "power2.out", duration: 1 }, 0)
      .fromTo(petals[1], { "--r": "0%", rotate: -45, scale: 1.2 }, { "--r": "60%", rotate: 0, scale: 1, ease: "power2.out", duration: 1 }, .45)
      .fromTo(petals[2], { "--r": "0%", rotate: -25, scale: 1.12, filter: "blur(6px)" }, { "--r": "100%", rotate: 0, scale: 1, filter: "blur(0px)", ease: "power2.out", duration: 1.1 }, .9)
      .to(rings[0], { scale: 2.4, opacity: .9, duration: .6 }, .15).to(rings[0], { opacity: 0, scale: 2.9, duration: .45 }, .75)
      .to(rings[1], { scale: 3.1, opacity: .8, duration: .6 }, .7).to(rings[1], { opacity: 0, scale: 3.6, duration: .45 }, 1.3);
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
