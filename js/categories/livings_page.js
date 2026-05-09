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
            if (e.target.closest(".btn-primary")) return;
            openDetail();
        });
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail();
            }
        });
        const btn = card.querySelector(".btn-primary");
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
                    <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">
                </div>
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <button type="button" class="btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="btn-icon" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg>
                    Consultar por whatsapp
                </button>
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
        else window.location.href = "categoria.html";
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
                        <a href="categoria.html">Volver a categorías</a>
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
