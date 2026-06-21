/* Interactive functions for Mt. Negron Hike Photo Journal */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Video Play Custom Controller Overlay ---
    const videoWrappers = document.querySelectorAll('.video-card-wrapper');

    videoWrappers.forEach(wrapper => {
        const customVideo = wrapper.querySelector('.custom-video');
        const playOverlay = wrapper.querySelector('.video-overlay-play');

        if (playOverlay && customVideo) {
            playOverlay.addEventListener('click', () => {
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
                    wrapper.classList.remove('playing');
                }
            });

            // Also handle when video is paused externally
            customVideo.addEventListener('pause', () => {
                wrapper.classList.remove('playing');
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

    // Collect all zoomable image sources currently active/visible in grid
    let activeImages = [];
    let currentIndex = 0;

    function buildActiveImageList() {
        const galleryItems = Array.from(document.querySelectorAll('.gallery-item'))
            .filter(item => item.style.display !== 'none');
        
        activeImages = galleryItems.map(item => {
            const h4 = item.querySelector('h4');
            const label = item.querySelector('.collage-label');
            const img = item.querySelector('img');
            let caption = 'Mt. Negron Expedition Journal';
            if (h4) {
                caption = h4.textContent;
            } else if (label) {
                caption = label.textContent;
            } else if (img && img.getAttribute('alt')) {
                caption = img.getAttribute('alt');
            }
            return {
                src: item.getAttribute('data-src'),
                caption: caption
            };
        });
    }

    function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // block body scroll
        
        currentIndex = activeImages.findIndex(img => img.src === src);
        
        // Handle images clicked outside the main gallery (e.g. featured tree, companions)
        if (currentIndex === -1) {
            activeImages = [{ src, caption }];
            currentIndex = 0;
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        }
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    function showNext() {
        if (activeImages.length <= 1) return;
        currentIndex = (currentIndex + 1) % activeImages.length;
        lightboxImg.src = activeImages[currentIndex].src;
        lightboxCaption.textContent = activeImages[currentIndex].caption;
    }

    function showPrev() {
        if (activeImages.length <= 1) return;
        currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
        lightboxImg.src = activeImages[currentIndex].src;
        lightboxCaption.textContent = activeImages[currentIndex].caption;
    }

    // Attach click triggers to all image items
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            buildActiveImageList();
            const src = item.getAttribute('data-src');
            const h4 = item.querySelector('h4');
            const label = item.querySelector('.collage-label');
            const img = item.querySelector('img');
            let caption = 'Mt. Negron Expedition Journal';
            if (h4) {
                caption = h4.textContent;
            } else if (label) {
                caption = label.textContent;
            } else if (img && img.getAttribute('alt')) {
                caption = img.getAttribute('alt');
            }
            openLightbox(src, caption);
        });
    });

    // Section 1 (Flora Grid) image cycling trigger
    document.querySelectorAll('.flora-grid img').forEach(img => {
        img.addEventListener('click', (e) => {
            const targetSrc = e.target.getAttribute('src');
            const sectionImages = Array.from(document.querySelectorAll('.flora-grid img'))
                .filter(el => window.getComputedStyle(el).display !== 'none');
            activeImages = sectionImages.map(el => ({
                src: el.getAttribute('src'),
                caption: el.getAttribute('alt') || 'Mt. Negron Expedition Journal'
            }));
            currentIndex = activeImages.findIndex(img => img.src === targetSrc);
            openLightbox(targetSrc, activeImages[currentIndex].caption);
            
            if (activeImages.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'block';
                nextBtn.style.display = 'block';
            }
        });
    });

    // Section 5 (Companions Grid) image cycling trigger
    document.querySelectorAll('.companions-grid img').forEach(img => {
        img.addEventListener('click', (e) => {
            const targetSrc = e.target.getAttribute('src');
            const sectionImages = Array.from(document.querySelectorAll('.companions-grid img'))
                .filter(el => window.getComputedStyle(el).display !== 'none');
            activeImages = sectionImages.map(el => ({
                src: el.getAttribute('src'),
                caption: el.getAttribute('alt') || 'Mt. Negron Expedition Journal'
            }));
            currentIndex = activeImages.findIndex(img => img.src === targetSrc);
            openLightbox(targetSrc, activeImages[currentIndex].caption);
            
            if (activeImages.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'block';
                nextBtn.style.display = 'block';
            }
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Click the photo itself to go to the next image
    lightboxImg.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        }
    });





    // --- 4. Interactive Packing Checklist ---
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
