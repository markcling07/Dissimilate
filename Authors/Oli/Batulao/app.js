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


    // ── 2. ELEVATION SLIDER ──────────────────────────────────
    const slider = document.getElementById('elevationSlider');
    const cpLabel = document.getElementById('cpLabel');
    const cpHeight = document.getElementById('cpHeight');
    const cpGrade = document.getElementById('cpGrade');
    const graphBars = document.querySelectorAll('.graph-bar');

    const checkpoints = [
        { range: [0, 12],   label: 'Trailhead',     height: '200m',  grade: 'Flat' },
        { range: [13, 25],  label: 'Peak 3',         height: '380m',  grade: 'Easy Incline' },
        { range: [26, 38],  label: 'Peak 5',         height: '500m',  grade: 'Moderate' },
        { range: [39, 50],  label: 'Peak 7',         height: '620m',  grade: 'Moderate' },
        { range: [51, 62],  label: "Diana's Peak 8", height: '710m',  grade: 'Steep' },
        { range: [63, 75],  label: 'Summit Peak',    height: '811m',  grade: 'Summit Ridge' },
        { range: [76, 88],  label: 'Descent Ridge',  height: '550m',  grade: 'Steep Down' },
        { range: [89, 95],  label: 'Lower Trail',    height: '320m',  grade: 'Easy' },
        { range: [96, 100], label: 'Base Return',    height: '200m',  grade: 'Flat' },
    ];

    if (slider) {
        slider.addEventListener('input', () => {
            const val = parseInt(slider.value);
            const cp = checkpoints.find(c => val >= c.range[0] && val <= c.range[1]);
            if (cp) {
                cpLabel.textContent = cp.label;
                cpHeight.textContent = cp.height;
                cpGrade.textContent = cp.grade;
            }

            // Highlight the matching bar
            const barIndex = Math.floor((val / 100) * (graphBars.length - 1));
            graphBars.forEach((bar, i) => {
                bar.classList.toggle('active', i === barIndex);
            });
        });
    }


    // ── 3. PACKING CHECKLIST ─────────────────────────────────
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const progressText = document.getElementById('packProgressText');
    const progressBar = document.getElementById('packProgressBar');

    function updatePack() {
        const total = checkboxes.length;
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        if (progressText) progressText.textContent = `${checked} of ${total} items packed`;
        if (progressBar) progressBar.style.width = `${(checked / total) * 100}%`;
    }

    checkboxes.forEach(cb => cb.addEventListener('change', updatePack));
    updatePack(); // initial sync


    // ── 4. SCROLL FADE-IN ────────────────────────────────────
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


    // ── 5. NAVBAR SCROLL EFFECT ──────────────────────────────
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


    // ── 6. ACTIVE NAV LINK HIGHLIGHT ─────────────────────────
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

    // ── 7. MOBILE CAROUSEL ──────────────────────────────────
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
