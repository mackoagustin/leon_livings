(function () {
    const DESKTOP_MQ = "(min-width: 769px)";
    const SHOW_VIEWPORT_RATIO = 0.55;

    function initHomeCatalogFab() {
        if (!document.body.classList.contains("home-page")) return;

        const section = document.getElementById("colecciones");
        const wrap = document.querySelector(".home-catalog-fab-wrap");
        if (!section || !wrap) return;

        function updateVisibility() {
            if (!window.matchMedia(DESKTOP_MQ).matches) {
                wrap.classList.remove("is-visible");
                return;
            }

            const sectionTop = section.getBoundingClientRect().top;
            const reached = sectionTop <= window.innerHeight * SHOW_VIEWPORT_RATIO;
            wrap.classList.toggle("is-visible", reached);
        }

        let ticking = false;
        function scheduleUpdate() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                updateVisibility();
                ticking = false;
            });
        }

        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate, { passive: true });
        updateVisibility();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHomeCatalogFab);
    } else {
        initHomeCatalogFab();
    }
})();
