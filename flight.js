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
  const soundButton = document.querySelector("#voyage-sound");

  const soundscape = (() => {
    const STORAGE_KEY = "loveHubEntranceSound";
    let ctx = null;
    let master = null;
    let padGain = null;
    let beatTimer = 0;
    let enabled = localStorage.getItem(STORAGE_KEY) !== "off";
    let started = false;
    let fading = false;

    const syncButton = () => {
      if (!soundButton) return;
      soundButton.setAttribute("aria-pressed", String(enabled));
      soundButton.textContent = enabled ? "звук: тихо" : "звук: выкл";
      soundButton.title = enabled ? "Выключить звук" : "Включить звук";
    };

    const thump = (time, freq, peak, duration) => {
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(Math.max(28, freq * 0.45), time + duration);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(peak, time + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(time);
      osc.stop(time + duration + 0.02);
    };

    const scheduleBeat = () => {
      if (!ctx || !enabled || fading) return;
      const now = ctx.currentTime;
      thump(now, 62, 0.055, 0.22);
      thump(now + 0.2, 48, 0.032, 0.28);
      beatTimer = window.setTimeout(scheduleBeat, 1180);
    };

    const buildPad = () => {
      if (!ctx || !master) return;
      padGain = ctx.createGain();
      padGain.gain.value = 0.012;
      padGain.connect(master);
      [58, 87, 116].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = index === 2 ? "triangle" : "sine";
        osc.frequency.value = freq;
        gain.gain.value = index === 0 ? 0.55 : 0.28;
        osc.connect(gain);
        gain.connect(padGain);
        osc.start();
      });
    };

    const start = async () => {
      if (started || !enabled) return false;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        ctx = new AudioCtx();
        master = ctx.createGain();
        master.gain.value = 0.0001;
        master.connect(ctx.destination);
        if (ctx.state === "suspended") await ctx.resume();
        buildPad();
        master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2.4);
        started = true;
        scheduleBeat();
        syncButton();
        return true;
      } catch {
        return false;
      }
    };

    const setEnabled = (next) => {
      enabled = next;
      localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
      if (!enabled) {
        window.clearTimeout(beatTimer);
        if (ctx && master) {
          const now = ctx.currentTime;
          master.gain.cancelScheduledValues(now);
          master.gain.linearRampToValueAtTime(0.0001, now + 0.35);
        }
      } else if (started && ctx && master) {
        ctx.resume();
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.6);
        scheduleBeat();
      } else {
        start();
      }
      syncButton();
    };

    const fadeOut = () => {
      fading = true;
      window.clearTimeout(beatTimer);
      if (!ctx || !master) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.linearRampToValueAtTime(0.0001, now + 1.4);
      window.setTimeout(() => {
        try { ctx.suspend(); } catch {}
      }, 1500);
    };

    syncButton();
    return { start, setEnabled, isEnabled: () => enabled, fadeOut, syncButton };
  })();

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
    soundscape.fadeOut();
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
    if (soundscape.isEnabled()) soundscape.start();
  });

  soundButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    soundscape.setEnabled(!soundscape.isEnabled());
  });

  const armSound = () => {
    if (soundscape.isEnabled()) soundscape.start();
  };
  voyage.addEventListener("pointerdown", armSound, { once: true });
  voyage.addEventListener("keydown", armSound, { once: true });
  window.setTimeout(armSound, 400);

  play(0);
})();
