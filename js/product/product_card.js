const PRODUCT_DATA_URL = "data/product.json";
const HOME_FEATURED_PRODUCTS = [
    "sillon-luit-2-cuerpos",
    "reposera-capri",
    "mesa-comedor",
    "camastro-con-techo",
    "silla-aluminio",
    "mesa-ratona",
    "pergola",
];
const HOME_FEATURED_LABELS = {
    "sillon-luit-2-cuerpos": "Sillón de dos cuerpos Luit",
    "reposera-capri": "Reposera Capri",
    "mesa-comedor": "Mesa de Comedor",
    "camastro-con-techo": "Camastro con Techo",
    "silla-aluminio": "Silla aluminio",
    "mesa-ratona": "Mesa ratona",
    pergola: "Pérgola",
};

async function loadProductCard() {
    const container = document.querySelector('[data-component="product-card"]');
    if (!container) {
        console.warn("[product-card] No hay sección con data-component=\"product-card\"");
        return;
    }


    try {
        const res = await fetch(PRODUCT_DATA_URL);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} al cargar ${PRODUCT_DATA_URL}`);
        }
        const data = await res.json();
        const products = data.product;
        if (!Array.isArray(products)) {
            throw new Error('JSON sin propiedad "product" válida');
          }
        const featuredProducts = HOME_FEATURED_PRODUCTS
            .map((slug) => products.find((product) => product.slug === slug))
            .filter(Boolean);

        container.innerHTML = `
        ${featuredProducts
            .map((product) => {
            const detailUrl = `product.html?slug=${encodeURIComponent(product.slug)}`;
            return `
            <article class="product-card" role="link" tabindex="0" data-href="${detailUrl}">
                <div class="product-image">
                    <img src="${product.images.main}" alt="${product.name}">
                </div>
                <h3 class="product-name">${HOME_FEATURED_LABELS[product.slug] || product.name}</h3>
                <button type="button" class="btn-secondary">Consultar por whatsapp</button>
            </article>
        `;
            })
            .join("")}
    `;

        const cards = container.querySelectorAll(".product-card[data-href]");
        featuredProducts.forEach((product, index) => {
            const card = cards[index];
            if (!card) return;
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
            if (btn && product.cta?.link) {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    window.open(product.cta.link, "_blank", "noopener,noreferrer");
                });
            }
        });

        const carousel = document.querySelector('[data-component="products-carousel"]');
        const prevButton = carousel?.querySelector(".products-carousel-nav--prev");
        const nextButton = carousel?.querySelector(".products-carousel-nav--next");

        if (carousel && prevButton && nextButton && cards.length > 0) {
            let currentIndex = 0;

            const updateNavState = () => {
                prevButton.disabled = currentIndex === 0;
                nextButton.disabled = currentIndex >= cards.length - 1;
            };

            const scrollToIndex = (index) => {
                const targetCard = cards[index];
                if (!targetCard) return;
                currentIndex = index;
                container.scrollTo({
                    left: targetCard.offsetLeft,
                    behavior: "smooth",
                });
                updateNavState();
            };

            prevButton.addEventListener("click", () => {
                if (currentIndex > 0) {
                    scrollToIndex(currentIndex - 1);
                }
            });

            nextButton.addEventListener("click", () => {
                if (currentIndex < cards.length - 1) {
                    scrollToIndex(currentIndex + 1);
                }
            });

            container.addEventListener(
                "scroll",
                () => {
                    const currentLeft = container.scrollLeft;
                    let nearestIndex = currentIndex;
                    let nearestDistance = Number.POSITIVE_INFINITY;

                    cards.forEach((card, index) => {
                        const distance = Math.abs(card.offsetLeft - currentLeft);
                        if (distance < nearestDistance) {
                            nearestDistance = distance;
                            nearestIndex = index;
                        }
                    });

                    if (nearestIndex !== currentIndex) {
                        currentIndex = nearestIndex;
                        updateNavState();
                    }
                },
                { passive: true }
            );

            updateNavState();
        }
    } catch (err) {
        console.error("[product-card]", err);
    }
}

function bootProductCard() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadProductCard); } else {
        loadProductCard();
    }
}
bootProductCard();