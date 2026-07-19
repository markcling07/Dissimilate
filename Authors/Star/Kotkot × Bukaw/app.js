/* Interactive functions for Mt. Kotkot x Mt. Bukaw Hike Photo Journal */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Lightbox Modal Functionality ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    let activeImages = [];
    let currentIndex = 0;
    let lastFocused = null;

    // Prefer the authored caption; fall back to alt text, then a generic label.
    function captionFor(el) {
        return el.getAttribute('data-caption')
            || el.getAttribute('alt')
            || 'Scenic view from Mt. Kotkot × Mt. Bukaw Circuit';
    }

    function buildActiveImageList() {
        activeImages = Array.from(document.querySelectorAll('.gallery-item'))
            .filter(item => item.style.display !== 'none')
            .map(item => ({
                src: item.getAttribute('data-src'),
                caption: item.querySelector('h4').textContent
            }));
    }

    function render() {
        const { src, caption } = activeImages[currentIndex];
        lightboxImg.src = src;
        lightboxImg.alt = caption;
        lightboxCaption.textContent = caption;
    }

    function openLightbox(src, caption) {
        lastFocused = document.activeElement;

        currentIndex = activeImages.findIndex(img => img.src === src);

        // Images outside the main gallery (collage, waterfalls, companion) open solo.
        const isSolo = currentIndex === -1;
        if (isSolo) {
            activeImages = [{ src, caption }];
            currentIndex = 0;
        }
        prevBtn.hidden = isSolo;
        nextBtn.hidden = isSolo;

        render();
        lightbox.hidden = false;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // block scrolling
        closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    function isOpen() {
        return !lightbox.hidden;
    }

    function showNext() {
        if (activeImages.length <= 1) return;
        currentIndex = (currentIndex + 1) % activeImages.length;
        render();
    }

    function showPrev() {
        if (activeImages.length <= 1) return;
        currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
        render();
    }

    // Make a non-button element behave like one: focusable, and Enter/Space activates.
    function makeActivatable(el, onActivate) {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.addEventListener('click', onActivate);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate();
            }
        });
    }

    document.querySelectorAll('.gallery-item').forEach(item => {
        const label = item.querySelector('h4').textContent;
        item.setAttribute('aria-label', `View image: ${label}`);
        makeActivatable(item, () => {
            buildActiveImageList();
            openLightbox(item.getAttribute('data-src'), label);
        });
    });

    document.querySelectorAll('.featured-img, .collage-img-base, .collage-img-overlay, .waterfall-img, .companion-img').forEach(img => {
        const caption = captionFor(img);
        img.setAttribute('aria-label', `View image: ${caption}`);
        makeActivatable(img, () => {
            activeImages = []; // single view
            openLightbox(img.getAttribute('src'), caption);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard support, plus a focus trap so Tab can't escape the open dialog.
    document.addEventListener('keydown', (e) => {
        if (!isOpen()) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();

        if (e.key === 'Tab') {
            const focusable = [closeBtn, prevBtn, nextBtn].filter(btn => !btn.hidden);
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });


    // --- 2. Interactive Packing Checklist ---
    const checkboxes = document.querySelectorAll('.checklist-item input');
    const progressBar = document.getElementById('packProgressBar');
    const progressText = document.getElementById('packProgressText');

    function updateChecklist() {
        const total = checkboxes.length;
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${checkedCount} of ${total} items checked`;
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateChecklist);
    });

    // Initialize progress bar
    updateChecklist();
});
