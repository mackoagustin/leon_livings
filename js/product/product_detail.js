const PRODUCT_DATA_URL = "data/product.json";
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

/**
 * Resuelve el slug del producto: query ?slug=, hash #slug o ruta …/productos/:slug
 */
function getProductSlug() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("slug");
    if (q) return decodeURIComponent(q).trim();

    const hash = window.location.hash.replace(/^#/, "").trim();
    if (hash) return hash;

    const path = window.location.pathname.replace(/\/+$/, "");
    const m = path.match(/\/productos\/([^/]+)$/);
    return m ? decodeURIComponent(m[1]) : null;
}

function collectionLabel(collection) {
    if (!collection) return "Colección";
    const c = String(collection);
    return `Colección ${c.charAt(0).toUpperCase()}${c.slice(1)}`;
}

const CATEGORY_LABELS = {
    sillas: "Sillas",
    barras: "Barras",
    mesas: "Mesas",
    "mesas-de-comedor": "Mesas",
    "mesas-ratonas": "Mesas",
    reposeras: "Reposeras",
    "reposeras-dobles": "Reposeras",
    pergolas: "Pérgolas",
    livings: "Livings",
    sillones: "Sillones",
    camastros: "Camastros",
    bancos: "Bancos",
    banquetas: "Banquetas",
};

const COLOR_LIBRARY = [
    { key: "crudo", label: "Crudo", src: "assets/colores/crudo.jpg" },
    { key: "piedra", label: "Piedra", src: "assets/colores/piedra.jpg" },
    { key: "gamo", label: "Gamo", src: "assets/colores/gamo.jpg" },
    { key: "grisclaro", label: "Gris claro", src: "assets/colores/gris_claro.jpg" },
    { key: "negro", label: "Negro", src: "assets/colores/negro.jpg" },
    { key: "gristopo", label: "Gris topo", src: "assets/colores/gris_topo.jpg" },
    { key: "arena", label: "Arena", src: "assets/colores/arena.jpg" },
    { key: "azul", label: "Azul", src: "assets/colores/azul.jpg" },
    { key: "verdeoasis", label: "Verde oasis", src: "assets/colores/verde_oasis.jpg" },
    { key: "tostado", label: "Tostado", src: "assets/colores/tostado.jpg" },
    { key: "grismedio", label: "Gris medio", src: "assets/colores/gris_medio.jpg" },
];

const ALUMINUM_LIBRARY = [
    { key: "plata", label: "Plata", src: "assets/Aluminio/plata.webp" },
    { key: "madera", label: "Madera", src: "assets/Aluminio/madera.webp" },
    { key: "negro", label: "Negro", src: "assets/Aluminio/negro.webp" },
    { key: "crema", label: "Crema", src: "assets/Aluminio/crema.webp" },
];

const WPC_LIBRARY = [
    { key: "marron", label: "Marron", src: "assets/wpc/marron.webp" },
    { key: "marron-oscuro", label: "Marron oscuro", src: "assets/wpc/marron_oscuro.webp" },
    { key: "gris", label: "Gris", src: "assets/wpc/gris.webp" },
];

const COLOR_ALIASES = {
    gris: "grismedio",
    "gris-medio": "grismedio",
    "gris-claro": "grisclaro",
    "gris-topo": "gristopo",
    "simil-madera": "tostado",
    similmadera: "tostado",
    madera: "tostado",
    blanco: "crudo",
    white: "crudo",
    verde: "verdeoasis",
};

function categoryFromProduct(product) {
    const raw = String(product?.category || "").trim().toLowerCase();
    const label = CATEGORY_LABELS[raw];
    if (label) return { slug: raw === "mesas-ratonas" ? "mesas" : raw === "mesas-de-comedor" ? "mesas" : raw === "reposeras-dobles" ? "reposeras" : raw, label };
    return { slug: "categorias", label: "Categorías" };
}

function normalizeKey(input) {
    return String(input || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "");
}

function resolveColorItem(colorName) {
    const baseKey = normalizeKey(colorName);
    const aliasKey = COLOR_ALIASES[baseKey] || baseKey;
    const found = COLOR_LIBRARY.find((item) => item.key === aliasKey);
    if (found) return found;
    return null;
}

function resolveColorSwatches(product) {
    return [...COLOR_LIBRARY];
}

function titleWithBreaks(name) {
    const parts = String(name).trim().split(/\s+/);
    if (parts.length <= 1) return escapeHtml(name);
    const first = escapeHtml(parts[0]);
    const rest = escapeHtml(parts.slice(1).join(" "));
    return `${first}<br>${rest}`;
}

