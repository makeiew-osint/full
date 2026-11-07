(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollCue = document.querySelector("#scroll-cue");

  document.body.classList.add("js-reveal");
  const nodes = document.querySelectorAll(".section-block, .hero, .quick-nav, .last-words, .closing-screen, .gallery-card, .photo-strip figure, .timeline-item, .plans-grid article, .envelope");
  if (reduced.matches) {
    nodes.forEach((node) => node.classList.add("is-inview"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach((node) => io.observe(node));
  }

  const hideCue = () => {
    if (!scrollCue) return;
    scrollCue.classList.toggle("is-hidden", window.scrollY > 80);
  };
  window.addEventListener("scroll", hideCue, { passive: true });
  hideCue();
})();
