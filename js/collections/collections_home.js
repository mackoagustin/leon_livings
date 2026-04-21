const COLECCIONES_DATA_URL = "data/colecciones.json";

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/** Acepta rutas con o sin barra inicial (mismo criterio que product.json). */
function normalizeAssetPath(path) {
    if (!path) return "";
    const p = String(path).trim();
    return p.startsWith("/") ? p.slice(1) : p;
}

function getCollectionsArray(data) {
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.collections)) return data.collections;
    if (Array.isArray(data.colecctions)) return data.colecctions;
    return [];
}

function cardImageUrl(collection) {
    const thumb = collection.thumbnail || collection.heroImage;
    return normalizeAssetPath(thumb);
}

async function loadCollectionsHome() {
    const container = document.querySelector('[data-component="collections-home"]');
    if (!container) {
        console.warn('[collections-home] Falta contenedor data-component="collections-home"');
        return;
    }

    try {
        const res = await fetch(COLECCIONES_DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${COLECCIONES_DATA_URL}`);
        const data = await res.json();
        const collections = getCollectionsArray(data);

        if (!collections.length) {
            container.innerHTML = "";
            return;
        }

        container.innerHTML = collections
            .map((c) => {
                const slug = c.slug || c.id;
                const name = c.name || slug;
                const href = `coleccion.html?slug=${encodeURIComponent(slug)}`;
                const imgSrc = escapeHtml(cardImageUrl(c));
                const alt = escapeHtml(c.alt);
                return `
            <div class="collection-card" role="link" tabindex="0" data-href="${escapeHtml(href)}">
                <img src="${imgSrc}" alt="${alt}">
                <div class="collection-overlay"></div>
                <div class="collection-content">
                    <h3 class="collection-name">${escapeHtml(name)}</h3>
                    <p class="collection-link">Ver colección →</p>
                </div>
            </div>`;
            })
            .join("");

        const cards = container.querySelectorAll(".collection-card[data-href]");
        cards.forEach((card) => {
            const href = card.getAttribute("data-href");
            const go = () => {
                if (href) window.location.href = href;
            };
            card.addEventListener("click", go);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    go();
                }
            });
        });
    } catch (err) {
        console.error("[collections-home]", err);
    }
}

function bootCollectionsHome() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadCollectionsHome);
    } else {
        loadCollectionsHome();
    }
}

bootCollectionsHome();
