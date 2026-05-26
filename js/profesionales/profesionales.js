function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function revealElement(el) {
    el.classList.add("is-visible");
    el.querySelectorAll(".profesionales-reveal").forEach((child) => {
        child.classList.add("is-visible");
    });
    el.querySelectorAll(".profesionales-line-heading").forEach((heading) => {
        heading.classList.add("is-visible");
    });
}

function observeScrollReveals() {
    const reduced = prefersReducedMotion();
    const scrollTargets = document.querySelectorAll(
        ".profesionales-zigzag-item, .profesionales-line-expand, .personalizable-final-cta, .profesionales-final-cta"
    );

    if (!scrollTargets.length) return;

    if (reduced) {
        scrollTargets.forEach(revealElement);
        return;
    }

    if (!("IntersectionObserver" in window)) {
        scrollTargets.forEach(revealElement);
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                revealElement(entry.target);
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    scrollTargets.forEach((el) => observer.observe(el));
}

function initHeroReveal() {
    const heroGroup = document.querySelector(".profesionales-reveal-group");
    if (!heroGroup) return;

    if (prefersReducedMotion()) {
        heroGroup.classList.add("is-visible");
        heroGroup.closest(".hero-text")?.classList.add("is-visible");
        heroGroup.querySelectorAll(".profesionales-reveal, .profesionales-line-heading").forEach((el) => {
            el.classList.add("is-visible");
        });
        return;
    }

    requestAnimationFrame(() => {
        heroGroup.classList.add("is-visible");
        heroGroup.closest(".hero-text")?.classList.add("is-visible");
    });
}

function bootProfesionalesAnimations() {
    if (!document.querySelector(".profesionales-main, .personalizable-main")) return;
    initHeroReveal();
    observeScrollReveals();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootProfesionalesAnimations);
} else {
    bootProfesionalesAnimations();
}
