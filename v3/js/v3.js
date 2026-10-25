// Weg der vier Winde – Prototyp v3
// Weiches Scrollen (Lenis), Szenenwechsel und Flug in die Wolken (GSAP).
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var layer = function (name) { return document.querySelector('.sky-layer[data-scene="' + name + '"]'); };
  var winds = ["sueden", "westen", "norden", "osten"];

  // ---------- weiches Scrollen ----------
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.35, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToTarget(target, opts) {
    if (lenis) lenis.scrollTo(target, opts || { duration: 2.4 });
    else target.scrollIntoView();
  }

  // ---------- Ankommen: in das Licht hineinfliegen ----------
  var hero = { trigger: "#ankommen", start: "top top", end: "bottom top", scrub: true };
  if (!reduced) gsap.to(layer("mitte").querySelector("img"), { scale: 1.45, ease: "none", scrollTrigger: hero });
  gsap.to(".hero-inner", { opacity: 0, y: reduced ? 0 : -80, ease: "none", scrollTrigger: { trigger: "#ankommen", start: "top top", end: "60% top", scrub: true } });
  gsap.to(".hero-mark", { opacity: 0, scale: reduced ? 1 : 2.2, ease: "none", scrollTrigger: { trigger: "#ankommen", start: "10% top", end: "80% top", scrub: true } });
  gsap.to(".sky-veil", { opacity: 1, ease: "none", scrollTrigger: { trigger: "#wahrnehmen", start: "top bottom", end: "top 30%", scrub: true } });

  // ---------- die vier Winde: Himmel wechselt die Stimmung ----------
  winds.forEach(function (name) {
    var section = document.getElementById(name);
    var el = layer(name);
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 90%", end: "top 10%", scrub: true } });
    if (!reduced) {
      gsap.fromTo(el.querySelector("img"), { scale: 1.14 }, { scale: 1, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } });
    }
  });
  gsap.to(".sky-dawn", { opacity: 1, ease: "none", scrollTrigger: { trigger: "#schritt", start: "top bottom", end: "top 25%", scrub: true } });

  // ---------- Inhalte steigen sanft auf ----------
  if (!reduced) {
    gsap.utils.toArray(".rise").forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 46, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
  }

  // ---------- Windrose und Leiste: wo bin ich, wie hell ist der Himmel ----------
  var bar = document.querySelector(".bar");
  var rose = document.querySelector(".rose");
  ["ankommen"].concat(winds).forEach(function (name) {
    var link = rose.querySelector('[data-for="' + name + '"]');
    var section = document.getElementById(name);
    var end = name === "ankommen" ? document.getElementById("kompass") : section;
    ScrollTrigger.create({
      trigger: section, endTrigger: end, start: "top 50%", end: "bottom 50%",
      onToggle: function (self) {
        link.classList.toggle("is-active", self.isActive);
        if (name === "westen") { bar.classList.toggle("is-dark", self.isActive); rose.classList.toggle("is-dark", self.isActive); }
      }
    });
  });

  // ---------- Navigation: ruhig durch den Himmel gleiten ----------
  document.querySelectorAll('.bar a[href^="#"], .rose a, .onward a').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });

  // ---------- Kompass: in die gewählte Wolke hineinfliegen ----------
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
          if (lenis) lenis.scrollTo(target, { immediate: true, force: true }); else target.scrollIntoView();
          ScrollTrigger.update();
          gsap.timeline({ onComplete: function () { flight.remove(); } })
            .to(flight, { opacity: 0, duration: .9, ease: "power2.out" }, .1)
            .to(light, { opacity: 0, duration: 1.1, ease: "power2.out" }, 0);
        }
      })
        .to(flight, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0, duration: 1.25, ease: "power3.inOut" })
        .to(light, { opacity: .55, duration: .6, ease: "sine.in" }, .65);
    });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
