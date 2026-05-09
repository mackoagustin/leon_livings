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
                    <img src="${product.images.main}" alt="${product.name}" loading="lazy" decoding="async">
                </div>
                <h3 class="product-name">${HOME_FEATURED_LABELS[product.slug] || product.name}</h3>
                <button type="button" class="btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="btn-icon" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg>
                    Consultar por whatsapp
                </button>
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