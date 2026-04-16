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
        const firstThreeProducts = products.slice(0, 3);

        const url = `/productos/${products.slug}`;
            

        container.innerHTML = `
        ${firstThreeProducts.map(product => `
            <div class="product-card" onclick="window.location.href='${url}'">
                <div class="product-image">
                    <img src="${product.images.main}" alt="${product.name}">
                </div>
                <h3 class="product-name">${product.name}</h3>
                <button class="btn-secondary" onclick="window.open('${product.cta.link}', '_blank')">Consultar por whatsapp</button>
            </div>
        `).join('')}
    `;
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