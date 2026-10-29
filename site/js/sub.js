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
      var fc = btn.parentElement.querySelector("figcaption");
      cap.textContent = fc ? Array.prototype.map.call(fc.children.length ? fc.children : [fc], function (x) { return x.textContent; }).join(" · ") : "";
      from = btn; light.showModal();
    });
    function close() { light.close(); if (from) from.focus({ preventScroll: true }); }
    light.querySelector(".g-close").addEventListener("click", close);
    light.addEventListener("click", function (e) { if (e.target === light) close(); });
  }

  // Galerie: jede Reihe zieht langsam von selbst weiter (die zweite gegenläufig)
  // und lässt sich zugleich wischen, mit dem Mausrad schieben oder ziehen.
  // Jede Reihe ist einmal verdoppelt, damit sie endlos und ohne Sprung läuft.
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
    var dir = n % 2 ? -1 : 1, speed = 28, pos = 0, held = false, resume = 0, half = 0;
    function measure() { half = track.scrollWidth / 2; }
    function wrap() {
      if (!half) return;
      if (row.scrollLeft >= half) row.scrollLeft -= half;
      else if (row.scrollLeft <= 0) row.scrollLeft += half;
    }
    function hold() { held = true; clearTimeout(resume); }
    function release() { clearTimeout(resume); resume = setTimeout(function () { held = false; pos = row.scrollLeft; }, 1800); }
    measure();
    window.addEventListener("load", function () { measure(); if (dir < 0) row.scrollLeft = half - 1; pos = row.scrollLeft; });
    window.addEventListener("resize", measure);
    if (dir < 0) row.scrollLeft = half - 1;
    pos = row.scrollLeft;
    row.addEventListener("scroll", function () {
      wrap();
      // weicht die Lage deutlich vom Selbstlauf ab, hat jemand gewischt: kurz innehalten
      if (!held && Math.abs(row.scrollLeft - pos) > 3 && Math.abs(Math.abs(row.scrollLeft - pos) - half) > 3) { hold(); release(); }
      if (held) pos = row.scrollLeft;
    }, { passive: true });
    row.addEventListener("touchstart", hold, { passive: true });
    row.addEventListener("touchend", release, { passive: true });
    row.addEventListener("mouseenter", hold);
    row.addEventListener("mouseleave", release);
    // Mausrad: nur seitliches Wischen (Trackpad) oder Umschalt+Rad verschiebt die Reihe,
    // damit die Seite selbst normal weiterscrollt
    row.addEventListener("wheel", function (e) {
      var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!dx) return;
      e.preventDefault(); hold(); row.scrollLeft += dx; release();
    }, { passive: false });
    // Ziehen mit der Maus
    var startX = 0, startLeft = 0, down = false;
    row.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; dragged = false; startX = e.clientX; startLeft = row.scrollLeft; hold();
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { dragged = true; row.classList.add("is-dragging"); }
      row.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false; row.classList.remove("is-dragging"); release();
    });
    if (calm) return;
    var last = 0;
    (function tick(t) {
      var dt = last ? Math.min(t - last, 64) / 1000 : 0; last = t || 0;
      if (!held && half) { pos += dir * speed * dt; if (pos >= half) pos -= half; if (pos <= 0) pos += half; row.scrollLeft = pos; }
      requestAnimationFrame(tick);
    })(0);
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
