/* =====================================
   LB Physiotherapy — Global Motion System
   IntersectionObserver + Scroll Animations
   ===================================== */

// Section reveal animations (Phase 9 — expanded)
document.addEventListener('DOMContentLoaded', () => {
  // Legacy reveal selectors — individual elements that fade in
  const revealSelectors = '.section-title, .service-item, .single-service, .single-table, .about-img, .about-content, .faq-item, .portfolio-item, .single-pf, .value-card, .partnership-header, .partnership-hero, .partnership-strip, .cta-section, .choose-left, .choose-right';
  document.querySelectorAll(revealSelectors).forEach(el => el.classList.add('lb-reveal'));

  // Stagger containers — only purpose-built classes, no generic Bootstrap grid classes
  document.querySelectorAll('.stagger-grid, .partnership-grid').forEach(el => {
    if (!el.classList.contains('lb-stagger')) el.classList.add('lb-stagger');
  });
  // Backward compatibility: also support .lb-stagger if manually added
  document.querySelectorAll('.lb-stagger').forEach(el => {
    // Ensure stagger children are visible on load if already in viewport
    el.classList.add('lb-visible');
  });

  // General observer for all animation classes
  const animClasses = '.lb-reveal, .lb-fade-up, .lb-fade-left, .lb-fade-right, .lb-scale-in, .lb-stagger, .lb-image-reveal';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Handle stagger children with delay
        if (el.classList.contains('lb-stagger')) {
          el.classList.add('lb-visible');
        } else if (el.classList.contains('lb-reveal')) {
          el.classList.add('lb-revealed');
        } else {
          el.classList.add('lb-visible');
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(animClasses).forEach(el => observer.observe(el));
});

// Smooth count-up for stats (counter animation)
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.counter');
  if (counters.length === 0) return;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target') || entry.target.textContent);
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            entry.target.textContent = target;
            clearInterval(timer);
          } else {
            entry.target.textContent = Math.ceil(current);
          }
        }, 30);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
});

// Parallax scroll effect (requestAnimationFrame based)
document.addEventListener('DOMContentLoaded', () => {
  const parallaxElements = document.querySelectorAll('.lb-parallax, .breadcrumbs');
  if (parallaxElements.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const speed = 0.3;
            const yPos = -(scrollY * speed);
            el.style.backgroundPositionY = yPos + 'px';
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
});