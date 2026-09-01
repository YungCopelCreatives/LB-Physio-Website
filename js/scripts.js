// scripts.js: Smooth 60fps JavaScript for floating gallery animation.
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.float-card');
    if (!cards.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                cards.forEach((card, index) => {
                    let speed = 0.02 + (index * 0.008);
                    card.style.transform = `translateY(${scrollY * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
});
