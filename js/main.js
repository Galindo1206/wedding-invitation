(() => {
  // =========================================================
  // Helpers
  // =========================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => root.querySelectorAll(sel);

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  // =========================================================
  // 1) INTRO (SOBRE) -> MAIN
  // =========================================================
  const intro = $("#intro");
  const main = $("#main");
  const envelopeBtn = $("#envelopeBtn");

/*INTRO film roll*/
 // Reemplaza con las fotos reales (ruta local o URL)
  const photos = [
    "assets/photos/p9.jpg",
    "assets/photos/p16.jpg",
    "assets/photos/p2.jpg",
    "assets/photos/p6.jpg",
    "assets/photos/p3.jpg",
    "assets/photos/p14.jpg",

  ];

  function buildStrip(el, offset = 0){
    // rota el array para que cada tira tenga orden distinto
    const rotated = photos.slice(offset).concat(photos.slice(0, offset));

    // crea suficientes frames para cubrir el ancho (repite 2–3 veces)
    const frames = [];
    const repeatTimes = 3;
    for(let r=0; r<repeatTimes; r++){
      for(const src of rotated){
        frames.push(`
          <div class="film-frame">
            <img src="${src}" alt="">
          </div>
        `);
      }
    }
    el.innerHTML = frames.join("");
  }

  const stripA = document.querySelector(".strip-a");
  const stripB = document.querySelector(".strip-b");
  const stripC = document.querySelector(".strip-c");

  buildStrip(stripA, 0);
  buildStrip(stripB, 2);
  buildStrip(stripC, 4);




  // =========================================================
// 0) MÚSICA DE FONDO (inicia con gesto del usuario)
// =========================================================
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

let musicEnabled = false;

// UI helper
function updateMusicUI() {
  if (!musicToggle) return;
  musicToggle.setAttribute("aria-pressed", musicEnabled ? "true" : "false");
  const text = musicToggle.querySelector(".music-toggle__text");
  if (text) text.textContent = musicEnabled ? "Music: On" : "Music: Off";
  musicToggle.setAttribute("aria-label", musicEnabled ? "Silenciar música" : "Activar música");
}

// Intentar reproducir (solo funciona tras interacción del usuario)
async function tryPlayMusic() {
  if (!bgMusic) {
    console.warn("bgMusic not found: revisa <audio id='bgMusic'>");
    return;
  }

  try {
    bgMusic.muted = false;     // <- clave
    bgMusic.volume = 0.35;
    await bgMusic.play();
    musicEnabled = true;
    updateMusicUI();
  } catch (e) {
    console.warn("Music play blocked/fail:", e); // <- clave para saber qué pasa
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

// Toggle manual
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

// Estado inicial UI
updateMusicUI();


  let opened = false;

  function openEnvelopeAndEnter() {
    if (opened) return;
    opened = true;
      document.body.classList.add("film-paused");


    // Iniciar música con el click del sobre (gesto permitido)


    // Animación de apertura
    if (intro) intro.classList.add("is-opening");

    // “Carta” sale (si estás usando imagen de sobre, igual funciona por clases)
    window.setTimeout(() => {
      if (intro) intro.classList.add("is-open");
    }, 520);

    // Fade out del intro
    window.setTimeout(() => {
      if (intro) intro.classList.add("is-fading-out");
    }, 1350);

    // Mostrar main
    window.setTimeout(() => {
     if (intro) intro.style.display = "none";
if (main) {
  main.classList.remove("is-hidden");
  main.classList.add("is-ready");
}
  tryPlayMusic();

      // Evitar que quede “a mitad” de pantalla al entrar
      window.scrollTo(0, 0);

      // Abrir pantalla según hash o home por defecto
      initScreenFromHash();
    }, 1820);
  }

  if (envelopeBtn) {
    envelopeBtn.addEventListener("click", openEnvelopeAndEnter);

    // Accesibilidad: Enter / Espacio
    envelopeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEnvelopeAndEnter();
      }
    });
  }

  // =========================================================
  // 2) NAVEGACIÓN POR PANTALLAS (SIN SCROLL DE PÁGINA)
  //    Menú flotante: .side-nav a[data-screen]
  // =========================================================
  const navLinks = $$(".side-nav a[data-screen]");
  const screens = $$(".screen[data-screen]");

  function showScreen(name, { updateHash = true } = {}) {
    // Cambiar pantallas visibles
    screens.forEach((s) => {
      s.classList.toggle("is-active", s.dataset.screen === name);
    });

    // Estado activo en menú
    navLinks.forEach((a) => {
      a.classList.toggle("is-active", a.dataset.screen === name);
    });

    // Hash “limpio” (sin recargar)
    if (updateHash) {
      history.replaceState(null, "", `#${name}`);
    }
  }

  function initScreenFromHash() {
    const initial = (location.hash || "#home").replace("#", "");
    const exists = $(`.screen[data-screen="${initial}"]`);
    if (exists) showScreen(initial, { updateHash: true });
    else showScreen("home", { updateHash: true });
  }

  // Clics del menú flotante (derecha)
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showScreen(a.dataset.screen, { updateHash: true });
    });
  });

  // Si por pruebas el main ya está visible, inicializa de inmediato
  if (main && !main.classList.contains("is-hidden")) {
    initScreenFromHash();
  }

  // =========================================================
  // 3) BOTONES INTERNOS: data-goto="itinerary" / "rsvp"
  // =========================================================
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
  // 3.5) OUR STORY MODAL (CLICK EN FOTOS)
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

  // Click en cada foto
  storyCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Evita que cualquier handler global interfiera
      e.preventDefault();
      e.stopPropagation();
      openStoryModal(card);
    });
  });

  // Botón cerrar
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeStoryModal();
    });
  }

  // Cerrar al hacer click fuera del contenido
  if (storyModal) {
    storyModal.addEventListener("click", (e) => {
      if (e.target === storyModal) closeStoryModal();
    });
  }

  // Cerrar con Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && storyModal && storyModal.classList.contains("is-open")) {
      closeStoryModal();
    }
  });


  // =========================================================
  // 4) COUNTDOWN (HOME)
  // =========================================================
  // Cambia esta fecha/hora por la real de la boda (hora local):
  // Formato: "YYYY-MM-DDTHH:MM:SS"
  const WEDDING_DATETIME = "2026-04-18T14:00:00"; // EJEMPLO

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
    // Si Home no tiene el contador aún, no hacemos nada
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

