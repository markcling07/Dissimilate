// Essay lightbox with swipe navigation — mirrors the profile page's popup
// Unlike the Apo page, the stack-back card (img 7) is part of the normal
// prev/next sequence here — every photo is reachable by arrowing through.
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
        var captionText = thumbs[current].getAttribute('data-caption') || '';
        caption.textContent = captionText;
        lightbox.classList.toggle('has-caption', captionText !== '');
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

// Photo stack (chapter 4): swipe or drag sideways to shuffle which card is on
// top; a plain tap/click still opens the lightbox.
(function () {
    var stacks = Array.prototype.slice.call(document.querySelectorAll('.photo-stack'));

    stacks.forEach(function (stack) {
        var startX = 0;
        var startY = 0;
        var justSwiped = false;

        stack.addEventListener('pointerdown', function (e) {
            startX = e.clientX;
            startY = e.clientY;
        });

        stack.addEventListener('pointerup', function (e) {
            var dx = e.clientX - startX;
            var dy = e.clientY - startY;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                stack.classList.toggle('swapped');
                justSwiped = true;
            }
        });

        // Swallow the click that follows a swipe so it doesn't open the lightbox
        stack.addEventListener('click', function (e) {
            if (justSwiped) {
                e.stopPropagation();
                e.preventDefault();
                justSwiped = false;
            }
        }, true);

        // Keep the browser's native image-drag from hijacking mouse swipes
        stack.addEventListener('dragstart', function (e) {
            e.preventDefault();
        });
    });
})();
