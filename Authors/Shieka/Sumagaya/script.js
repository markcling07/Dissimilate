// Essay lightbox with swipe navigation — mirrors the profile page's popup
(function () {
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('main figure img'));
    var lightbox = document.getElementById('lightbox');
    var lbImg = lightbox.querySelector('.lightbox-img');
    var counter = lightbox.querySelector('.lightbox-counter');
    var caption = lightbox.querySelector('.lightbox-caption');
    var btnClose = lightbox.querySelector('.lightbox-close');
    var btnPrev = lightbox.querySelector('.lightbox-prev');
    var btnNext = lightbox.querySelector('.lightbox-next');

    var current = 0;

    function show(index) {
        current = (index + thumbs.length) % thumbs.length;
        lbImg.classList.remove('is-visible');
        lbImg.src = thumbs[current].src;
        lbImg.alt = thumbs[current].alt;
        counter.textContent = (current + 1) + ' / ' + thumbs.length;
        var captionText = thumbs[current].getAttribute('data-caption') || '';
        caption.textContent = captionText;
        lightbox.classList.toggle('has-caption', captionText !== '');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                lbImg.classList.add('is-visible');
            });
        });
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
        img.addEventListener('click', function () {
            openLightbox(i);
        });
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    btnNext.addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') show(current - 1);
        else if (e.key === 'ArrowRight') show(current + 1);
    });

    // Touch swipe: left/right to navigate, down to close
    var touchStartX = 0;
    var touchStartY = 0;

    lightbox.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < -50) show(current + 1);
            else if (dx > 50) show(current - 1);
        } else if (dy > 80) {
            closeLightbox();
        }
    }, { passive: true });
})();
