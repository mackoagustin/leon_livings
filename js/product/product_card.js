const PRODUCT_DATA_URL = "data/product.json";

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
        //const firstThreeProducts = products.slice(0, 3);
        const firstThreeProducts = products;

        container.innerHTML = `
        ${firstThreeProducts.map((product) => {
            const detailUrl = `product.html?slug=${encodeURIComponent(product.slug)}`;
            return `
            <div class="product-card" role="link" tabindex="0" data-href="${detailUrl}">
                <div class="product-image">
                    <img src="${product.images.main}" alt="${product.name}">
                </div>
                <h3 class="product-name">${product.name}</h3>
                <button type="button" class="btn-secondary">Consultar por whatsapp</button>
            </div>
        `;
        }).join("")}
    `;

        const cards = container.querySelectorAll(".product-card[data-href]");
        firstThreeProducts.forEach((product, index) => {
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