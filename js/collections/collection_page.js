const PRODUCT_DATA_URL = "data/product.json";
const WHATSAPP_URL = "https://wa.me/5491136420547";
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

function bindCollectionCards(container) {
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
        const link = card.getAttribute("data-cta") || WHATSAPP_URL;
        if (btn) {
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
                <nav class="breadcrumb-nav" aria-label="Breadcrumb">
                    <a class="breadcrumb-link" href="${INDEX_HREF}">Inicio</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <a class="breadcrumb-link" href="coleccion.html">Colecciones</a>
                </nav>
                <button type="button" class="back-button" data-action="back">
                    <svg class="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>
                <p class="product-description">${msg}</p>
                <p class="product-description" style="margin-top:1rem;">
                    <a href="coleccion.html">Ver colecciones</a>
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

function renderAllCollections(container, collections) {
    const cardsHtml = collections
        .map((c) => {
            const slug = c.slug || c.id;
            const name = c.name || slug;
            const href = `coleccion.html?slug=${encodeURIComponent(slug)}`;
            const imgSrc = escapeHtml(
                normalizeAssetPath(c.thumbnail || c.heroImage || "")
            );
            const alt = escapeHtml(c.alt || `Colección ${name}`);

            return `
                <div class="collection-card" role="link" tabindex="0" data-href="${escapeHtml(href)}">
                    ${imgSrc ? `<img src="${imgSrc}" alt="${alt}" loading="lazy" decoding="async">` : ""}
                    <div class="collection-overlay"></div>
                    <div class="collection-content">
                        <h3 class="collection-name">${escapeHtml(name)}</h3>
                        <p class="collection-link">Ver colección →</p>
                    </div>
                </div>`;
        })
        .join("");

    container.innerHTML = `
        <section class="section-collections collection-page-products">
            <div class="container">
                <nav class="breadcrumb-nav" aria-label="Breadcrumb">
                    <a class="breadcrumb-link" href="${INDEX_HREF}">Inicio</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <span class="breadcrumb-current">Colecciones</span>
                </nav>
                <div class="section-header">
                    <h1 class="section-title">Todas las colecciones</h1>
                    <p class="section-subtitle">Explorá nuestras líneas de diseño</p>
                </div>
                <div class="collections-container" data-collections-grid>
                    ${cardsHtml}
                </div>
            </div>
        </section>
    `;

    document.title = `Colecciones — ${SITE_NAME}`;
    const grid = container.querySelector("[data-collections-grid]");
    if (grid) {
        bindCollectionCards(grid);
        if (typeof animateCollectionCards === "function") {
            animateCollectionCards(grid);
        }
    }
}

const COLLECTION_SPEC_LABELS = [
    "MATERIALES Y ESTRUCTURA",
    "PENSADO PARA EXTERIOR",
    "CONFORT Y TEXTILES",
];

const COLOR_LIBRARY = [
    { key: "crudo", label: "Crudo", src: "assets/colores/crudo.jpg" },
    { key: "piedra", label: "Piedra", src: "assets/colores/piedra.jpg" },
    { key: "negro", label: "Negro", src: "assets/colores/negro.jpg" },
    { key: "gristopo", label: "Gris topo", src: "assets/colores/gris_topo.jpg" },
    { key: "arena", label: "Arena", src: "assets/colores/arena.jpg" },
    { key: "tostado", label: "Tostado", src: "assets/colores/tostado.jpg" },
    { key: "grismedio", label: "Gris medio", src: "assets/colores/gris_medio.jpg" },
];

const ALUMINUM_LIBRARY = [
    { key: "plata", label: "Anodizado Natural", src: "assets/Aluminio/plata.webp" },
    { key: "madera", label: "Simil Madera Nogal", src: "assets/Aluminio/madera.webp" },
    { Key: "madera blanco", label: "Simil Madera Linen", src: "assets/Aluminio/simil_madera_blanco.webp" },
    { key: "negro", label: "Negro Mate", src: "assets/Aluminio/negro.webp" },
    { key: "crema", label: "Blanco Mate", src: "assets/Aluminio/crema.webp" },
];

const GALLERY_PREV_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>`;
const GALLERY_NEXT_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
const GALLERY_SLIDE_MS = 480;

const COLOR_MODAL_HTML = `
        <div class="color-modal" data-color-modal hidden aria-hidden="true">
            <div class="color-modal__dialog" role="dialog" aria-modal="true" aria-label="Vista ampliada de color">
                <button type="button" class="color-modal__close" data-color-modal-close aria-label="Cerrar vista de color">×</button>
                <img data-color-modal-image src="" alt="" decoding="async">
                <p class="color-modal__label" data-color-modal-label></p>
            </div>
        </div>`;

function renderCollectionFinishesValue() {
    const swatchesHtml = COLOR_LIBRARY
        .map(
            (swatch) => `
        <button
            type="button"
            class="color-swatch"
            data-color-src="${escapeHtml(swatch.src)}"
            data-color-label="${escapeHtml(swatch.label)}"
            aria-label="Ver color ${escapeHtml(swatch.label)} en grande"
            title="${escapeHtml(swatch.label)}"
        >
            <img src="${escapeHtml(swatch.src)}" alt="${escapeHtml(swatch.label)}" loading="lazy" decoding="async">
        </button>`
        )
        .join("");

    const aluminumHtml = ALUMINUM_LIBRARY
        .map(
            (swatch) => `
        <button
            type="button"
            class="color-swatch"
            data-color-src="${escapeHtml(swatch.src)}"
            data-color-label="Aluminio ${escapeHtml(swatch.label)}"
            aria-label="Ver aluminio ${escapeHtml(swatch.label)} en grande"
            title="Aluminio ${escapeHtml(swatch.label)}"
        >
            <img src="${escapeHtml(swatch.src)}" alt="Aluminio ${escapeHtml(swatch.label)}" loading="lazy" decoding="async">
        </button>`
        )
        .join("");

    return `
        <p class="detail-value detail-value--group-title">Colores de tela</p>
        <div class="color-swatch-list" aria-label="Colores de tela disponibles">
            ${swatchesHtml}
        </div>
        <p class="detail-value detail-value--group-title">Color de aluminio</p>
        <div class="color-swatch-list" aria-label="Colores de aluminio disponibles">
            ${aluminumHtml}
        </div>
    `;
}

function bindColorSwatches(container) {
    const swatches = container.querySelectorAll(".color-swatch[data-color-src]");
    if (!swatches.length) return;

    const modal = container.querySelector("[data-color-modal]");
    const modalImage = container.querySelector("[data-color-modal-image]");
    const modalLabel = container.querySelector("[data-color-modal-label]");
    const closeBtn = container.querySelector("[data-color-modal-close]");
    if (!modal || !modalImage || !modalLabel || !closeBtn) return;

    const closeModal = () => {
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("nav-open");
    };

    const openModal = (src, label) => {
        modalImage.src = src;
        modalImage.alt = label;
        modalLabel.textContent = label;
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("nav-open");
    };

    swatches.forEach((swatch) => {
        swatch.addEventListener("click", () => {
            const src = swatch.getAttribute("data-color-src");
            const label = swatch.getAttribute("data-color-label") || "Color";
            if (!src) return;
            openModal(src, label);
        });
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) closeModal();
    });
}

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
    let touchStartX = 0;
    let touchStartY = 0;
    let touchTracking = false;

    const slideEasing = "cubic-bezier(0.25, 0.1, 0.25, 1)";
    const transitionCss = `transform ${GALLERY_SLIDE_MS}ms ${slideEasing}`;
    const minSwipeDistance = 40;

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

    const goPrev = () => {
        let next = index - 1;
        if (next < 0) next = n - 1;
        goTo(next, "prev");
    };

    const goNext = () => {
        let next = index + 1;
        if (next >= n) next = 0;
        goTo(next, "next");
    };

    root.querySelector(".gallery-nav--prev")?.addEventListener("click", goPrev);
    root.querySelector(".gallery-nav--next")?.addEventListener("click", goNext);

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
            goPrev();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            goNext();
        }
    });

    mainWrap.addEventListener(
        "touchstart",
        (e) => {
            if (!e.touches || e.touches.length !== 1) return;
            const t = e.touches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            touchTracking = true;
        },
        { passive: true }
    );

    mainWrap.addEventListener(
        "touchend",
        (e) => {
            if (!touchTracking || !e.changedTouches || !e.changedTouches.length) return;
            touchTracking = false;
            if (transitioning) return;

            const t = e.changedTouches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;

            if (Math.abs(dx) < minSwipeDistance) return;
            if (Math.abs(dx) <= Math.abs(dy)) return;

            if (dx < 0) goNext();
            else goPrev();
        },
        { passive: true }
    );

    mainWrap.addEventListener(
        "touchcancel",
        () => {
            touchTracking = false;
        },
        { passive: true }
    );
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
        WHATSAPP_URL;

    const hasShowcaseContent =
        collectionImages.length > 0 ||
        collectionMeta.description ||
        collectionMeta.style ||
        feats.length > 0;

    const finishesBlock = `
        <div class="detail-item">
            <h4 class="detail-label">Acabados disponibles</h4>
            ${renderCollectionFinishesValue()}
        </div>
    `;

    const detailsBlock =
        specRowsHtml.length > 0
            ? `<div class="product-details">${specRowsHtml}${finishesBlock}</div>`
            : `<div class="product-details">${finishesBlock}</div>`;

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
                                <img class="gallery-slide-img" data-slide="0" src="${collectionImgSrc}" alt="${escapeHtml(name)} — ambientación principal" width="700" height="600" decoding="async" fetchpriority="high">
                            </div>
                            <div class="gallery-slide">
                                <img class="gallery-slide-img" data-slide="1" src="${secondSrc}" alt="" width="700" height="600" loading="lazy" decoding="async">
                            </div>
                        </div>
                    </div>
                    <button type="button" class="gallery-nav gallery-nav--prev" aria-label="Imagen anterior">
                        ${GALLERY_PREV_SVG}
                    </button>
                    <button type="button" class="gallery-nav gallery-nav--next" aria-label="Imagen siguiente">
                        ${GALLERY_NEXT_SVG}
                    </button>`
                            : `<img src="${collectionImgSrc}" alt="${escapeHtml(name)} — ambientación" decoding="async" fetchpriority="high">`
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
                    <p class="product-category product-category--desktop">${escapeHtml(categoryLine)}</p>
                    <h2 class="product-title">${escapeHtml(name)}</h2>
                    ${
                        collectionMeta.description
                            ? `<p class="product-description">${escapeHtml(collectionMeta.description)}</p>`
                            : ""
                    }
                    ${detailsBlock}
                </div>
                <div class="product-cta">
                    <button type="button" class="btn-primary" data-action="open-collection-wa">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="btn-icon" viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                        </svg>
                        Consultar por whatsapp
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
                      const ctaLink = product.cta?.link || WHATSAPP_URL;
                      return `
            <div class="product-card" role="link" tabindex="0" data-href="${escapeHtml(detailUrl)}" data-cta="${escapeHtml(ctaLink)}">
                <div class="product-image">
                    <img src="${escapeHtml(main)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">
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
            : `<p class="collection-page-empty">No hay productos cargados para esta colección todavía.</p>`;

    container.innerHTML = `
        <section class="collection-hero-banner" aria-labelledby="collection-page-title">
            <div class="collection-hero-banner__media">
                ${heroSrc ? `<img src="${heroSrc}" alt="${escapeHtml(name)}" decoding="async" fetchpriority="high">` : ""}
                <div class="collection-hero-banner__overlay"></div>
            </div>
            <div class="collection-hero-banner__content">
                <h1 id="collection-page-title" class="collection-hero-banner__title">${escapeHtml(name)}</h1>
            </div>
        </section>
        <section class="collection-page-top section-products">
            <div class="container product-container">
                <nav class="breadcrumb-nav" aria-label="Breadcrumb">
                    <a class="breadcrumb-link" href="${INDEX_HREF}">Inicio</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <a class="breadcrumb-link" href="coleccion.html">Colecciones</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <span class="breadcrumb-current">${escapeHtml(name)}</span>
                </nav>
            </div>
        </section>
        <section class="collection-page-intro section-products1">
            <div class="container product-container">
                <p class="product-category product-category--mobile">${escapeHtml(categoryLine)}</p>
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
        </section>
        ${COLOR_MODAL_HTML}`;

    document.title = `${name} — ${SITE_NAME}`;

    container.querySelector('[data-action="open-collection-wa"]')?.addEventListener("click", () => {
        window.open(waLink, "_blank", "noopener,noreferrer");
    });

    const grid = container.querySelector("[data-collection-products]");
    if (grid) bindProductGrid(grid);

    if (showGallery) {
        bindCollectionGallery(container, collectionImages);
    }

    bindColorSwatches(container);
}

async function loadCollectionPage() {
    const container = document.querySelector('[data-component="collection-page"]');
    if (!container) {
        console.warn('[collection-page] Falta contenedor data-component="collection-page"');
        return;
    }

    const slug = getCollectionSlug();

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
        if (!slug) {
            renderAllCollections(container, collections);
            return;
        }
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
                    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
                        <a class="breadcrumb-link" href="${INDEX_HREF}">Inicio</a>
                        <span class="breadcrumb-separator" aria-hidden="true">></span>
                        <a class="breadcrumb-link" href="coleccion.html">Colecciones</a>
                    </nav>
                    <p class="product-description">No pudimos cargar la colección. Intentá de nuevo más tarde.</p>
                    <p class="product-description" style="margin-top:1rem;">
                        <a href="coleccion.html">Volver a colecciones</a>
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
