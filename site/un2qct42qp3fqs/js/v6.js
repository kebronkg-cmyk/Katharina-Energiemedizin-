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
  // aus welcher Himmelsrichtung ein Wind hereinweht
  var from = { sueden: { y: 100 }, westen: { x: -100 }, norden: { y: -100 }, osten: { x: 100 } };

  // ---------- weiches Scrollen ----------
  var lenis = null;
  if (!reduced && window.Lenis) {
    // lerp statt fester Dauer: gleitet gleichmäßig nach, ohne Anfahr-Ruck
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, smoothWheel: true });
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
  gsap.to(".sky-veil", { opacity: 1, ease: "none", scrollTrigger: { trigger: "#wahrnehmen", start: "top bottom", end: "top 30%", scrub: 1.2 } });

  // ---------- die vier Winde: Himmel wechselt die Stimmung ----------
  winds.forEach(function (name) {
    var section = document.getElementById(name);
    var el = layer(name);
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 90%", end: "top 10%", scrub: 1.2 } });
    if (!reduced) {
      gsap.fromTo(el.querySelector("img"), { scale: 1.14 }, { scale: 1, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    }
  });
  gsap.to(".sky-dawn", { opacity: 1, ease: "none", scrollTrigger: { trigger: "#begleitungen", start: "top bottom", end: "top 25%", scrub: 1.2 } });

  // ---------- Inhalte steigen sanft auf ----------
  if (!reduced) {
    gsap.utils.toArray(".rise").forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 46, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    // Gemälde und Porträt schweben beim Scrollen leicht gegen die Bewegung
    gsap.utils.toArray(".energy .painting, .person-photo, .depth-art").forEach(function (el) {
      gsap.fromTo(el, { yPercent: 8 }, { yPercent: -8, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    });
    // Mensch. Tier. Pflanze. … erscheinen nacheinander
    gsap.from(".elements span", { opacity: 0, y: 14, duration: .9, stagger: .16, ease: "power2.out", scrollTrigger: { trigger: ".elements", start: "top 85%", once: true } });
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

  // ---------- Windübergang: der nächste Wind weht aus seiner Richtung herein ----------
  var busy = false;
  function travel(name) {
    var target = document.getElementById(name);
    if (!target || busy) return;
    if (reduced) { jumpTo(target); return; }
    busy = true;
    var d = from[name];
    var horizontal = d.x !== undefined;
    var veil = document.createElement("div");
    veil.className = "travel";
    veil.style.backgroundImage = 'url("' + layer(name).querySelector("img").currentSrc + '")';
    veil.style.backgroundPosition = (getComputedStyle(layer(name)).getPropertyValue("--focus").trim() || "50%") + " 50%";
    // feine Windstreifen, die in Flugrichtung mitziehen
    for (var k = 0; k < 7; k++) {
      var line = document.createElement("i");
      var pos = 8 + Math.random() * 84;
      var len = 18 + Math.random() * 26;
      if (horizontal) { line.style.cssText = "top:" + pos + "%;left:0;width:" + len + "vw;height:" + (1 + Math.random() * 2) + "px"; }
      else { line.style.cssText = "left:" + pos + "%;top:0;height:" + len + "vh;width:" + (1 + Math.random() * 2) + "px;background:linear-gradient(180deg,rgba(255,250,238,0),rgba(255,250,238,.95),rgba(255,250,238,0))"; }
      veil.appendChild(line);
    }
    document.body.appendChild(veil);
    var lines = veil.querySelectorAll("i");
    var sign = (d.x || d.y) > 0 ? -1 : 1; // Streifen ziehen in Bewegungsrichtung
    gsap.set(veil, horizontal ? { xPercent: d.x } : { yPercent: d.y });
    gsap.set(lines, horizontal ? { x: sign > 0 ? "-40vw" : "100vw" } : { y: sign > 0 ? "-40vh" : "100vh" });
    var tl = gsap.timeline({
      onComplete: function () {
        jumpTo(target);
        gsap.to(veil, { opacity: 0, duration: .9, ease: "power2.out", delay: .1, onComplete: function () { veil.remove(); busy = false; } });
      }
    });
    tl.to(veil, horizontal ? { xPercent: 0, duration: 1.15, ease: "power3.inOut" } : { yPercent: 0, duration: 1.15, ease: "power3.inOut" })
      .to(lines, horizontal
        ? { x: sign > 0 ? "110vw" : "-50vw", duration: 1.1, stagger: .05, ease: "power1.inOut" }
        : { y: sign > 0 ? "110vh" : "-50vh", duration: 1.1, stagger: .05, ease: "power1.inOut" }, 0);
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

  // ---------- Medizinrad: in die gewählte Wolke hineinfliegen ----------
  var light = document.querySelector(".sky-light");
  document.querySelectorAll(".wind-card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      var target = document.querySelector(card.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (reduced) { target.scrollIntoView(); return; }

      var name = card.dataset.wind;
      var medal = card.querySelector(".medal").getBoundingClientRect();
      var src = layer(name).querySelector("img").currentSrc;
      var focus = getComputedStyle(layer(name)).getPropertyValue("--focus").trim() || "50%";
      var flight = document.createElement("div");
      flight.className = "flight";
      flight.style.backgroundImage = 'url("' + src + '")';
      flight.style.backgroundPosition = focus + " 50%";
      gsap.set(flight, { left: medal.left, top: medal.top, width: medal.width, height: medal.height });
      document.body.appendChild(flight);

      gsap.timeline({
        onComplete: function () {
          jumpTo(target);
          gsap.timeline({ onComplete: function () { flight.remove(); } })
            .to(flight, { opacity: 0, duration: .9, ease: "power2.out" }, .1)
            .to(light, { opacity: 0, duration: 1.1, ease: "power2.out" }, 0);
        }
      })
        .to(flight, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0, duration: 1.25, ease: "power3.inOut" })
        .to(light, { opacity: .55, duration: .6, ease: "sine.in" }, .65);
    });
  });

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
})();
