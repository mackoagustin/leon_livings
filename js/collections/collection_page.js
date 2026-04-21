const PRODUCT_DATA_URL = "data/product.json";
const COLECCIONES_DATA_URL = "data/colecciones.json";
const SITE_NAME = "Leon Living";
const INDEX_HREF = "./index.html";

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

function normalizeAssetList(input) {
    if (Array.isArray(input)) {
        return input
            .map((item) => normalizeAssetPath(item))
            .filter(Boolean);
    }
    const single = normalizeAssetPath(input);
    return single ? [single] : [];
}

function getCollectionSlug() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("slug");
    return q ? decodeURIComponent(q).trim() : null;
}

function getCollectionsArray(data) {
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.collections)) return data.collections;
    if (Array.isArray(data.colecctions)) return data.colecctions;
    return [];
}

/**
 * Indica si el producto pertenece a la colección identificada por slug
 * (string, array de slugs, o null).
 */
function productBelongsToCollection(product, slug) {
    const c = product.collection;
    if (c == null) return false;
    if (Array.isArray(c)) return c.includes(slug);
    return c === slug;
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

function renderNotFound(container, slug) {
    const msg =
        slug == null
            ? "Falta el parámetro de colección en la URL (por ejemplo <code>?slug=capri</code>)."
            : `No encontramos la colección «${escapeHtml(slug)}».`;
    container.innerHTML = `
        <section class="collection-page-intro section-products">
            <div class="container product-container">
                <button type="button" class="back-button" data-action="back">
                    <svg class="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>
                <p class="product-description">${msg}</p>
                <p class="product-description" style="margin-top:1rem;">
                    <a href="${INDEX_HREF}#colecciones">Ver colecciones</a>
                </p>
            </div>
        </section>`;
    document.title =
        slug == null ? `Colección — ${SITE_NAME}` : `Colección no encontrada — ${SITE_NAME}`;
    container.querySelector('[data-action="back"]')?.addEventListener("click", () => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = INDEX_HREF;
    });
}

const COLLECTION_SPEC_LABELS = [
    "MATERIALES Y ESTRUCTURA",
    "PENSADO PARA EXTERIOR",
    "CONFORT Y TEXTILES",
];

