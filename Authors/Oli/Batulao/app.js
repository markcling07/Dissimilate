/* ============================================================
   Oli's Mt. Batulao — Interactive App Logic
   Handles: Lightbox, Elevation Slider, Checklist, Scroll FX
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. LIGHTBOX ──────────────────────────────────────────
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    const galleryImages = Array.from(document.querySelectorAll('.gallery-img-original:not(.no-lightbox)'));
    let currentIndex = 0;

    function openLightbox(index) {
        currentIndex = index;
        const img = galleryImages[currentIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.alt || '';
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        openLightbox(currentIndex);
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        openLightbox(currentIndex);
    }

    galleryImages.forEach((img, index) => {
        const trigger = img.closest('.gallery-item') || img.closest('.gallery-item-original') || img.closest('.chapter-img-wrap') || img.closest('.hero-image-card') || img.closest('.fullbleed-section') || img;
        trigger.style.cursor = 'pointer';
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(index);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        }
    });


    // ── 2. SCROLL FADE-IN ────────────────────────────────────
    const fadeEls = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    fadeEls.forEach(el => observer.observe(el));


    // ── 3. NAVBAR SCROLL EFFECT ──────────────────────────────
    const topbar = document.getElementById('topbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (topbar) {
            if (current > 80) {
                topbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
            } else {
                topbar.style.boxShadow = 'none';
            }
        }
        lastScroll = current;
    });


    // ── 4. ACTIVE NAV LINK HIGHLIGHT ─────────────────────────
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.topbar-link');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-100px 0px -60% 0px'
    });

    sections.forEach(sec => navObserver.observe(sec));

    // ── 5. MOBILE CAROUSEL ──────────────────────────────────
    function initCarousel(carouselEl) {
        const track = carouselEl.querySelector('.carousel-track');
        const slides = carouselEl.querySelectorAll('.carousel-slide');
        const dots = carouselEl.querySelectorAll('.carousel-dot');
        let current = 0;
        let startX = 0;
        let diffX = 0;

        function goTo(index) {
            current = Math.max(0, Math.min(index, slides.length - 1));
            track.style.transform = `translateX(-${current * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
        }

        dots.forEach(dot => {
            dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
        });

        // Touch swipe
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            diffX = 0;
            track.style.transition = 'none';
        }, { passive: true });

        track.addEventListener('touchmove', (e) => {
            diffX = e.touches[0].clientX - startX;
            const offset = -(current * 100) + (diffX / track.offsetWidth) * 100;
            track.style.transform = `translateX(${offset}%)`;
        }, { passive: true });

        track.addEventListener('touchend', () => {
            track.style.transition = '';
            if (diffX > 50) goTo(current - 1);
            else if (diffX < -50) goTo(current + 1);
            else goTo(current);
        });
    }

    // Only init carousels on mobile
    const mobileQuery = window.matchMedia('(max-width: 600px)');
    function handleCarousels() {
        if (mobileQuery.matches) {
            document.querySelectorAll('.chapter-carousel').forEach(initCarousel);
        }
    }
    handleCarousels();
    mobileQuery.addEventListener('change', handleCarousels);

});
