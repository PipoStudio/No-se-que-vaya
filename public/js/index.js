document.addEventListener('DOMContentLoaded', () => {
    // HERO: autoplay secuencial + barras de progreso robustas
    const heroSlides = document.querySelectorAll('.video-slide');
    const heroBars = document.querySelectorAll('.slider-bar');
    const heroVideos = document.querySelectorAll('.video-slide video');
    const heroDuration = 6000;
    let currentHero = 0;
    let heroTimer = null;

    function resetBarAnimation(index) {
        const fill = heroBars[index]?.querySelector('.progress-fill');
        if (!fill) return;
        fill.style.animation = 'none';
        fill.offsetHeight;
        fill.style.animation = '';
    }

    function setHeroSlide(index) {
        if (!heroSlides.length || !heroBars.length) return;
        heroSlides[currentHero]?.classList.remove('active');
        heroBars[currentHero]?.classList.remove('active');

        currentHero = index % heroSlides.length;

        heroSlides[currentHero]?.classList.add('active');
        heroBars[currentHero]?.classList.add('active');
        resetBarAnimation(currentHero);

        const activeVideo = heroVideos[currentHero];
        if (activeVideo) {
            activeVideo.muted = true;
            activeVideo.playsInline = true;
            activeVideo.currentTime = 0;
            const playPromise = activeVideo.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
            }
        }
    }

    function scheduleNextHero() {
        clearTimeout(heroTimer);
        heroTimer = setTimeout(() => {
            setHeroSlide((currentHero + 1) % heroSlides.length);
            scheduleNextHero();
        }, heroDuration);
    }

    if (heroSlides.length > 0 && heroBars.length > 0) {
        heroBars.forEach((bar, index) => {
            bar.addEventListener('click', () => {
                setHeroSlide(index);
                scheduleNextHero();
            });
        });

        // Si un video falla, no bloquea el slider.
        heroVideos.forEach((video, index) => {
            video.addEventListener('error', () => {
                if (index === currentHero) {
                    setTimeout(() => {
                        setHeroSlide((currentHero + 1) % heroSlides.length);
                        scheduleNextHero();
                    }, 500);
                }
            });
        });

        setHeroSlide(0);
        scheduleNextHero();
    }

    const track = document.getElementById('bsTrack');
    const prevBtn = document.getElementById('bsPrevBtn');
    const nextBtn = document.getElementById('bsNextBtn');
    const slides = document.querySelectorAll('.bs-slide');

    if (!track || slides.length === 0) return;

    let autoSlideInterval;
    let isTransitioning = false;
    const transitionSpeed = 'transform 0.4s ease-in-out';

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        track.style.transition = transitionSpeed;
        track.style.transform = 'translateX(-100%)';
    }

    function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;

        track.prepend(track.lastElementChild);
        track.style.transition = 'none';
        track.style.transform = 'translateX(-100%)';
        track.offsetHeight;
        track.style.transition = transitionSpeed;
        track.style.transform = 'translateX(0)';
    }

    track.addEventListener('transitionend', () => {
        if (track.style.transform === 'translateX(-100%)') {
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'translateX(0)';
        }
        isTransitioning = false;
    });

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 3500);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });

    startAutoSlide();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
