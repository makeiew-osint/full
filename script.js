(() => {
  "use strict";
  const entry = document.querySelector("#entry-screen");
  const enter = document.querySelector("#enter-site");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const unlockSite = () => {
    entry.classList.add("is-leaving");
    document.body.classList.remove("entry-locked");
    window.setTimeout(() => entry.remove(), prefersReducedMotion.matches ? 0 : 720);
  };
  document.body.classList.add("entry-locked");
  enter.addEventListener("click", unlockSite);
  const reasons = [
    "за твои карие глаза","за твою улыбку","за то, как ты смотришь на меня","за твою нежность","за твой смех","за то, что рядом спокойно","за твою заботу","за твою искренность","за твой голос","за твою красоту","за то, что ты умеешь удивлять","за твои объятия","за твою доброту","за наши разговоры","за то, как ты произносишь моё имя","за твой характер","за твои маленькие привычки","за твою смелость","за то, что ты вдохновляешь","за твоё тепло","за смешные сообщения","за твою поддержку","за наши секреты","за твою честность","за то, что с тобой можно быть собой","за твой стиль","за твою душу","за твои мечты","за твоё терпение","за твою внимательность","за то, как ты радуешься мелочам","за наши прогулки","за твой уют","за твою энергию","за то, что ты особенная","за твою уверенность","за наши воспоминания","за твои милые капризы","за то, что ты всегда настоящая","за твоё «доброе утро»","за твоё «спокойной ночи»","за то, что ты рядом","за твою нежную улыбку","за твои объятия после долгого дня","за то, как ты смеёшься над моими шутками","за твои истории","за наши общие планы","за твою заботу обо мне","за твою мягкость","за то, что рядом с тобой время летит","за твои фотографии","за твои рисунки","за твою любознательность","за то, как ты умеешь слушать","за твою непосредственность","за твой рост 165 см","за то, что тебя хочется обнимать","за твою улыбку глазами","за твою силу","за то, как ты веришь в меня","за наши маленькие традиции","за твои тёплые слова","за то, что ты умеешь сделать день лучше","за твою загадочность","за твой запах","за наши случайные совпадения","за то, как ты держишь меня за руку","за твою романтичность","за твои «люблю»","за то, как ты смотришься рядом со мной","за твой внутренний свет","за твою красоту без фильтров","за наши ночные разговоры","за то, что с тобой не бывает скучно","за твою верность","за твою нежную душу","за то, что ты умеешь прощать","за наши смешные моменты","за то, что ты мой человек","за твой взгляд","за твои тёплые ладони","за то, что ты умеешь поддержать молча","за твою улыбку в неожиданный момент","за нашу историю","за то, что ты делаешь меня счастливее","за твою красоту внутри","за каждую встречу","за каждое сообщение","за то, что тебя невозможно не любить","за то, что ты моя любимая","за всё, что между нами","за каждый поцелуй","за твоё большое сердце","за то, что ты есть","за сегодня","за завтра","за все будущие моменты","за то, что любовь с тобой настоящая","за каждое твоё «я рядом»","просто за тебя"
  ];
  const grid = document.querySelector("#reason-grid");
  const count = document.querySelector("#opened-count");
  const bar = document.querySelector("#progress-bar");
  const opened = new Set();
  reasons.forEach((reason, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "reason-card";
    card.setAttribute("aria-label", `Причина ${index + 1}`);
    card.innerHTML = `<span class="reason-number">${String(index + 1).padStart(2, "0")}</span><span class="reason-cover">нажми, чтобы открыть ♡</span><span class="reason-text">${reason}</span>`;
    card.addEventListener("click", () => {
      card.classList.toggle("open");
      card.classList.contains("open") ? opened.add(index) : opened.delete(index);
      count.textContent = opened.size;
      bar.style.transform = `scaleX(${opened.size / 100})`;
    });
    grid.append(card);
  });
  document.querySelector("#open-first").addEventListener("click", () => {
    const first = grid.firstElementChild;
    if (!first.classList.contains("open")) first.click();
    first.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  });

  const counter = document.querySelector("#days-counter");
  const started = Date.UTC(2026, 6, 5);
  const updateDays = () => {
    const today = new Date();
    const current = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    counter.textContent = Math.max(0, Math.floor((current - started) / 86400000)).toLocaleString("ru-RU");
  };
  updateDays();
  const particles = document.querySelector(".particles");
  const reduced = prefersReducedMotion;
  if (!reduced.matches) {
    window.setInterval(() => {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.textContent = Math.random() > .5 ? "♡" : "·";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.setProperty("--drift", `${(Math.random() - .5) * 120}px`);
      particle.style.animationDuration = `${7 + Math.random() * 5}s`;
      particles.append(particle);
      window.setTimeout(() => particle.remove(), 13000);
    }, 1400);
  }
  const sections = [...document.querySelectorAll("main > section[id]")];
  const links = [...document.querySelectorAll(".nav-link")];
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
  }), { rootMargin: "-25% 0px -65% 0px" });
  sections.forEach((section) => observer.observe(section));

  const secretTrigger = document.querySelector("#secret-trigger");
  const fireworks = document.querySelector("#number-fireworks");
  secretTrigger.addEventListener("click", () => {
    fireworks.replaceChildren();
    const total = reduced.matches ? 18 : 42;
    for (let index = 0; index < total; index += 1) {
      const number = document.createElement("span");
      number.className = "firework-number";
      number.textContent = "67";
      number.style.setProperty("--x", `${(Math.random() - 0.5) * 92}vw`);
      number.style.setProperty("--y", `${-(35 + Math.random() * 52)}vh`);
      number.style.setProperty("--r", `${(Math.random() - 0.5) * 70}deg`);
      number.style.setProperty("--delay", `${Math.random() * 260}ms`);
      fireworks.append(number);
    }
    fireworks.classList.remove("is-active");
    requestAnimationFrame(() => fireworks.classList.add("is-active"));
    window.setTimeout(() => fireworks.classList.remove("is-active"), reduced.matches ? 900 : 3000);
  });
})();