// ================================
// RSVP -> Google Sheets (Apps Script) [Mejorado]
// ================================
(function () {
  const form = document.getElementById("rsvpForm");
  if (!form) return;

  const statusEl = document.getElementById("rsvpStatus");
  const guestsEl = document.getElementById("rsvpGuests");

  // URL de tu Google Apps Script Web App
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbynzdrKtjvdCN9AJokZQcaqhq9LhnZDe3kyd0JwcdEw3H577LtmzDT3-Uo1akhUURNUyg/exec";

  let isSubmitting = false;

  const setStatus = (msg) => {
    if (statusEl) statusEl.textContent = msg || "";
  };

  function setError(name, msg) {
    const err = form.querySelector(`[data-error-for="${name}"]`);
    if (err) err.textContent = msg || "";

    // Marca visual del field
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

  function normalizePayload(payload) {
    // Normaliza strings
    payload.name = String(payload.name || "").trim();
    payload.phone = String(payload.phone || "").trim();
    payload.attending = String(payload.attending || "").trim();
    payload.guests = String(payload.guests || "1").trim();
    payload.message = String(payload.message || "").trim();
    payload.userAgent = navigator.userAgent;

    // Si no asiste, guests siempre 1
    if (payload.attending === "no") payload.guests = "1";

    return payload;
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

  // UX: si "no", guests = 1 y se bloquea
  form.addEventListener("change", (e) => {
    if (e.target && e.target.name === "attending") {
      lockGuestsIfNo(e.target.value);
    }
  });

  async function postToAppsScript(payload) {
    const params = new URLSearchParams(payload);

    // Timeout controlado (evita “colgado” infinito)
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

try {
  const params = new URLSearchParams(payload);

  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors", // 👈 ESTA ES LA CLAVE
    body: params,
  });

  // En no-cors no se puede leer la respuesta,
  // así que asumimos éxito si no lanza error
  statusEl.textContent = "Listo. ¡Gracias por confirmar!";
  form.reset();
  if (guestsEl) guestsEl.disabled = false;
} catch (err) {
  console.error(err);
  statusEl.textContent = "No se pudo enviar. Intenta de nuevo.";
} finally {
  isSubmitting = false;
  if (submitBtn) submitBtn.disabled = false;
}

  }

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (isSubmitting) return;

  clearErrors();
  statusEl.textContent = "";

  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  payload.userAgent = navigator.userAgent;

  // Honeypot anti-spam
  if (String(payload.company || "").trim() !== "") {
    statusEl.textContent = "Listo. ¡Gracias por confirmar!";
    form.reset();
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

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  statusEl.textContent = "Enviando...";
  isSubmitting = true;
  form.classList.add("is-submitting");


  try {
    const params = new URLSearchParams(payload);

    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: params,
    });

    statusEl.textContent = "Listo. ¡Gracias por confirmar!";
    form.reset();
    if (guestsEl) guestsEl.disabled = false;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "No se pudo enviar. Intenta de nuevo.";
  } finally {
    isSubmitting = false;
    form.classList.remove("is-submitting");
    if (submitBtn) submitBtn.disabled = false;
  }
});

(function () {
  const form = document.getElementById("rsvpForm");
  if (!form) return;

  const statusEl = document.getElementById("rsvpStatus");

  const setStatus = (msg, type = "info") => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.type = type;
  };

  const setError = (name, msg) => {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };

  const clearErrors = () => {
    ["name", "attending"].forEach((k) => setError(k, ""));
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    // Honeypot
    const company = form.querySelector("#company");
    if (company && company.value.trim() !== "") {
      setStatus("Submission blocked.", "error");
      return;
    }

    const name = form.name.value.trim();
    const attending = form.attending.value; // radio

    let ok = true;

    if (!name) {
      setError("name", "Por favor escribe tu nombre.");
      ok = false;
    }

    if (!attending) {
      setError("attending", "Por favor elige una opción.");
      ok = false;
    }

    if (!ok) {
      setStatus("Revisa los campos marcados.", "error");
      return;
    }

    // Simulación (sin backend)
    // Aquí luego se integra a Google Sheets / API.
    setStatus("Enviando...", "loading");
    await new Promise((r) => setTimeout(r, 700));

    // Éxito
    setStatus("Gracias. RSVP recibido.", "success");
    form.reset();
  });
})();



})();



