/* ============================
   MAIN (Intro + Navegación + Modal + Countdown + RSVP)
   Limpio (sin duplicados)
   ============================ */

(() => {
  // =========================================================
  // Helpers
  // =========================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => root.querySelectorAll(sel);

  const pad2 = (n) => String(n).padStart(2, "0");

  // =========================================================
  // 0) INTRO FILM ROLL (build strips)
  // =========================================================
  const photos = [
    "assets/photos/p9.jpg",
    "assets/photos/p16.jpg",
    "assets/photos/p2.jpg",
    "assets/photos/p6.jpg",
    "assets/photos/p3.jpg",
    "assets/photos/p14.jpg",
  ];

  function buildStrip(el, offset = 0) {
    if (!el) return;
    const rotated = photos.slice(offset).concat(photos.slice(0, offset));

    const frames = [];
    const repeatTimes = 3;
    for (let r = 0; r < repeatTimes; r++) {
      for (const src of rotated) {
        frames.push(`
          <div class="film-frame">
            <img src="${src}" alt="">
          </div>
        `);
      }
    }
    el.innerHTML = frames.join("");
  }

  buildStrip(document.querySelector(".strip-a"), 0);
  buildStrip(document.querySelector(".strip-b"), 2);
  buildStrip(document.querySelector(".strip-c"), 4);

  // =========================================================
  // 1) MÚSICA DE FONDO (inicia con gesto del usuario)
  // =========================================================
  const bgMusic = $("#bgMusic");
  const musicToggle = $("#musicToggle");
  let musicEnabled = false;

  function updateMusicUI() {
    if (!musicToggle) return;
    musicToggle.setAttribute("aria-pressed", musicEnabled ? "true" : "false");

    const text = musicToggle.querySelector(".music-toggle__text");
    if (text) text.textContent = musicEnabled ? "Music: On" : "Music: Off";

    musicToggle.setAttribute(
      "aria-label",
      musicEnabled ? "Silenciar música" : "Activar música"
    );
  }

  async function tryPlayMusic() {
    if (!bgMusic) {
      console.warn("bgMusic not found: revisa <audio id='bgMusic'>");
      musicEnabled = false;
      updateMusicUI();
      return;
    }

    try {
      bgMusic.muted = false;
      bgMusic.volume = 0.35;
      await bgMusic.play();
      musicEnabled = true;
      updateMusicUI();
    } catch (e) {
      console.warn("Music play blocked/fail:", e);
      musicEnabled = false;
      updateMusicUI();
    }
  }

  function stopMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    musicEnabled = false;
    updateMusicUI();
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", async () => {
      if (!bgMusic) return;
      if (musicEnabled) {
        bgMusic.pause();
        musicEnabled = false;
        updateMusicUI();
      } else {
        await tryPlayMusic();
      }
    });
  }

  updateMusicUI();

  // =========================================================
  // 2) INTRO (SOBRE) -> MAIN
  // =========================================================
  const intro = $("#intro");
  const main = $("#main");
  const envelopeBtn = $("#envelopeBtn");
  let opened = false;

  function initScreenFromHash() {
    const initial = (location.hash || "#home").replace("#", "");
    const exists = $(`.screen[data-screen="${initial}"]`);
    if (exists) showScreen(initial, { updateHash: true });
    else showScreen("home", { updateHash: true });
  }

  function openEnvelopeAndEnter() {
    if (opened) return;
    opened = true;

    // Pausar animación de film-strip
    document.body.classList.add("film-paused");

    // Animación apertura
    if (intro) intro.classList.add("is-opening");

    window.setTimeout(() => {
      if (intro) intro.classList.add("is-open");
    }, 520);

    window.setTimeout(() => {
      if (intro) intro.classList.add("is-fading-out");
    }, 1350);

    window.setTimeout(async () => {
      if (intro) intro.style.display = "none";
      if (main) {
        main.classList.remove("is-hidden");
        main.classList.add("is-ready");
      }

      // Iniciar música tras el gesto (click del sobre)
      await tryPlayMusic();

      window.scrollTo(0, 0);
      initScreenFromHash();
    }, 1820);
  }

  if (envelopeBtn) {
    envelopeBtn.addEventListener("click", openEnvelopeAndEnter);
    envelopeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEnvelopeAndEnter();
      }
    });
  }

  // =========================================================
  // 3) NAVEGACIÓN POR PANTALLAS (SIN SCROLL)
  // =========================================================
  const navLinks = $$(".side-nav a[data-screen]");
  const screens = $$(".screen[data-screen]");

  function showScreen(name, { updateHash = true } = {}) {
    screens.forEach((s) => {
      s.classList.toggle("is-active", s.dataset.screen === name);
    });

    navLinks.forEach((a) => {
      a.classList.toggle("is-active", a.dataset.screen === name);
    });

    if (updateHash) {
      history.replaceState(null, "", `#${name}`);
    }
  }

  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen(a.dataset.screen, { updateHash: true });
    });
  });

  // Si main ya está visible (modo debug), inicia
  if (main && !main.classList.contains("is-hidden")) {
    initScreenFromHash();
  }

  // Botones internos (data-goto)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-goto]");
    if (!btn) return;

    const target = btn.getAttribute("data-goto");
    if (!target) return;

    if ($(`.screen[data-screen="${target}"]`)) {
      showScreen(target, { updateHash: true });
    }
  });

  // =========================================================
  // 4) OUR STORY MODAL
  // =========================================================
  const storyCards = $$("#story .story-card");
  const storyModal = $("#storyModal");
  const closeModalBtn = $("#closeModal");

  const modalImage = $("#modalImage");
  const modalTitle = $("#modalTitle");
  const modalDate = $("#modalDate");
  const modalText = $("#modalText");

  function openStoryModal(card) {
    if (!storyModal) return;

    if (modalImage) {
      modalImage.src = card.dataset.img || "";
      modalImage.alt = card.dataset.title || "Story photo";
    }
    if (modalTitle) modalTitle.textContent = card.dataset.title || "";
    if (modalDate) modalDate.textContent = card.dataset.date || "";
    if (modalText) modalText.textContent = card.dataset.text || "";

    storyModal.classList.add("is-open");
    storyModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeStoryModal() {
    if (!storyModal) return;

    storyModal.classList.remove("is-open");
    storyModal.setAttribute("aria-hidden", "true");
    if (modalImage) modalImage.src = "";
    document.body.style.overflow = "";
  }

  storyCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openStoryModal(card);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeStoryModal();
    });
  }

  if (storyModal) {
    storyModal.addEventListener("click", (e) => {
      if (e.target === storyModal) closeStoryModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      storyModal &&
      storyModal.classList.contains("is-open")
    ) {
      closeStoryModal();
    }
  });

  // =========================================================
  // 5) COUNTDOWN (HOME)
  // =========================================================
  const WEDDING_DATETIME = "2026-04-18T14:00:00"; // ajusta a tu fecha real

  const cdDays = $("#cdDays");
  const cdHours = $("#cdHours");
  const cdMinutes = $("#cdMinutes");
  const cdSeconds = $("#cdSeconds");
  const weddingDateText = $("#weddingDateText");

  function formatLongDate(dt) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(dt);
  }

  function startCountdown() {
    if (!cdDays || !cdHours || !cdMinutes || !cdSeconds) return;

    const target = new Date(WEDDING_DATETIME);
    if (Number.isNaN(target.getTime())) {
      cdDays.textContent = "--";
      cdHours.textContent = "--";
      cdMinutes.textContent = "--";
      cdSeconds.textContent = "--";
      if (weddingDateText) weddingDateText.textContent = "[Invalid date]";
      return;
    }

    if (weddingDateText) weddingDateText.textContent = formatLongDate(target);

    function tick() {
      const now = new Date();
      let diffMs = target.getTime() - now.getTime();

      if (diffMs <= 0) {
        cdDays.textContent = "00";
        cdHours.textContent = "00";
        cdMinutes.textContent = "00";
        cdSeconds.textContent = "00";
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      cdDays.textContent = pad2(days);
      cdHours.textContent = pad2(hours);
      cdMinutes.textContent = pad2(minutes);
      cdSeconds.textContent = pad2(seconds);
    }

    tick();
    window.setInterval(tick, 1000);
  }

  startCountdown();
})();

