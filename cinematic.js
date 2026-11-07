(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const body = document.body;
  const scrollCue = document.querySelector("#scroll-cue");

  const glow = document.createElement("div");
  glow.className = "scroll-progress-glow";
  glow.setAttribute("aria-hidden", "true");
  body.append(glow);

  document.body.classList.add("js-reveal");

  const selectors = [
    ".section-block",
    ".hero",
    ".quick-nav",
    ".quick-card",
    ".last-words",
    ".closing-screen",
    ".gallery-card",
    ".photo-strip figure",
    ".timeline-item",
    ".plans-grid article",
    ".envelope",
    ".reason-card",
    ".music-card",
    ".calendar-card"
  ];
  const nodes = [...document.querySelectorAll(selectors.join(", "))];
  nodes.forEach((node) => {
    node.classList.add("reveal-item");
    if (node.parentElement) {
      const siblings = [...node.parentElement.children].filter((child) => child.matches(selectors.join(", ")));
      const index = siblings.indexOf(node);
      if (index >= 0) node.style.setProperty("--stagger", String(index % 8));
    }
  });

  document.querySelectorAll(".ambient").forEach((node) => node.classList.add("parallax-layer"));
  document.querySelector(".hero-art")?.classList.add("parallax-layer");
  document.querySelector(".hero-copy")?.classList.add("parallax-layer");

  let lastY = window.scrollY;
  let direction = "down";
  let ticking = false;

  const setProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    glow.style.transform = `scaleX(${window.scrollY / max})`;
  };

  const applyParallax = () => {
    if (reduced.matches) return;
    const y = window.scrollY;
    document.querySelectorAll(".ambient--one").forEach((node) => {
      node.style.transform = `translate3d(${y * -0.02}px, ${y * 0.1}px, 0)`;
    });
    document.querySelectorAll(".ambient--two").forEach((node) => {
      node.style.transform = `translate3d(${y * 0.015}px, ${y * -0.06}px, 0)`;
    });
    const heroArt = document.querySelector(".hero-art.parallax-layer");
    const heroCopy = document.querySelector(".hero-copy.parallax-layer");
    const clamped = Math.min(y, 640);
    if (heroArt) heroArt.style.transform = `translate3d(0, ${clamped * 0.075}px, 0)`;
    if (heroCopy) heroCopy.style.transform = `translate3d(0, ${clamped * 0.035}px, 0)`;

    nodes.forEach((node) => {
      if (!node.classList.contains("is-inview")) return;
      if (node.matches(".hero, .quick-nav, .section-block, .last-words, .closing-screen")) {
        const rect = node.getBoundingClientRect();
        const mid = rect.top + rect.height * 0.35 - window.innerHeight * 0.45;
        const shift = Math.max(-18, Math.min(18, mid * -0.04));
        node.style.setProperty("--scroll-shift", shift.toFixed(2));
      }
    });
  };

  const onScroll = () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 3) {
      direction = y > lastY ? "down" : "up";
      body.classList.toggle("scroll-down", direction === "down");
      body.classList.toggle("scroll-up", direction === "up");
      lastY = y;
    }
    if (scrollCue) scrollCue.classList.toggle("is-hidden", y > 70);
    setProgress();
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        applyParallax();
        ticking = false;
      });
    }
  };

  if (reduced.matches) {
    nodes.forEach((node) => node.classList.add("is-inview"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const node = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio > 0.08) {
          node.classList.remove("is-leaving-up", "is-leaving-down", "from-above", "from-below");
          node.classList.add("is-inview", direction === "down" ? "from-below" : "from-above");
        } else if (!entry.isIntersecting) {
          node.classList.remove("is-inview", "from-above", "from-below");
          node.classList.add(direction === "down" ? "is-leaving-up" : "is-leaving-down");
          node.style.removeProperty("--scroll-shift");
        }
      });
    }, { threshold: [0, 0.1, 0.2, 0.35], rootMargin: "0px 0px -8% 0px" });
    nodes.forEach((node) => io.observe(node));
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const markUnlocked = () => {
    if (body.classList.contains("entry-locked")) return;
    body.classList.add("is-unlocked");
  };
  if (!body.classList.contains("entry-locked")) markUnlocked();
  else {
    const watch = new MutationObserver(() => {
      if (!body.classList.contains("entry-locked")) {
        markUnlocked();
        watch.disconnect();
      }
    });
    watch.observe(body, { attributes: true, attributeFilter: ["class"] });
  }
})();
