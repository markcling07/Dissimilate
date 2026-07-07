// Essay lightbox with swipe navigation — mirrors the profile page's popup
(function () {
    var allImgs = Array.prototype.slice.call(document.querySelectorAll('main figure img'));
    // Stack-back photos (the card peeking behind img 10) are viewable by tapping
    // them directly, but excluded from the prev/next sequence.
    var thumbs = allImgs.filter(function (img) { return !img.classList.contains('stack-back'); });
    var lightbox = document.getElementById('lightbox');
    var lbImg = lightbox.querySelector('.lightbox-img');
    var counter = lightbox.querySelector('.lightbox-counter');
    var caption = lightbox.querySelector('.lightbox-caption');
    var btnClose = lightbox.querySelector('.lightbox-close');
    var btnPrev = lightbox.querySelector('.lightbox-prev');
    var btnNext = lightbox.querySelector('.lightbox-next');

    var current = 0;
    var standalone = false; // true while a sequence-excluded (stack-back) photo is shown

    function render(img, counterText) {
        lbImg.classList.remove('is-visible');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        counter.textContent = counterText;
        var captionText = img.getAttribute('data-caption') || '';
        caption.textContent = captionText;
        lightbox.classList.toggle('has-caption', captionText !== '');
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                lbImg.classList.add('is-visible');
            });
        });
    }

    function show(index) {
        current = (index + thumbs.length) % thumbs.length;
        standalone = false;
        render(thumbs[current], (current + 1) + ' / ' + thumbs.length);
    }

    function next() {
        show(current + 1);
    }

    function prev() {
        // From a standalone photo, "prev" returns to the card it was stacked with
        show(standalone ? current : current - 1);
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

    // Stack-back photos open full-size on tap; from there, next continues past
    // the stack (img 10 -> img 12) and prev returns to the front card.
    allImgs.forEach(function (img) {
        if (!img.classList.contains('stack-back')) return;
        img.addEventListener('click', function () {
            var front = img.parentElement.querySelector('.stack-front');
            current = Math.max(0, thumbs.indexOf(front));
            standalone = true;
            render(img, '');
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
    btnNext.addEventListener('click', function (e) { e.stopPropagation(); next(); });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'ArrowRight') next();
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
            if (dx < -50) next();
            else if (dx > 50) prev();
        } else if (dy > 80) {
            closeLightbox();
        }
    }, { passive: true });
})();

// Photo stack (chapter 5): swipe or drag sideways to shuffle which card is on
// top; a plain tap/click still opens the lightbox with the whole image.
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
