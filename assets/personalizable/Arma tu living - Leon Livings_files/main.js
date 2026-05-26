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

        function setSubmenuOpen(toggleBtn, open) {
            const controls = toggleBtn.getAttribute("aria-controls");
            if (!controls) return;
            const panel = drawer.querySelector(`#${controls}`);
            if (!panel) return;
            toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
            panel.hidden = !open;
            panel.style.display = open ? "flex" : "none";
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
            if (!open) {
                drawer.querySelectorAll(".nav-drawer-toggle[aria-expanded='true']").forEach((btn) => {
                    setSubmenuOpen(btn, false);
                });
            }
            // En touch (iPhone) no mover foco: Safari muestra recuadro negro/azul no deseado
            const isTouchNav = window.matchMedia("(pointer: coarse)").matches;
            if (open && !isTouchNav) {
                const firstLink = drawer.querySelector(".nav-drawer-link");
                if (firstLink) firstLink.focus({ preventScroll: true });
            } else if (!open && !isTouchNav && isMobileNav()) {
                toggle.focus({ preventScroll: true });
            }
        }

        function closeMenu() {
            setMenuOpen(false);
        }

        drawer.querySelectorAll(".nav-drawer-toggle").forEach((btn) => {
            setSubmenuOpen(btn, false);
        });

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

        drawer.addEventListener("click", (e) => {
            const toggleBtn = e.target.closest(".nav-drawer-toggle");
            if (toggleBtn) {
                const willOpen = toggleBtn.getAttribute("aria-expanded") !== "true";
                setSubmenuOpen(toggleBtn, willOpen);
                return;
            }
            const link = e.target.closest("a");
            if (!link) return;
            if (document.body.classList.contains("nav-open")) {
                closeMenu();
            }
        });

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
