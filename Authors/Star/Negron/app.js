/* Interactive functions for Mt. Negron Hike Photo Journal */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Video Play Custom Controller Overlay ---
    const videoWrappers = document.querySelectorAll('.video-card-wrapper');

    videoWrappers.forEach(wrapper => {
        const customVideo = wrapper.querySelector('.custom-video');
        const playOverlay = wrapper.querySelector('.video-overlay-play');

        if (playOverlay && customVideo) {
            playOverlay.addEventListener('click', () => {
                // Once the reader has opted in, hand over to the native controls —
                // they bring keyboard scrubbing, volume and fullscreen for free.
                customVideo.controls = true;
                customVideo.play();
                wrapper.classList.add('playing');
            });

            // Toggle play/pause by clicking the video itself
            customVideo.addEventListener('click', () => {
                if (customVideo.paused) {
                    customVideo.play();
                    wrapper.classList.add('playing');
                } else {
                    customVideo.pause();
                }
            });

            // Pausing returns the poster overlay only if playback never really began.
            customVideo.addEventListener('pause', () => {
                if (customVideo.currentTime === 0) {
                    wrapper.classList.remove('playing');
                }
            });
        }
    });


    // --- 2. Lightbox Modal Functionality ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    const FALLBACK_CAPTION = 'Mt. Negron Expedition Journal';

    let activeImages = [];
    let currentIndex = 0;
    let lastFocused = null;

    // A gallery tile's caption: its heading, else its collage label, else the alt text.
    function captionForItem(item) {
        const h4 = item.querySelector('h4');
        const label = item.querySelector('.collage-label');
        const img = item.querySelector('img');
        return (h4 && h4.textContent)
            || (label && label.textContent)
            || (img && img.getAttribute('alt'))
            || FALLBACK_CAPTION;
    }

    function buildActiveImageList() {
        activeImages = Array.from(document.querySelectorAll('.gallery-item'))
            .filter(item => item.style.display !== 'none')
            .map(item => ({
                src: item.getAttribute('data-src'),
                caption: captionForItem(item)
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

        // Images clicked outside a known collection open on their own.
        const isSolo = currentIndex === -1;
        if (isSolo) {
            activeImages = [{ src, caption }];
            currentIndex = 0;
        }
        const single = isSolo || activeImages.length <= 1;
        prevBtn.hidden = single;
        nextBtn.hidden = single;

        render();
        lightbox.hidden = false;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // block body scroll
        closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
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
    function makeActivatable(el, label, onActivate) {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', `View image: ${label}`);
        el.addEventListener('click', onActivate);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate();
            }
        });
    }

    document.querySelectorAll('.gallery-item').forEach(item => {
        makeActivatable(item, captionForItem(item), () => {
            buildActiveImageList();
            openLightbox(item.getAttribute('data-src'), captionForItem(item));
        });
    });

    // The overlapping photo frames each get their own scoped carousel. Only the
    // images actually visible at this breakpoint are included.
    function wireScopedGallery(selector) {
        document.querySelectorAll(`${selector} img`).forEach(img => {
            const caption = img.getAttribute('alt') || FALLBACK_CAPTION;
            makeActivatable(img, caption, () => {
                activeImages = Array.from(document.querySelectorAll(`${selector} img`))
                    .filter(el => window.getComputedStyle(el).display !== 'none')
                    .map(el => ({
                        src: el.getAttribute('src'),
                        caption: el.getAttribute('alt') || FALLBACK_CAPTION
                    }));
                openLightbox(img.getAttribute('src'), caption);
            });
        });
    }

    wireScopedGallery('.flora-grid');
    wireScopedGallery('.companions-grid');

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Click the photo itself to go to the next image
    lightboxImg.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation, plus a focus trap so Tab can't escape the open dialog.
    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;

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



    // --- 3. Interactive Packing Checklist ---
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
