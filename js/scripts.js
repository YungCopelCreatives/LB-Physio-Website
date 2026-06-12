// scripts.js: JavaScript for floating gallery animation.
// Include this script before </body> on both pages.

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.float-card');
    window.addEventListener('scroll', () => {
        // Do nothing if user requested reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        cards.forEach((card, index) => {
            // Staggered scroll transform for parallax effect
            let speed = 0.02 + (index * 0.008);
            card.style.transform = `translateY(${window.scrollY * speed}px)`;
        });
    });
});