/* ================================
   RSVP -> Google Sheets (Apps Script)
   (único handler, sin duplicados)
   ================================ */
(() => {
  const form = document.getElementById("rsvpForm");
  if (!form) return;

  const statusEl = document.getElementById("rsvpStatus");
  const guestsEl = document.getElementById("rsvpGuests");

  // 👇 TU URL actual (la dejo igual)
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbynzdrKtjvdCN9AJokZQcaqhq9LhnZDe3kyd0JwcdEw3H577LtmzDT3-Uo1akhUURNUyg/exec";

  let isSubmitting = false;

  const setStatus = (msg) => {
    if (statusEl) statusEl.textContent = msg || "";
  };

  function setError(name, msg) {
    const err = form.querySelector(`[data-error-for="${name}"]`);
    if (err) err.textContent = msg || "";

    // Marca visual del field (si quieres, luego le damos estilo en CSS)
    if (err) {
      const field = err.closest(".field");
      if (field) {
        if (msg) field.classList.add("is-error");
        else field.classList.remove("is-error");
      }
    }
  }

  function clearErrors() {
    setError("name", "");
    setError("attending", "");
  }

  function lockGuestsIfNo(attendingValue) {
    if (!guestsEl) return;
    if (attendingValue === "no") {
      guestsEl.value = "1";
      guestsEl.disabled = true;
    } else {
      guestsEl.disabled = false;
    }
  }

  form.addEventListener("change", (e) => {
    if (e.target && e.target.name === "attending") {
      lockGuestsIfNo(e.target.value);
    }
  });

  async function sendToAppsScript(payload) {
    const params = new URLSearchParams(payload);

    // Evita “colgado infinito”
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      // IMPORTANTE:
      // - Si tu Apps Script NO tiene CORS permitido, usamos no-cors.
      // - En no-cors no podemos leer respuesta, pero el POST sí sale.
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: params,
        signal: controller.signal,
      });

      return true;
    } catch (err) {
      console.error("RSVP send failed:", err);
      return false;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (isSubmitting) return;

    clearErrors();
    setStatus("");

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    // Honeypot anti-spam
    if (String(payload.company || "").trim() !== "") {
      setStatus("Listo. ¡Gracias por confirmar!");
      form.reset();
      if (guestsEl) guestsEl.disabled = false;
      return;
    }

    // Validación mínima
    if (!String(payload.name || "").trim()) {
      setError("name", "Por favor escribe tu nombre.");
      return;
    }
    if (!payload.attending) {
      setError("attending", "Por favor selecciona Sí o No.");
      return;
    }

    // Normalización
    payload.name = String(payload.name || "").trim();
    payload.phone = String(payload.phone || "").trim();
    payload.attending = String(payload.attending || "").trim();
    payload.guests = String(payload.guests || "1").trim();
    payload.message = String(payload.message || "").trim();
    payload.userAgent = navigator.userAgent;

    if (payload.attending === "no") payload.guests = "1";

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    isSubmitting = true;
    form.classList.add("is-submitting");
    setStatus("Enviando...");

    const ok = await sendToAppsScript(payload);

    if (ok) {
      setStatus("Listo. ¡Gracias por confirmar!");
      form.reset();
      if (guestsEl) guestsEl.disabled = false;
    } else {
      setStatus("No se pudo enviar. Intenta de nuevo.");
    }

    isSubmitting = false;
    form.classList.remove("is-submitting");
    if (submitBtn) submitBtn.disabled = false;
  });
})();
/* =========================================
   PAUSAR MÚSICA AL SALIR DE LA PÁGINA / BLOQUEAR CELULAR
   ========================================= */

document.addEventListener("visibilitychange", () => {
  const bgMusic = document.getElementById("bgMusic");
  if (!bgMusic) return;

  if (document.hidden) {
    // Página no visible → pausa música
    bgMusic.pause();
  }
});


