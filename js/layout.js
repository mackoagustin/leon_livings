async function loadComponent(id, url) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        el.innerHTML = html;
    } catch (err) {
        console.error("[layout] No se pudo cargar", url, err);
    }
}

function ensureFontAwesome() {
    const alreadyLoaded = document.querySelector('link[data-icon-library="font-awesome"]');
    if (alreadyLoaded) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    link.setAttribute("data-icon-library", "font-awesome");
    document.head.appendChild(link);
}

document.addEventListener("DOMContentLoaded", async () => {
    ensureFontAwesome();
    await loadComponent("site-header", "partials/header.html");
    await loadComponent("site-footer", "partials/footer.html");

    if (typeof window.initLeonNav === "function") {
        window.initLeonNav();
    }
});