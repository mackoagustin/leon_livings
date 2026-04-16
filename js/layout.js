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

document.addEventListener("DOMContentLoaded", async () => {
    await loadComponent("site-header", "partials/header.html");

    if (typeof window.initLeonNav === "function") {
        window.initLeonNav();
    }
});