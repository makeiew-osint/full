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
  const savedReasons = JSON.parse(localStorage.getItem("loveHubOpenedReasons") || "[]");
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
      localStorage.setItem("loveHubOpenedReasons", JSON.stringify([...opened]));
    });
    grid.append(card);
    if (savedReasons.includes(index)) card.click();
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

  const moodMessage = document.querySelector("#mood-message");
  const moodCopy = {
    hug: "Иди сюда. Обнимаю крепко-крепко и никуда не отпускаю.",
    miss: "Я тоже скучаю. Скоро снова будем рядом.",
    smile: "Улыбнись, пожалуйста. Твоя улыбка — моё любимое чудо.",
    calm: "Дыши спокойно. Тебе не нужно всё успевать прямо сейчас."
  };
  document.querySelectorAll("[data-mood]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-mood]").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      moodMessage.textContent = moodCopy[button.dataset.mood];
    });
  });

  document.querySelectorAll(".envelope-button").forEach((button) => {
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      button.closest(".envelope").classList.toggle("is-open", !open);
      button.querySelector("span").textContent = open ? "＋" : "−";
      const envelopeIndex = [...document.querySelectorAll(".envelope-button")].indexOf(button);
      const savedEnvelopes = JSON.parse(localStorage.getItem("loveHubEnvelopes") || "[]");
      if (open && !savedEnvelopes.includes(envelopeIndex)) savedEnvelopes.push(envelopeIndex);
      localStorage.setItem("loveHubEnvelopes", JSON.stringify(savedEnvelopes));
    });

    const savedComfort = document.querySelector("#comfort-message");
    const comfortCopy = {
      letter: "Моё короткое послание уже ждёт тебя ниже.",
      music: "Включи нашу песню и просто побудь в этом моменте.",
      hug: "Иди сюда. Я рядом и обнимаю тебя очень крепко."
    };
    document.querySelectorAll("[data-comfort]").forEach((button) => {
      button.addEventListener("click", () => {
        savedComfort.textContent = comfortCopy[button.dataset.comfort];
        if (button.dataset.comfort === "letter") document.querySelector("#last-words").scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" });
        if (button.dataset.comfort === "music") document.querySelector("#music-button").click();
        if (button.dataset.comfort === "hug") document.querySelector("#hug-button").click();
      });
    });

    const secretHeart = document.querySelector("#secret-heart");
    const secretMessage = document.querySelector("#secret-message");
    secretHeart.addEventListener("click", () => {
      secretMessage.classList.add("is-visible");
      localStorage.setItem("loveHubSecretFound", "true");
    });
    if (localStorage.getItem("loveHubSecretFound") === "true") secretHeart.classList.add("is-found");

    const memoryDate = document.querySelector("#memory-date");
    document.querySelectorAll(".days b, .days strong").forEach((day) => {
      day.tabIndex = 0;
      const chooseDate = () => {
        const date = day.textContent.replace("♡", "").trim();
        memoryDate.textContent = `${date} июля — маленький момент, который хочется сохранить ♡`;
      };
      day.addEventListener("click", chooseDate);
      day.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseDate(); }
      });
    });
  });

  const audio = document.querySelector("#music-audio");
  const musicButton = document.querySelector("#music-button");
  musicButton.addEventListener("click", async () => {
    if (audio.error) {
      musicButton.textContent = "песня не загрузилась";
      musicButton.setAttribute("aria-label", "Песня не загрузилась");
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        musicButton.textContent = "Ⅱ пауза";
      } catch {
        musicButton.textContent = "песня не загрузилась";
        musicButton.setAttribute("aria-label", "Песня не загрузилась");
      }
    } else {
      audio.pause();
      musicButton.textContent = "▶ включить";
    }
  });
  audio.addEventListener("ended", () => { musicButton.textContent = "▶ включить"; });
  document.querySelectorAll(".easter-egg").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.add("is-found");
      button.setAttribute("aria-label", button.dataset.secret);
      button.closest(".timeline-item").querySelector("p").textContent = button.dataset.secret;
    });
  });
  const hugButton = document.querySelector("#hug-button");
  const hugMessage = document.querySelector("#hug-message");
  hugButton.addEventListener("click", () => {
    hugMessage.textContent = "Иди сюда, я тебя обниму ♡";
    hugMessage.classList.add("is-visible");
    for (let index = 0; index < (reduced.matches ? 6 : 16); index += 1) {
      const heart = document.createElement("span");
      heart.className = "hug-heart";
      heart.textContent = "♡";
      heart.style.setProperty("--x", `${(Math.random() - .5) * 180}px`);
      heart.style.setProperty("--delay", `${Math.random() * 180}ms`);
      hugMessage.append(heart);
      window.setTimeout(() => heart.remove(), 2200);
    }
    window.setTimeout(() => hugMessage.classList.remove("is-visible"), 2600);
  });
  document.querySelector("#closing-hug").addEventListener("click", () => hugButton.click());

  const progress = document.querySelector("#reading-progress");
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxCaption = document.querySelector("#lightbox-caption");
  const galleryImages = [...document.querySelectorAll(".gallery-card img, .photo-strip img")];
  let currentPhoto = 0;
  const showPhoto = (index) => {
    currentPhoto = (index + galleryImages.length) % galleryImages.length;
    const image = galleryImages[currentPhoto];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.closest("figure").querySelector("figcaption")?.textContent || "";
  };
  const openLightbox = (index) => {
    showPhoto(index);
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-locked");
  };
  const closeLightbox = () => {
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-locked");
  };
  galleryImages.forEach((image, index) => {
    image.tabIndex = 0;
    image.addEventListener("click", () => openLightbox(index));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openLightbox(index); }
    });
  });
  document.querySelector("#lightbox-close").addEventListener("click", closeLightbox);
  document.querySelector("#lightbox-prev").addEventListener("click", () => showPhoto(currentPhoto - 1));
  document.querySelector("#lightbox-next").addEventListener("click", () => showPhoto(currentPhoto + 1));
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
    if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
  });
})();
