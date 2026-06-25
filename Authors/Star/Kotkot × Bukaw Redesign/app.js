/* Interactive functions for Mt. Kotkot x Mt. Bukaw Hike Photo Journal */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Lightbox Modal Functionality ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // Collect all zoomable image sources currently active/visible
    let activeImages = [];
    let currentIndex = 0;

    function buildActiveImageList() {
        const galleryItems = Array.from(document.querySelectorAll('.gallery-item'))
            .filter(item => item.style.display !== 'none');
        
        activeImages = galleryItems.map(item => ({
            src: item.getAttribute('data-src'),
            caption: item.querySelector('h4').textContent
        }));
    }

    function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // block scrolling
        
        currentIndex = activeImages.findIndex(img => img.src === src);
        
        // Handle images clicked outside the main gallery (e.g. hero, collage, dog)
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

    // Attach click triggers to all image wrappers
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            buildActiveImageList();
            const src = item.getAttribute('data-src');
            const caption = item.querySelector('h4').textContent;
            openLightbox(src, caption);
        });
    });

    document.querySelectorAll('.featured-img, .collage-img-base, .collage-img-overlay, .waterfall-img, .companion-img').forEach(img => {
        img.addEventListener('click', (e) => {
            const src = e.target.getAttribute('src');
            const caption = e.target.getAttribute('data-caption') || e.target.getAttribute('alt') || 'Scenic view from Mt. Kotkot × Mt. Bukaw Circuit';
            activeImages = []; // single view
            openLightbox(src, caption);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
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
