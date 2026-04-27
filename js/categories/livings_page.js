const PRODUCT_DATA_URL = "data/product.json";
const INDEX_HREF = "./index.html";
const SITE_NAME = "Leon Living";
const LIVING_CATEGORIES = ["sillones", "mesas-ratonas"];

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizeAssetPath(path) {
    if (!path) return "";
    const p = String(path).trim();
    return p.startsWith("/") ? p.slice(1) : p;
}

function bindProductGrid(container) {
    const cards = container.querySelectorAll(".product-card[data-href]");
    cards.forEach((card) => {
        const href = card.getAttribute("data-href");
        const openDetail = () => {
            if (href) window.location.href = href;
        };
        card.addEventListener("click", (e) => {
            if (e.target.closest(".btn-secondary")) return;
            openDetail();
        });
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail();
            }
        });
        const btn = card.querySelector(".btn-secondary");
        const link = card.getAttribute("data-cta");
        if (btn && link) {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                window.open(link, "_blank", "noopener,noreferrer");
            });
        }
    });
}

function renderLivingsPage(container, products) {
    const productsHtml =
        products.length > 0
            ? products
                  .map((product) => {
                      const detailUrl = `product.html?slug=${encodeURIComponent(product.slug)}`;
                      const image = normalizeAssetPath(product.images?.main || "");
                      const ctaLink = product.cta?.link || "";
                      return `
            <div class="product-card" role="link" tabindex="0" data-href="${escapeHtml(detailUrl)}" data-cta="${escapeHtml(ctaLink)}">
                <div class="product-image">
                    <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}">
                </div>
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <button type="button" class="btn-secondary">Consultar por whatsapp</button>
            </div>`;
                  })
                  .join("")
            : `<p class="collection-page-empty">No hay productos de living cargados todavía.</p>`;

    container.innerHTML = `
        <section class="collection-page-intro section-products">
            <div class="container product-container">
                <button type="button" class="back-button" data-action="back">
                    <svg class="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>
            </div>
        </section>
        <section class="section-products collection-page-products">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Muebles de living exterior</h2>
                    <p class="section-subtitle">Combiná sillones y mesas ratonas para crear tu espacio ideal</p>
                </div>
                <div class="products-grid" data-livings-products>
                    ${productsHtml}
                </div>
            </div>
        </section>
    `;

    document.title = `Livings — ${SITE_NAME}`;

    container.querySelector('[data-action="back"]')?.addEventListener("click", () => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = `${INDEX_HREF}#categorias`;
    });

    const grid = container.querySelector("[data-livings-products]");
    if (grid) bindProductGrid(grid);
}

async function loadLivingsPage() {
    const container = document.querySelector('[data-component="livings-page"]');
    if (!container) {
        console.warn('[livings-page] Falta contenedor data-component="livings-page"');
        return;
    }

    try {
        const res = await fetch(PRODUCT_DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${PRODUCT_DATA_URL}`);
        const data = await res.json();
        const allProducts = Array.isArray(data.product) ? data.product : [];
        const filtered = allProducts.filter((p) => LIVING_CATEGORIES.includes(p.category));
        renderLivingsPage(container, filtered);
    } catch (err) {
        console.error("[livings-page]", err);
        container.innerHTML = `
            <section class="collection-page-intro section-products">
                <div class="container product-container">
                    <p class="product-description">No pudimos cargar la sección Livings. Intentá de nuevo más tarde.</p>
                    <p class="product-description" style="margin-top:1rem;">
                        <a href="${INDEX_HREF}#categorias">Volver al inicio</a>
                    </p>
                </div>
            </section>
        `;
        document.title = `Error — ${SITE_NAME}`;
    }
}

function bootLivingsPage() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadLivingsPage);
    } else {
        loadLivingsPage();
    }
}

bootLivingsPage();