function buildImageList(product) {
    const imgs = product.images || {};
    const main = imgs.main;
    const gallery = Array.isArray(imgs.gallery) ? imgs.gallery : [];
    const list = [];
    if (main) list.push(main);
    for (const g of gallery) {
        if (g && !list.includes(g)) list.push(g);
    }
    return list;
}

function materialsSummary(product) {
    if (product.materialDescription) return product.materialDescription;
    const mats = product.materials;
    if (!Array.isArray(mats) || !mats.length) return "—";
    return mats.map((m) => m.name).join(", ");
}

function dimensionsSummary(product) {
    const dims = product.dimensions;
    if (!Array.isArray(dims) || !dims.length) return "—";
    return dims.map((d) => `${d.label}: ${d.size}`).join(" · ");
}

function finishesSummary(product) {
    const c = product.customization;
    if (!c || typeof c !== "object") return "Consultar opciones";
    const bits = [];
    if (Array.isArray(c.structureColors) && c.structureColors.length) {
        bits.push(c.structureColors.join(", "));
    }
    // if (Array.isArray(c.fabrics) && c.fabrics.length) {
    //     bits.push(`Telas: ${c.fabrics.join(", ")}`);
    // }
    // if (Array.isArray(c.topOptions) && c.topOptions.length) {
    //     bits.push(`Tapas: ${c.topOptions.join(", ")}`);
    // }
    // if (Array.isArray(c.roofOptions) && c.roofOptions.length) {
    //     bits.push(`Techo: ${c.roofOptions.join(", ")}`);
    // }
    // if (Array.isArray(c.roofFabric) && c.roofFabric.length) {
    //     bits.push(`Tela techo: ${c.roofFabric.join(", ")}`);
    // }
    return bits.length ? bits.join(" · ") : "Consultar opciones";
}

function finishesExtraSummary(product) {
    const c = product.customization;
    if (!c || typeof c !== "object") return "";
    // Se comentan textos de detalle para mostrar solo swatches en "Acabados disponibles".
    // const bits = [];
    // if (Array.isArray(c.fabrics) && c.fabrics.length) {
    //     bits.push(`Telas: ${c.fabrics.join(", ")}`);
    // }
    // if (Array.isArray(c.topOptions) && c.topOptions.length) {
    //     bits.push(`Tapas: ${c.topOptions.join(", ")}`);
    // }
    // if (Array.isArray(c.roofOptions) && c.roofOptions.length) {
    //     bits.push(`Techo: ${c.roofOptions.join(", ")}`);
    // }
    // if (Array.isArray(c.roofFabric) && c.roofFabric.length) {
    //     bits.push(`Tela techo: ${c.roofFabric.join(", ")}`);
    // }
    // return bits.join(" · ");
    return "";
}

