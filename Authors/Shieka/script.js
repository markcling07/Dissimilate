// Featured-section lightbox with swipe navigation
(function () {
    const thumbs = Array.from(document.querySelectorAll('.featured-card img'));
    const lightbox = document.getElementById('lightbox');
    const lbImg = lightbox.querySelector('.lightbox-img');
    const counter = lightbox.querySelector('.lightbox-counter');
    const btnClose = lightbox.querySelector('.lightbox-close');
    const btnPrev = lightbox.querySelector('.lightbox-prev');
    const btnNext = lightbox.querySelector('.lightbox-next');

    let current = 0;

    // Fade in only after the photo has loaded — on slow connections the old
    // timer-based fade played on an empty frame and the image seemed missing.
    function reveal() {
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                lbImg.classList.add('is-visible');
            });
        });
    }

    function show(index) {
        current = (index + thumbs.length) % thumbs.length;
        lbImg.classList.remove('is-visible');
        lbImg.onload = null;
        lbImg.onerror = null;
        lbImg.src = thumbs[current].src;
        lbImg.alt = thumbs[current].alt;
        counter.textContent = (current + 1) + ' / ' + thumbs.length;
        if (lbImg.complete && lbImg.naturalWidth > 0) {
            reveal();
        } else {
            lbImg.onload = reveal;
            lbImg.onerror = reveal;
        }
    }

    function openLightbox(index) {
        show(index);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    thumbs.forEach(function (img, i) {
        img.parentElement.addEventListener('click', function () {
            openLightbox(i);
        });
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    btnNext.addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });

    // Click on the dark backdrop closes
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') show(current - 1);
        else if (e.key === 'ArrowRight') show(current + 1);
    });

    // Touch swipe: left/right to navigate, down to close
    let touchStartX = 0;
    let touchStartY = 0;

    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < -50) show(current + 1);      // swipe left → next
            else if (dx > 50) show(current - 1);  // swipe right → previous
        } else if (dy > 80) {
            closeLightbox();                       // swipe down → close
        }
    }, { passive: true });
})();
