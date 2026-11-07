(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const body = document.body;
  const scrollCue = document.querySelector("#scroll-cue");
  const progress = document.querySelector("#reading-progress");

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
    ".envelope"
  ];
  const nodes = [...document.querySelectorAll(selectors.join(", "))];
  nodes.forEach((node, index) => {
    node.classList.add("reveal-item");
    if (node.matches(".gallery-card, .quick-card, .photo-strip figure, .envelope, .plans-grid article, .timeline-item")) {
      const siblings = [...node.parentElement.children].filter((child) => child.classList.contains("reveal-item"));
      node.style.setProperty("--stagger", String(Math.max(0, siblings.indexOf(node))));
    } else {
      node.style.setProperty("--stagger", String(index % 5));
    }
  });

  document.querySelectorAll(".ambient").forEach((node) => node.classList.add("parallax-layer"));
  document.querySelector(".hero-art")?.classList.add("parallax-layer");
  document.querySelector(".hero-copy")?.classList.add("parallax-layer");

  let lastY = window.scrollY;
  let direction = "down";
  let ticking = false;

  const setProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? window.scrollY / max : 0;
    const scale = `scaleX(${value})`;
    glow.style.transform = scale;
    if (progress) progress.style.transform = scale;
  };

  const applyParallax = () => {
    if (reduced.matches) return;
    const y = window.scrollY;
    document.querySelectorAll(".ambient--one").forEach((node) => {
      node.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
    });
    document.querySelectorAll(".ambient--two").forEach((node) => {
      node.style.transform = `translate3d(0, ${y * -0.05}px, 0)`;
    });
    const heroArt = document.querySelector(".hero-art.parallax-layer");
    const heroCopy = document.querySelector(".hero-copy.parallax-layer");
    if (heroArt) heroArt.style.transform = `translate3d(0, ${Math.min(y, 520) * 0.06}px, 0)`;
    if (heroCopy) heroCopy.style.transform = `translate3d(0, ${Math.min(y, 520) * 0.03}px, 0)`;
  };

  const onScroll = () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 4) {
      direction = y > lastY ? "down" : "up";
      body.classList.toggle("scroll-down", direction === "down");
      body.classList.toggle("scroll-up", direction === "up");
      lastY = y;
    }
    if (scrollCue) scrollCue.classList.toggle("is-hidden", y > 80);
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
        if (entry.isIntersecting) {
          node.classList.remove("is-leaving-up", "is-leaving-down", "from-above", "from-below");
          node.classList.add("is-inview", direction === "down" ? "from-below" : "from-above");
        } else {
          node.classList.remove("is-inview", "from-above", "from-below");
          node.classList.add(direction === "down" ? "is-leaving-up" : "is-leaving-down");
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -10% 0px" });
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
