const PRODUCT_DATA_URL = "data/product.json";
const INDEX_HREF = "./index.html";
const SITE_NAME = "Leon Living";
const CATEGORY_OVERVIEW = [
    { slug: "sillas", title: "Sillas", image: "assets/products/sillas/silla_de_aluminio/silla1.webp" },
    { slug: "barras", title: "Barras", image: "assets/products/barras/barra2.webp" },
    { slug: "mesas", title: "Mesas", image: "assets/products/mesa_comedor/mesa_comedor1.webp" },
    { slug: "reposeras", title: "Reposeras", image: "assets/products/reposeras/reposera_capri/reposera_capri2.webp" },
    { slug: "pergolas", title: "Pérgolas", image: "assets/products/pergolas/pergola1.webp" },
    { slug: "livings", title: "Livings", image: "assets/products/mesas_ratonas/mesa_ratona1.webp" },
    { slug: "sillones", title: "Sillones", image: "assets/products/sillones/clasicos/luit/dos_cuerpos/dos_cuerpos1.webp" },
];

const CATEGORY_CONFIG = {
    sillas: {
        title: "Sillas",
        includes: ["sillas", "bancos"],
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
    sillones: {
        title: "Sillones",
        includes: ["sillones"],
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
                    <a href="categoria.html">Ver categorías</a>
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
            : `<p class="collection-page-empty">No hay productos cargados para esta categoría todavía.</p>`;

    container.innerHTML = `
        <section class="collection-page-intro section-products">
            <div class="container product-container">
                <nav class="breadcrumb-nav" aria-label="Breadcrumb">
                    <a class="breadcrumb-link" href="${INDEX_HREF}">Inicio</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <a class="breadcrumb-link" href="categoria.html">Categorías</a>
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

function renderCategoriesOverview(container) {
    const categoriesBySlug = Object.fromEntries(
        CATEGORY_OVERVIEW.map((category) => [category.slug, category])
    );
    const cardMarkup = (slug, extraClass = "") => {
        const category = categoriesBySlug[slug];
        if (!category) return "";
        const href = `categoria.html?slug=${encodeURIComponent(category.slug)}`;
        const image = normalizeAssetPath(category.image);
        return `
            <div class="category-card ${extraClass}" role="link" tabindex="0" data-href="${escapeHtml(href)}">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(category.title)}" loading="lazy" decoding="async">
                <div class="category-overlay"></div>
                <div class="category-content">
                    <h3 class="category-name">${escapeHtml(category.title)}</h3>
                    <p class="category-link">Ver más →</p>
                </div>
            </div>`;
    };

    container.innerHTML = `
        <section class="section-collections collection-page-products">
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">Categorías</h1>
                    <p class="section-subtitle">Explorá todo nuestro mobiliario</p>
                </div>
                <div class="categories-grid" data-categories-overview>
                    <div class="categories-left">
                        ${cardMarkup("sillas", "category-tall")}
                        ${cardMarkup("barras", "category-medium")}
                    </div>
                    <div class="categories-right">
                        ${cardMarkup("mesas", "category-medium")}
                        <div class="categories-bottom">
                            ${cardMarkup("reposeras", "category-small")}
                            ${cardMarkup("pergolas", "category-small")}
                        </div>
                    </div>
                </div>
                <div class="categories-featured">
                    ${cardMarkup("livings", "category-medium")}
                    ${cardMarkup("sillones", "category-medium")}
                </div>
            </div>
        </section>
    `;

    document.title = `Categorías — ${SITE_NAME}`;

    const cards = container.querySelectorAll(".category-card[data-href]");
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
}

async function loadCategoryPage() {
    const container = document.querySelector('[data-component="category-page"]');
    if (!container) {
        console.warn('[category-page] Falta contenedor data-component="category-page"');
        return;
    }

    const slug = getCategorySlug();
    if (!slug) {
        renderCategoriesOverview(container);
        return;
    }

    const config = CATEGORY_CONFIG[slug];
    if (!config) {
        renderInvalidCategory(container);
        container.querySelector('[data-action="back"]')?.addEventListener("click", () => {
            if (window.history.length > 1) window.history.back();
            else window.location.href = "categoria.html";
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
                        <a href="categoria.html">Volver a categorías</a>
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
