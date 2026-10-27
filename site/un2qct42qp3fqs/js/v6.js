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
  gsap.to(".sky-veil", { opacity: 1, ease: "none", scrollTrigger: { trigger: "#willkommen", start: "top bottom", end: "top 30%", scrub: 1.2 } });

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
    // Fotos und Gemälde schweben beim Scrollen leicht gegen die Bewegung
    gsap.utils.toArray(".welcome-photo img, .energy-art img, .depth-art, .joy-photo, .eagle-clear").forEach(function (el) {
      gsap.fromTo(el, { yPercent: 5 }, { yPercent: -5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    });
    gsap.fromTo(".eagle-wide", { xPercent: -3 }, { xPercent: 3, ease: "none", scrollTrigger: { trigger: ".eagle-view", start: "top bottom", end: "bottom top", scrub: 1.2 } });
    // Mensch. Tier. Pflanze. … erscheinen nacheinander
    gsap.from(".energy-list span", { opacity: 0, y: 14, duration: .9, stagger: .22, ease: "power2.out", scrollTrigger: { trigger: ".energy-list", start: "top 85%", once: true } });
    // der Weg im Medizinrad zeichnet sich: Süden, Westen, Norden, Osten
    gsap.fromTo(".compass-lines .route", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut", scrollTrigger: { trigger: ".compass-rose", start: "top 70%", once: true } });
    gsap.fromTo(".compass-lines .route-tip", { opacity: 0 }, { opacity: 1, duration: .6, delay: 2.4, scrollTrigger: { trigger: ".compass-rose", start: "top 70%", once: true } });
    // die Passionsblume öffnet sich Schicht für Schicht
    var petals = gsap.utils.toArray(".bloom-layer");
    var rings = gsap.utils.toArray(".bloom-ring");
    gsap.set(rings, { xPercent: -50, yPercent: -50, scale: .2, opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ".bloom-flower", start: "top 88%", end: "center 42%", scrub: 1.4 } })
      .fromTo(petals[0], { "--r": "0%", rotate: -70, scale: 1.3 }, { "--r": "34%", rotate: 0, scale: 1, ease: "power2.out", duration: 1 }, 0)
      .fromTo(petals[1], { "--r": "0%", rotate: -45, scale: 1.2 }, { "--r": "60%", rotate: 0, scale: 1, ease: "power2.out", duration: 1 }, .45)
      .fromTo(petals[2], { "--r": "0%", rotate: -25, scale: 1.12, filter: "blur(6px)" }, { "--r": "100%", rotate: 0, scale: 1, filter: "blur(0px)", ease: "power2.out", duration: 1.1 }, .9)
      .to(rings[0], { scale: 2.4, opacity: .9, duration: .6 }, .15).to(rings[0], { opacity: 0, scale: 2.9, duration: .45 }, .75)
      .to(rings[1], { scale: 3.1, opacity: .8, duration: .6 }, .7).to(rings[1], { opacity: 0, scale: 3.6, duration: .45 }, 1.3);
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

  // ---------- Windübergang: der neue Himmel öffnet sich aus seiner Richtung ----------
  var busy = false;
  var main = document.querySelector("main");
  function travel(name) {
    var target = document.getElementById(name);
    if (!target || busy) return;
    if (reduced) { jumpTo(target); return; }
    busy = true;
    var v = blow[name];
    var veil = document.createElement("div");
    veil.className = "travel";
    var sky = document.createElement("div");
    sky.className = "travel-sky";
    sky.style.backgroundImage = 'url("' + layer(name).querySelector("img").currentSrc + '")';
    sky.style.backgroundPosition = (getComputedStyle(layer(name)).getPropertyValue("--focus").trim() || "50%") + " 50%";
    sky.style.setProperty("--x", origin[name][0]); sky.style.setProperty("--y", origin[name][1]);
    veil.appendChild(sky);
    document.body.appendChild(veil);
    gust(v, 2.4, veil);
    gsap.timeline()
      // die Böe erfasst die Seite und trägt sie ein Stück mit
      .to(main, { x: v[0] * 46, y: v[1] * 28, opacity: .55, duration: .8, ease: "power2.in" }, 0)
      // der neue Himmel wirbelt weich und unscharf herein und wird klar
      .fromTo(sky, { "--r": "0%", filter: "blur(24px)", scale: 1.24, rotate: (v[0] || -v[1]) * 4 },
        { "--r": "175%", filter: "blur(0px)", scale: 1, rotate: 0, duration: 1.55, ease: "power2.inOut" }, .3)
      .add(function () { jumpTo(target); gsap.set(main, { clearProps: "transform,opacity" }); }, 1.85)
      .to(veil, { opacity: 0, duration: .9, ease: "power2.out" }, 1.95)
      .add(function () { veil.remove(); busy = false; }, 2.9);
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
      gust(blow[name], 2.2);

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
})();
