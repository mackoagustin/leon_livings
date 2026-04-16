(function () {
    let inited = false;

    window.initLeonNav = function initLeonNav() {
        if (inited) return;

        const header = document.getElementById("header");
        const toggle = document.getElementById("nav-toggle");
        const drawer = document.getElementById("nav-drawer");
        const overlay = document.getElementById("nav-overlay");

        if (!header || !toggle || !drawer || !overlay) {
            console.warn(
                "[initLeonNav] Faltan #header, #nav-toggle, #nav-drawer o #nav-overlay."
            );
            return;
        }

        inited = true;

        const SCROLL_HEADER_SOLID = 48;

        function updateHeaderScrolled() {
            const y = window.scrollY || document.documentElement.scrollTop;
            header.classList.toggle("header--scrolled", y > SCROLL_HEADER_SOLID);
        }

        function isMobileNav() {
            return window.matchMedia("(max-width: 768px)").matches;
        }

        function setMenuOpen(open) {
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
            drawer.hidden = !open;
            overlay.hidden = !open;
            drawer.setAttribute("aria-hidden", open ? "false" : "true");
            overlay.setAttribute("aria-hidden", open ? "false" : "true");
            document.body.classList.toggle("nav-open", open);
            toggle.classList.toggle("is-open", open);
            if (open) {
                const firstLink = drawer.querySelector(".nav-drawer-link");
                if (firstLink) firstLink.focus({ preventScroll: true });
            } else if (isMobileNav()) {
                toggle.focus({ preventScroll: true });
            }
        }

        function closeMenu() {
            setMenuOpen(false);
        }

        toggle.addEventListener("click", () => {
            const open = toggle.getAttribute("aria-expanded") === "true";
            setMenuOpen(!open);
        });

        overlay.addEventListener("click", closeMenu);

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (!isMobileNav() && document.body.classList.contains("nav-open")) {
                closeMenu();
            }
        });

        document.addEventListener(
            "click",
            function anchorNav(e) {
                const a = e.target.closest('a[href^="#"]');
                if (!a) return;
                const id = a.getAttribute("href");
                if (!id || id === "#") return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                if (document.body.classList.contains("nav-open")) {
                    closeMenu();
                }
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            },
            false
        );

        window.addEventListener(
            "scroll",
            () => {
                updateHeaderScrolled();
            },
            { passive: true }
        );

        updateHeaderScrolled();
    };
})();
