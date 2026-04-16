/**
 * Rellena el bloque [data-component="hero"] desde data/hero_image.json
 */
const HERO_DATA_URL = "data/hero_image.json";

async function loadHero() {
    const container = document.querySelector('[data-component="hero"]');
    if (!container) {
        console.warn("[hero] No hay sección con data-component=\"hero\"");
        return;
    }

    try {
        const res = await fetch(HERO_DATA_URL);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} al cargar ${HERO_DATA_URL}`);
        }
        const data = await res.json();
        const hero = data.hero;
        if (!hero) {
            throw new Error('JSON sin propiedad "hero"');
        }

        container.innerHTML = `
      <div class="hero-image">
        <img src="${hero.image}" alt="Outdoor Furniture">
      </div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-text">
          <p class="hero-subtitle">${hero.subtitle}</p>
          <h1 class="hero-title">
            ${hero.title.replace(/\n/g, "<br>")}
          </h1>
          <p class="hero-description">
            ${hero.description}
          </p>
          <button type="button" class="btn-primary" onclick="window.open('${hero.cta.link}', '_blank')">
            <svg class="btn-icon" fill="white" viewBox="0 0 20 20">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            ${hero.cta.text}
          </button>
        </div>
      </div>
    `;
    } catch (err) {
        console.error("[hero]", err);
    }
}

function bootHero() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadHero);
    } else {
        loadHero();
    }
}

bootHero();
