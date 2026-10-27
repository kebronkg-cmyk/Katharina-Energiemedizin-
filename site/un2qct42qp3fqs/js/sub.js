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
  gsap.utils.toArray(".about-photo, .photos-one, .travel-photo").forEach(function (el) {
    gsap.fromTo(el, { yPercent: 6 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2 } });
  });

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
