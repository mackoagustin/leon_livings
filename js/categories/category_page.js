const PRODUCT_DATA_URL = "data/product.json";
const INDEX_HREF = "./index.html";
const SITE_NAME = "Leon Living";

const CATEGORY_CONFIG = {
    sillas: {
        title: "Sillas",
        includes: ["sillas"],
    },
    barras: {
        title: "Barras",
        includes: ["barras"],
    },
    mesas: {
        title: "Mesas",
        includes: ["mesas-de-comedor", "mesas-ratonas"],
    },
    reposeras: {
        title: "Reposeras",
        includes: ["reposeras", "reposeras-dobles"],
    },
    pergolas: {
        title: "Pérgolas",
        includes: ["pergolas"],
    },
    livings: {
        title: "Livings",
        includes: ["sillones", "mesas-ratonas"],
    },
};

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

function getCategorySlug() {
    const hash = window.location.hash.replace(/^#/, "").trim().toLowerCase();
    if (hash) return hash;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug") || params.get("category");
    return slug ? decodeURIComponent(slug).trim().toLowerCase() : null;
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

function renderInvalidCategory(container) {
    container.innerHTML = `
        <section class="collection-page-intro section-products">
            <div class="container product-container">
                <button type="button" class="back-button" data-action="back">
                    <svg class="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>
                <p class="product-description">No encontramos la categoría solicitada.</p>
                <p class="product-description" style="margin-top:1rem;">
                    <a href="${INDEX_HREF}#categorias">Ver categorías</a>
                </p>
            </div>
        </section>
    `;
    document.title = `Categoría no encontrada — ${SITE_NAME}`;
}

function renderCategoryPage(container, config, products) {
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
            : `<p class="collection-page-empty">No hay productos cargados para esta categoría todavía.</p>`;

    container.innerHTML = `
        <section class="collection-page-intro section-products">
            <div class="container product-container">
                <nav class="breadcrumb-nav" aria-label="Breadcrumb">
                    <a class="breadcrumb-link" href="${INDEX_HREF}">Inicio</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <a class="breadcrumb-link" href="${INDEX_HREF}#categorias">Categorías</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <span class="breadcrumb-current">${escapeHtml(config.title)}</span>
                </nav>
            </div>
        </section>
        <section class="section-products collection-page-products category-products-section">
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${escapeHtml(config.title)}</h1>
                    <p class="section-subtitle">Explorá todos los productos de esta categoría</p>
                </div>
                <div class="products-grid" data-category-products>
                    ${productsHtml}
                </div>
            </div>
        </section>
    `;

    document.title = `${config.title} — ${SITE_NAME}`;

    const grid = container.querySelector("[data-category-products]");
    if (grid) bindProductGrid(grid);
}

async function loadCategoryPage() {
    const container = document.querySelector('[data-component="category-page"]');
    if (!container) {
        console.warn('[category-page] Falta contenedor data-component="category-page"');
        return;
    }

    const slug = getCategorySlug();
    const config = slug ? CATEGORY_CONFIG[slug] : null;
    if (!config) {
        renderInvalidCategory(container);
        container.querySelector('[data-action="back"]')?.addEventListener("click", () => {
            if (window.history.length > 1) window.history.back();
            else window.location.href = `${INDEX_HREF}#categorias`;
        });
        return;
    }

    try {
        const res = await fetch(PRODUCT_DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${PRODUCT_DATA_URL}`);
        const data = await res.json();
        const allProducts = Array.isArray(data.product) ? data.product : [];
        const filtered = allProducts.filter((p) => config.includes.includes(p.category));
        renderCategoryPage(container, config, filtered);
    } catch (err) {
        console.error("[category-page]", err);
        container.innerHTML = `
            <section class="collection-page-intro section-products">
                <div class="container product-container">
                    <p class="product-description">No pudimos cargar la categoría. Intentá de nuevo más tarde.</p>
                    <p class="product-description" style="margin-top:1rem;">
                        <a href="${INDEX_HREF}#categorias">Volver al inicio</a>
                    </p>
                </div>
            </section>
        `;
        document.title = `Error — ${SITE_NAME}`;
    }
}

function bootCategoryPage() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadCategoryPage);
    } else {
        loadCategoryPage();
    }
}

bootCategoryPage();