const GALLERY_PREV_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>`;
const GALLERY_NEXT_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
const GALLERY_SLIDE_MS = 480;

function preloadImage(src) {
    return new Promise((resolve) => {
        const im = new Image();
        im.onload = () => resolve();
        im.onerror = () => resolve();
        im.src = src;
    });
}

function galleryDirection(from, to, n) {
    let d = to - from;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d > 0 ? "next" : "prev";
}

function bindCollectionGallery(root, imageUrls) {
    const mainWrap = root.querySelector(".main-image");
    const track = root.querySelector("#gallerySlideTrack");
    const img0 = root.querySelector('.gallery-slide-img[data-slide="0"]');
    const img1 = root.querySelector('.gallery-slide-img[data-slide="1"]');
    if (!mainWrap || !track || !img0 || !img1 || !imageUrls.length) return;

    const n = imageUrls.length;
    if (n <= 1) return;

    let index = 0;
    let transitioning = false;

    const slideEasing = "cubic-bezier(0.25, 0.1, 0.25, 1)";
    const transitionCss = `transform ${GALLERY_SLIDE_MS}ms ${slideEasing}`;

    function updateBullets() {
        root.querySelectorAll(".gallery-bullet").forEach((b, j) => {
            const on = j === index;
            b.classList.toggle("is-active", on);
            b.setAttribute("aria-current", on ? "true" : "false");
        });
    }

    function setGalleryBusy(busy) {
        transitioning = busy;
        const gallery = mainWrap?.closest(".product-gallery");
        gallery?.classList.toggle("product-gallery--busy", busy);
    }

    function resetTrackAfterSlide() {
        img0.src = imageUrls[index];
        img1.src = imageUrls[(index + 1) % n];
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        void track.offsetWidth;
        track.style.transition = transitionCss;
    }

    function goTo(targetIndex, forcedDir) {
        let next = targetIndex;
        if (next < 0) next = n - 1;
        if (next >= n) next = 0;
        if (next === index || transitioning) return;

        const dir = forcedDir || galleryDirection(index, next, n);
        setGalleryBusy(true);

        const afterSlide = () => {
            index = next;
            updateBullets();
            resetTrackAfterSlide();
            setGalleryBusy(false);
        };

        let done = false;
        let fallbackTimer = null;

        function onTransitionEnd(ev) {
            if (ev.propertyName !== "transform") return;
            if (done) return;
            done = true;
            track.removeEventListener("transitionend", onTransitionEnd);
            if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
            afterSlide();
        }

        Promise.all([preloadImage(imageUrls[index]), preloadImage(imageUrls[next])]).then(() => {
            if (dir === "next") {
                img0.src = imageUrls[index];
                img1.src = imageUrls[next];
                track.style.transition = "none";
                track.style.transform = "translateX(0)";
                void track.offsetWidth;
                track.style.transition = transitionCss;
                requestAnimationFrame(() => {
                    track.style.transform = "translateX(-50%)";
                });
            } else {
                img0.src = imageUrls[next];
                img1.src = imageUrls[index];
                track.style.transition = "none";
                track.style.transform = "translateX(-50%)";
                void track.offsetWidth;
                track.style.transition = transitionCss;
                requestAnimationFrame(() => {
                    track.style.transform = "translateX(0)";
                });
            }

            track.addEventListener("transitionend", onTransitionEnd);
            fallbackTimer = window.setTimeout(() => {
                if (!done) {
                    done = true;
                    track.removeEventListener("transitionend", onTransitionEnd);
                    afterSlide();
                }
            }, GALLERY_SLIDE_MS + 120);
        });
    }

    root.querySelector(".gallery-nav--prev")?.addEventListener("click", () => {
        let next = index - 1;
        if (next < 0) next = n - 1;
        goTo(next, "prev");
    });

    root.querySelector(".gallery-nav--next")?.addEventListener("click", () => {
        let next = index + 1;
        if (next >= n) next = 0;
        goTo(next, "next");
    });

    root.querySelectorAll(".gallery-bullet").forEach((b) => {
        b.addEventListener("click", () => {
            const i = parseInt(b.getAttribute("data-index"), 10);
            if (Number.isFinite(i) && imageUrls[i] !== undefined) goTo(i);
        });
    });

    mainWrap.setAttribute("tabindex", "0");
    mainWrap.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            let next = index - 1;
            if (next < 0) next = n - 1;
            goTo(next, "prev");
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            let next = index + 1;
            if (next >= n) next = 0;
            goTo(next, "next");
        }
    });
}

function renderCollection(container, collectionMeta, products) {
    const slug = collectionMeta.slug || collectionMeta.id;
    const name = collectionMeta.name || slug;
    const heroSrc = escapeHtml(
        normalizeAssetPath(collectionMeta.heroImage || collectionMeta.thumbnail || "")
    );
    const collectionImages = normalizeAssetList(collectionMeta.collectionImage);
    const collectionImgSrc = collectionImages[0] ? escapeHtml(collectionImages[0]) : "";
    const showGallery = collectionImages.length > 1;
    const totalImages = collectionImages.length;
    const secondSrc = collectionImages.length > 1 ? escapeHtml(collectionImages[1]) : collectionImgSrc;

    const feats = Array.isArray(collectionMeta.features) ? collectionMeta.features : [];
    const specRowsHtml = feats
        .slice(0, 3)
        .map((f, i) => {
            const label = COLLECTION_SPEC_LABELS[i] || `DETALLE ${i + 1}`;
            return `
                <div class="detail-item">
                    <h4 class="detail-label">${escapeHtml(label)}</h4>
                    <p class="detail-value">${escapeHtml(f)}</p>
                </div>`;
        })
        .join("");

    const categoryLine = collectionMeta.style
        ? collectionMeta.style
        : `Colección ${name.charAt(0).toUpperCase() + String(name).slice(1)}`;

    const waLink =
        collectionMeta.cta?.link ||
        (products[0] && products[0].cta?.link) ||
        "https://wa.me/1234567890";

    const hasShowcaseContent =
        collectionImages.length > 0 ||
        collectionMeta.description ||
        collectionMeta.style ||
        feats.length > 0;

    const detailsBlock =
        specRowsHtml.length > 0 ? `<div class="product-details">${specRowsHtml}</div>` : "";

    const showcaseHtml = hasShowcaseContent
        ? `
        <div class="product-grid collection-showcase-root${collectionImgSrc ? "" : " collection-showcase-root--text-only"}">
            ${
                collectionImgSrc
                    ? `<div class="product-gallery">
                <div class="main-image">
                    ${
                        showGallery
                            ? `<div class="gallery-slide-viewport">
                        <div class="gallery-slide-track" id="gallerySlideTrack">
                            <div class="gallery-slide">
                                <img class="gallery-slide-img" data-slide="0" src="${collectionImgSrc}" alt="${escapeHtml(name)} — ambientación principal" width="700" height="600">
                            </div>
                            <div class="gallery-slide">
                                <img class="gallery-slide-img" data-slide="1" src="${secondSrc}" alt="" width="700" height="600">
                            </div>
                        </div>
                    </div>
                    <button type="button" class="gallery-nav gallery-nav--prev" aria-label="Imagen anterior">
                        ${GALLERY_PREV_SVG}
                    </button>
                    <button type="button" class="gallery-nav gallery-nav--next" aria-label="Imagen siguiente">
                        ${GALLERY_NEXT_SVG}
                    </button>`
                            : `<img src="${collectionImgSrc}" alt="${escapeHtml(name)} — ambientación">`
                    }
                </div>
                ${
                    showGallery
                        ? `<div class="gallery-bullets" role="tablist" aria-label="Galería de imágenes de la colección">
                    ${collectionImages
                        .map(
                            (_, i) =>
                                `<button type="button" class="gallery-bullet${i === 0 ? " is-active" : ""}" data-index="${i}" aria-label="Imagen ${i + 1} de ${totalImages}" aria-current="${i === 0 ? "true" : "false"}"></button>`
                        )
                        .join("")}
                </div>`
                        : ""
                }
            </div>`
                    : ""
            }
            <div class="product-info">
                <div>
                    <p class="product-category">${escapeHtml(categoryLine)}</p>
                    <h2 class="product-title">${escapeHtml(name)}</h2>
                    ${
                        collectionMeta.description
                            ? `<p class="product-description">${escapeHtml(collectionMeta.description)}</p>`
                            : ""
                    }
                    ${detailsBlock}
                </div>
                <div class="product-cta">
                    <button type="button" class="btn-primary" style="width: 100%; justify-content: center; padding: 20px;" data-action="open-collection-wa">
                        Consultar
                    </button>
                </div>
            </div>
        </div>`
        : "";

    const productsHtml =
        products.length > 0
            ? products
                  .map((product) => {
                      const detailUrl = `product.html?slug=${encodeURIComponent(product.slug)}`;
                      const main = product.images?.main ? normalizeAssetPath(product.images.main) : "";
                      const ctaLink = product.cta?.link || "";
                      return `
            <div class="product-card" role="link" tabindex="0" data-href="${escapeHtml(detailUrl)}" data-cta="${escapeHtml(ctaLink)}">
                <div class="product-image">
                    <img src="${escapeHtml(main)}" alt="${escapeHtml(product.name)}">
                </div>
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <button type="button" class="btn-secondary">Consultar por whatsapp</button>
            </div>`;
                  })
                  .join("")
            : `<p class="collection-page-empty">No hay productos cargados para esta colección todavía.</p>`;

    container.innerHTML = `
        <section class="collection-hero-banner" aria-labelledby="collection-page-title">
            <div class="collection-hero-banner__media">
                ${heroSrc ? `<img src="${heroSrc}" alt="${escapeHtml(name)}">` : ""}
                <div class="collection-hero-banner__overlay"></div>
            </div>
            <div class="collection-hero-banner__content">
                <h1 id="collection-page-title" class="collection-hero-banner__title">${escapeHtml(name)}</h1>
            </div>
        </section>
        <section class="collection-page-intro section-products1">
            <div class="container product-container">
                <button type="button" class="back-button" data-action="back">
                    <svg class="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>
                ${showcaseHtml}
            </div>
        </section>
        <section class="section-products collection-page-products">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Productos de la colección ${escapeHtml(name)}</h2>
                </div>
                <div class="products-grid" data-collection-products>
                    ${productsHtml}
                </div>
            </div>
        </section>`;

    document.title = `${name} — ${SITE_NAME}`;

    container.querySelector('[data-action="back"]')?.addEventListener("click", () => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = INDEX_HREF;
    });

    container.querySelector('[data-action="open-collection-wa"]')?.addEventListener("click", () => {
        window.open(waLink, "_blank", "noopener,noreferrer");
    });

    const grid = container.querySelector("[data-collection-products]");
    if (grid) bindProductGrid(grid);

    if (showGallery) {
        bindCollectionGallery(container, collectionImages);
    }
}

async function loadCollectionPage() {
    const container = document.querySelector('[data-component="collection-page"]');
    if (!container) {
        console.warn('[collection-page] Falta contenedor data-component="collection-page"');
        return;
    }

    const slug = getCollectionSlug();
    if (!slug) {
        renderNotFound(container, null);
        return;
    }

    try {
        const [resProducts, resCols] = await Promise.all([
            fetch(PRODUCT_DATA_URL),
            fetch(COLECCIONES_DATA_URL),
        ]);
        if (!resProducts.ok) throw new Error(`HTTP ${resProducts.status} product.json`);
        if (!resCols.ok) throw new Error(`HTTP ${resCols.status} colecciones.json`);

        const productData = await resProducts.json();
        const colData = await resCols.json();
        const collections = getCollectionsArray(colData);
        const collectionMeta = collections.find((c) => (c.slug || c.id) === slug);

        if (!collectionMeta) {
            renderNotFound(container, slug);
            return;
        }

        const products = Array.isArray(productData.product) ? productData.product : [];
        const filtered = products.filter((p) => productBelongsToCollection(p, slug));

        renderCollection(container, collectionMeta, filtered);
    } catch (err) {
        console.error("[collection-page]", err);
        container.innerHTML = `
            <section class="collection-page-intro section-products">
                <div class="container product-container">
                    <p class="product-description">No pudimos cargar la colección. Intentá de nuevo más tarde.</p>
                    <p class="product-description" style="margin-top:1rem;">
                        <a href="${INDEX_HREF}#colecciones">Volver al inicio</a>
                    </p>
                </div>
            </section>`;
        document.title = `Error — ${SITE_NAME}`;
    }
}

function bootCollectionPage() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadCollectionPage);
    } else {
        loadCollectionPage();
    }
}

bootCollectionPage();
