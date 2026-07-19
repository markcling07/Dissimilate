// Photo lightbox — click a print to open, arrow/swipe through the scroll.
(function () {
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('main figure img'));
    if (!thumbs.length) return;

    var lightbox = document.getElementById('lightbox');
    var lbImg = lightbox.querySelector('.lightbox-img');
    var counter = lightbox.querySelector('.lightbox-counter');
    var caption = lightbox.querySelector('.lightbox-caption');
    var btnClose = lightbox.querySelector('.lightbox-close');
    var btnPrev = lightbox.querySelector('.lightbox-prev');
    var btnNext = lightbox.querySelector('.lightbox-next');

    var current = 0;
    var lastFocus = null;

    // Fade in only once the photo has decoded — otherwise on a slow connection
    // the fade plays over an empty frame and the image looks broken.
    function reveal() {
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                lbImg.classList.add('is-visible');
            });
        });
    }

    function show(index) {
        current = (index + thumbs.length) % thumbs.length;
        var img = thumbs[current];

        lbImg.classList.remove('is-visible');
        lbImg.onload = null;
        lbImg.onerror = null;
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        counter.textContent = (current + 1) + ' / ' + thumbs.length;

        var text = img.getAttribute('data-caption') || '';
        caption.textContent = text;
        lightbox.classList.toggle('has-caption', text !== '');

        if (lbImg.complete && lbImg.naturalWidth > 0) {
            reveal();
        } else {
            lbImg.onload = reveal;
            lbImg.onerror = reveal;
        }
    }

    function openLightbox(index) {
        lastFocus = document.activeElement;
        show(index);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        btnClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }

    // The prints are plain <img>, so a mouse can open the lightbox but a keyboard
    // can't. Promote each to a button: focusable, labelled, and Enter/Space-driven.
    thumbs.forEach(function (img, i) {
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        img.setAttribute('aria-label',
            'Open photo' + (img.alt ? ': ' + img.alt : '') + ' (' + (i + 1) + ' of ' + thumbs.length + ')');
        img.addEventListener('click', function () { openLightbox(i); });
        img.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                openLightbox(i);
            }
        });
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    btnNext.addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-stage')) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') show(current - 1);
        else if (e.key === 'ArrowRight') show(current + 1);
        else if (e.key === 'Tab') {
            // Keep focus on the modal's own controls while it's open. On touch the
            // prev/next arrows are display:none (offsetParent null) and drop out.
            var focusables = [btnClose, btnPrev, btnNext].filter(function (el) {
                return el && el.offsetParent !== null;
            });
            if (!focusables.length) return;
            var first = focusables[0];
            var last = focusables[focusables.length - 1];
            var at = focusables.indexOf(document.activeElement);
            if (e.shiftKey && (at <= 0)) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && (at === -1 || at === focusables.length - 1)) { e.preventDefault(); first.focus(); }
        }
    });

    // Touch: left/right navigates, a decisive downward drag closes.
    var startX = 0;
    var startY = 0;

    lightbox.addEventListener('touchstart', function (e) {
        startX = e.changedTouches[0].clientX;
        startY = e.changedTouches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < -50) show(current + 1);
            else if (dx > 50) show(current - 1);
        } else if (dy > 80) {
            closeLightbox();
        }
    }, { passive: true });
})();

// Prints rise as they enter the viewport. Skipped entirely when the reader has
// asked for reduced motion — no observer, no transition, nothing left hidden.
(function () {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || !('IntersectionObserver' in window)) return;

    var targets = Array.prototype.slice.call(
        document.querySelectorAll('.print, .chapter-heading, .note')
    );
    targets.forEach(function (el) { el.classList.add('will-reveal'); });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -12% 0px' });

    targets.forEach(function (el) { io.observe(el); });
})();
