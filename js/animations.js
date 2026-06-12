document.addEventListener('DOMContentLoaded', () => {
  const selectors = '.section-title, .service-item, .single-service, .single-table, .about-img, .about-content, .faq-item, .portfolio-item, .single-pf';
  document.querySelectorAll(selectors).forEach(el => el.classList.add('lb-reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('lb-revealed'), idx * 75);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.lb-reveal').forEach(el => observer.observe(el));
});

window.addEventListener('scroll', () => {
  const header = document.querySelector('.header-inner');
  if (header) header.classList.toggle('scrolled', window.scrollY > 80);
});