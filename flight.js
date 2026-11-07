(() => {
  "use strict";

  const voyage = document.querySelector("#voyage");
  if (!voyage) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kicker = document.querySelector("#voyage-kicker");
  const title = document.querySelector("#voyage-title");
  const line = document.querySelector("#voyage-line");
  const copy = document.querySelector("#voyage-copy");
  const gate = document.querySelector("#gate");
  const input = document.querySelector("#gate-pass");
  const error = document.querySelector("#gate-error");
  const meter = document.querySelector("#voyage-meter");
  const tunnel = document.querySelector("#voyage-tunnel");
  const petals = document.querySelector("#voyage-petals");
  const sparks = document.querySelector("#voyage-sparks");

  const heartSvg = `<svg viewBox="0 0 240 220" aria-hidden="true"><path d="M120 196C120 196 28 132 28 78C28 42 54 22 84 22C104 22 116 34 120 48C124 34 136 22 156 22C186 22 212 42 212 78C212 132 120 196 120 196Z"/></svg>`;
  for (let i = 0; i < 18; i += 1) {
    const ring = document.createElement("span");
    ring.className = "tunnel-heart";
    ring.style.setProperty("--i", String(i));
    ring.innerHTML = heartSvg;
    tunnel.append(ring);
  }
  for (let i = 0; i < 28; i += 1) {
    const petal = document.createElement("i");
    petal.style.setProperty("--x", `${6 + Math.random() * 88}%`);
    petal.style.setProperty("--d", `${Math.random() * 5}s`);
    petal.style.setProperty("--s", `${0.55 + Math.random() * 1.05}`);
    petal.style.setProperty("--r", `${Math.random() * 48 - 24}deg`);
    petals.append(petal);
  }
  if (sparks) {
    for (let i = 0; i < 36; i += 1) {
      const spark = document.createElement("span");
      spark.style.setProperty("--x", `${Math.random() * 100}%`);
      spark.style.setProperty("--y", `${Math.random() * 100}%`);
      spark.style.setProperty("--d", `${Math.random() * 4.5}s`);
      spark.style.setProperty("--s", `${0.4 + Math.random() * 1.4}`);
      sparks.append(spark);
    }
  }

  const scenes = [
    { kicker: "", title: "", line: "" },
    { kicker: "05 · 07 · 2026", title: "с этого вечера", line: "один тихий свет впереди" },
    { kicker: "только для тебя", title: "Яна", line: "сейчас мы войдём внутрь" },
    { kicker: "смотри", title: "", line: "сердце открывается" },
    { kicker: "", title: "", line: "" },
    { kicker: "сквозь", title: "", line: "держись рядом" },
    { kicker: "", title: "я тебя люблю", line: "здесь тихо и тепло" },
    { kicker: "", title: "", line: "" },
    { gate: true }
  ];

  let timers = [];
  let captionTimer = 0;

  const clearTimers = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    window.clearTimeout(captionTimer);
  };

  const splitTitle = (text) => {
    if (!text) return "";
    return [...text].map((char, index) => {
      const safe = char === " " ? "&nbsp;" : char;
      return `<span style="--c:${index}">${safe}</span>`;
    }).join("");
  };

  const say = (scene) => {
    window.clearTimeout(captionTimer);
    copy.classList.remove("is-in", "is-swap");
    captionTimer = window.setTimeout(() => {
      kicker.textContent = scene.kicker || "";
      title.innerHTML = splitTitle(scene.title || "");
      line.textContent = scene.line || "";
      const hasText = Boolean(scene.kicker || scene.title || scene.line);
      if (hasText) {
        copy.classList.add("is-in", "is-swap");
      }
    }, reduced ? 0 : 320);
  };

  const go = (index) => {
    voyage.dataset.stage = String(index);
    if (meter) meter.style.transform = `scaleX(${index / (scenes.length - 1)})`;
    const scene = scenes[index];
    if (scene.gate) {
      copy.classList.remove("is-in", "is-swap");
      window.setTimeout(() => input?.focus(), reduced ? 0 : 1100);
      return;
    }
    say(scene);
  };

  const play = (from = 0) => {
    clearTimers();
    gate.classList.remove("is-wrong");
    error.textContent = "";
    if (reduced) {
      go(scenes.length - 1);
      return;
    }
    const marks = [0, 1400, 4800, 9000, 13800, 17800, 23600, 28600, 32200];
    marks.forEach((at, index) => {
      if (index < from) return;
      timers.push(window.setTimeout(() => go(index), at - marks[from]));
    });
  };

  const unlock = () => {
    clearTimers();
    voyage.classList.add("is-opening");
    for (let i = 0; i < 24; i += 1) {
      const bit = document.createElement("span");
      bit.className = "burst";
      bit.textContent = i % 3 === 0 ? "✦" : "♡";
      bit.style.setProperty("--a", `${(i / 24) * 360}deg`);
      bit.style.setProperty("--r", `${70 + (i % 6) * 26}px`);
      voyage.append(bit);
    }
    document.body.classList.remove("entry-locked");
    document.body.classList.add("is-unlocked");
    window.setTimeout(() => voyage.remove(), reduced ? 0 : 1800);
  };

  const normalize = (value) => value.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, "");

  gate.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = normalize(input.value);
    if (value === "мур" || value === "mur") {
      error.textContent = "";
      unlock();
      return;
    }
    gate.classList.remove("is-wrong");
    void gate.offsetWidth;
    gate.classList.add("is-wrong");
    error.textContent = "не то слово — попробуй ещё раз";
    input.select();
  });

  document.querySelector("#voyage-skip").addEventListener("click", () => {
    clearTimers();
    go(scenes.length - 1);
  });

  document.querySelector("#gate-replay").addEventListener("click", () => {
    input.value = "";
    error.textContent = "";
    if (reduced) return;
    play(0);
  });

  play(0);
})();