function renderFinishesValue(product) {
    const swatches = resolveColorSwatches(product);
    const aluminumSwatches = [...ALUMINUM_LIBRARY];
    const topOptions = Array.isArray(product?.customization?.topOptions)
        ? product.customization.topOptions.map((option) => normalizeKey(option))
        : [];
    const hasWpcTopOption = topOptions.includes("wpc");
    const wpcSwatches = hasWpcTopOption ? [...WPC_LIBRARY] : [];
    const extra = finishesExtraSummary(product);

    if (!swatches.length && !aluminumSwatches.length && !wpcSwatches.length) {
        return `<p class="detail-value">${escapeHtml(finishesSummary(product))}</p>`;
    }

    const swatchesHtml = swatches
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

    const aluminumHtml = aluminumSwatches
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

    const wpcHtml = wpcSwatches
        .map(
            (swatch) => `
        <button
            type="button"
            class="color-swatch"
            data-color-src="${escapeHtml(swatch.src)}"
            data-color-label="WPC ${escapeHtml(swatch.label)}"
            aria-label="Ver color WPC ${escapeHtml(swatch.label)} en grande"
            title="WPC ${escapeHtml(swatch.label)}"
        >
            <img src="${escapeHtml(swatch.src)}" alt="WPC ${escapeHtml(swatch.label)}" loading="lazy" decoding="async">
        </button>`
        )
        .join("");

    const wpcSectionHtml = wpcHtml
        ? `
        <p class="detail-value detail-value--group-title">Color de WPC</p>
        <div class="color-swatch-list" aria-label="Colores de WPC disponibles">
            ${wpcHtml}
        </div>`
        : "";

    const extraHtml = extra
        ? `<p class="detail-value detail-value--muted">${escapeHtml(extra)}</p>`
        : "";

    return `
        ${extraHtml}
        <p class="detail-value detail-value--group-title">Colores de tela</p>
        <div class="color-swatch-list" aria-label="Colores de tela disponibles">
            ${swatchesHtml}
        </div>
        <p class="detail-value detail-value--group-title">Color de aluminio</p>
        <div class="color-swatch-list" aria-label="Colores de aluminio disponibles">
            ${aluminumHtml}
        </div>
        ${wpcSectionHtml}
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

function qualityBlocks(product) {
    const mats = product.materials;
    if (Array.isArray(mats) && mats.length) {
        return mats.slice(0, 2).map((m) => ({
            title: m.name,
            text: m.description || "",
        }));
    }
    const feats = product.features;
    if (Array.isArray(feats) && feats.length) {
        return feats.slice(0, 2).map((text, i) => ({
            title: `Destacado ${i + 1}`,
            text,
        }));
    }
    return [
        { title: SITE_NAME, text: product.description || "" },
    ];
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = INDEX_HREF;
    }
}

function renderNotFound(container, slug) {
    const s = escapeHtml(slug || "—");
    container.innerHTML = `
        <section class="product-hero">
            <div class="product-container">
                <button type="button" class="back-button" data-action="back">
                    <svg class="back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>
                <p class="product-description">No encontramos el producto «${s}».</p>
                <p class="product-description" style="margin-top:1rem;">
                    <a href="${INDEX_HREF}#productos">Ver productos</a>
                </p>
            </div>
        </section>
    `;
    document.title = `Producto no encontrado — ${SITE_NAME}`;
}

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

/** Dirección “corta” en el anillo (para bullets): siguiente índice vs anterior */
function galleryDirection(from, to, n) {
    let d = to - from;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d > 0 ? "next" : "prev";
}

function bindGallery(root, imageUrls) {
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

function renderProduct(container, product) {
    const images = buildImageList(product);
    const mainSrc = images[0] || "";
    const showGallery = images.length > 1;
    const totalImages = images.length;
    const secondSrc = images.length > 1 ? images[1] : mainSrc;

    const bulletsHtml = showGallery
        ? images
              .map(
                  (_, i) => `
            <button type="button" class="gallery-bullet${i === 0 ? " is-active" : ""}" data-index="${i}" aria-label="Imagen ${i + 1} de ${totalImages}" aria-current="${i === 0 ? "true" : "false"}"></button>`
              )
              .join("")
        : "";

    const navArrowsHtml = showGallery
        ? `
            <button type="button" class="gallery-nav gallery-nav--prev" aria-label="Imagen anterior">
                ${GALLERY_PREV_SVG}
            </button>
            <button type="button" class="gallery-nav gallery-nav--next" aria-label="Imagen siguiente">
                ${GALLERY_NEXT_SVG}
            </button>`
        : "";

    const quality = qualityBlocks(product);
    const qualityHtml = quality
        .map(
            (b) => `
        <div class="quality-item">
            <h3>${escapeHtml(b.title)}</h3>
            <p>${escapeHtml(b.text)}</p>
        </div>`
        )
        .join("");

    const ctaUrl = product.cta?.link || "https://wa.me/1234567890";
    const category = categoryFromProduct(product);
    const ctaNote =
        product.customization?.customSize === true
            ? "Personalización disponible"
            : "Consultá opciones y disponibilidad";

    container.innerHTML = `
        <section class="product-hero" >
            <div class="product-container" >
                <nav class="breadcrumb-nav" aria-label="Breadcrumb">
                    <a class="breadcrumb-link" href="${INDEX_HREF}">Inicio</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <a class="breadcrumb-link" href="categoria.html">Categorías</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <a class="breadcrumb-link" href="categoria.html?slug=${escapeHtml(category.slug)}">${escapeHtml(category.label)}</a>
                    <span class="breadcrumb-separator" aria-hidden="true">></span>
                    <span class="breadcrumb-current">${escapeHtml(product.name)}</span>
                </nav>
                <p class="product-category product-category--mobile">${escapeHtml(collectionLabel(product.collection))}</p>

                <div class="product-grid">
                    <div class="product-gallery">
                        <div class="main-image" id="mainImage">
                            ${
                                showGallery
                                    ? `
                            <div class="gallery-slide-viewport">
                                <div class="gallery-slide-track" id="gallerySlideTrack">
                                    <div class="gallery-slide">
                                        <img class="gallery-slide-img" data-slide="0" src="${escapeHtml(mainSrc)}" alt="${escapeHtml(product.name)}" width="700" height="600" decoding="async" fetchpriority="high">
                                    </div>
                                    <div class="gallery-slide">
                                        <img class="gallery-slide-img" data-slide="1" src="${escapeHtml(secondSrc)}" alt="" width="700" height="600" loading="lazy" decoding="async">
                                    </div>
                                </div>
                            </div>`
                                    : `
                            <img src="${escapeHtml(mainSrc)}" alt="${escapeHtml(product.name)}" id="productDetailMainImg" width="700" height="600" decoding="async" fetchpriority="high">`
                            }
                            ${navArrowsHtml}
                        </div>
                        ${showGallery ? `<div class="gallery-bullets" role="tablist" aria-label="Galería de imágenes">${bulletsHtml}</div>` : ""}
                    </div>

                    <div class="product-info">
                        <div>
                            <p class="product-category product-category--desktop">${escapeHtml(collectionLabel(product.collection))}</p>
                            <h1 class="product-title">${(product.name)}</h1>
                            <p class="product-description">${escapeHtml(product.description)}</p>
                            <div class="product-details">
                                <div class="detail-item">
                                    <h4 class="detail-label">Materiales</h4>
                                    <p class="detail-value">${escapeHtml(materialsSummary(product))}</p>
                                </div>
                                <div class="detail-item">
                                    <h4 class="detail-label">Dimensiones</h4>
                                    <p class="detail-value">${escapeHtml(dimensionsSummary(product))}</p>
                                </div>
                                <div class="detail-item">
                                    <h4 class="detail-label">Acabados disponibles</h4>
                                    ${renderFinishesValue(product)}
                                </div>
                            </div>
                        </div>
                        <div class="product-cta">
                            <p class="cta-note">${escapeHtml(ctaNote)}</p>
                            <button type="button" class="btn-primary" data-open-cta>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="btn-icon" viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                                </svg>
                                Consultar por whatsapp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

         ${/*
            seccion inferior con informacion del producto
            <section class="quality-section">
            <div class="product-container">
                <div class="quality-grid">
                    ${qualityHtml}
                </div>
            </div>
        </section> */""}

        <div class="color-modal" data-color-modal hidden aria-hidden="true">
            <div class="color-modal__dialog" role="dialog" aria-modal="true" aria-label="Vista ampliada de color">
                <button type="button" class="color-modal__close" data-color-modal-close aria-label="Cerrar vista de color">×</button>
                <img data-color-modal-image src="" alt="" loading="lazy" decoding="async">
                <p class="color-modal__label" data-color-modal-label></p>
            </div>
        </div>
    `;

    document.title = `${product.name} — ${SITE_NAME}`;

    bindGallery(container, images);

    container.querySelectorAll("[data-open-cta]").forEach((btn) => {
        btn.addEventListener("click", () => {
            window.open(ctaUrl, "_blank", "noopener,noreferrer");
        });
    });

    bindColorSwatches(container);
}

async function loadProductDetail() {
    const container = document.querySelector('[data-component="product-detail"]');
    if (!container) {
        console.warn('[product-detail] Falta [data-component="product-detail"]');
        return;
    }

    const slug = getProductSlug();
    if (!slug) {
        renderNotFound(container, "");
        container.querySelector("[data-action='back']")?.addEventListener("click", goBack);
        return;
    }

    try {
        const res = await fetch(PRODUCT_DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${PRODUCT_DATA_URL}`);
        const data = await res.json();
        const products = data.product;
        if (!Array.isArray(products)) throw new Error('JSON inválido: falta "product"');

        const product = products.find((p) => p.slug === slug || p.id === slug);
        if (!product) {
            renderNotFound(container, slug);
            container.querySelector("[data-action='back']")?.addEventListener("click", goBack);
            return;
        }

        renderProduct(container, product);
    } catch (err) {
        console.error("[product-detail]", err);
        container.innerHTML = `
            <section class="product-hero">
                <div class="product-container">
                    <p class="product-description">No se pudo cargar el catálogo. Intentá de nuevo más tarde.</p>
                    <p class="product-description" style="margin-top:1rem;"><a href="${INDEX_HREF}">Volver al inicio</a></p>
                </div>
            </section>
        `;
        document.title = `Error — ${SITE_NAME}`;
    }
}

function bootProductDetail() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadProductDetail);
    } else {
        loadProductDetail();
    }
}

bootProductDetail();
