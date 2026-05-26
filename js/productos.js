/**
 * Solo catálogo: animaciones de sección, sliders horizontales e iconos.
 * Navbar, carrito y búsqueda: js/navbar-global.js (alineado con index.html).
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        },
        { threshold: 0.1 }
    );
    document.querySelectorAll('.platform-section').forEach((s) => observer.observe(s));

    document.querySelectorAll('.slider-track').forEach((track) => {
        const content = track.innerHTML;
        track.innerHTML = content + content;
    });
});
