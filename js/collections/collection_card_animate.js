/**
 * Entrada alternada izquierda/derecha para .collection-card (home + coleccion.html).
 */
function animateCollectionCards(container) {
    const cards = Array.from(container.querySelectorAll(".collection-card"));
    if (!cards.length) return;

    cards.forEach((card, index) => {
        card.classList.add(index % 2 === 0 ? "collection-card--enter-left" : "collection-card--enter-right");
    });

    if (!("IntersectionObserver" in window)) {
        cards.forEach((card) => card.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
    );

    cards.forEach((card) => observer.observe(card));
}
