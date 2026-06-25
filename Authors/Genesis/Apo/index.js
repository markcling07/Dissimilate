// JS Logic for Genesis's Mt. Apo Climb Log - Mobile Editorial Redesign

document.addEventListener("DOMContentLoaded", () => {
    // Initialize component logic
    initChapters();
    initCarousels();
    initLightbox();
    initBookmark();
});

/* ==========================================================================
   CHAPTER TABS NAVIGATION
   ========================================================================== */
function initChapters() {
    const tabButtons = document.querySelectorAll(".nav-tab");
    const chapters = document.querySelectorAll(".chapter-content");
    const scrollContainer = document.querySelector(".phone-content-scrollable");
    const startJourneyBtn = document.querySelector("#start-journey-btn");

    function switchChapter(chapterIndex) {
        // Update active states on tab buttons
        tabButtons.forEach(btn => {
            if (btn.getAttribute("data-chapter") == chapterIndex) {
                btn.classList.add("active");
                // Scroll the tab scrollbar so the active tab is centered/visible
                btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            } else {
                btn.classList.remove("active");
            }
        });

        // Update active states on chapters
        chapters.forEach(chap => {
            if (chap.id === `chapter-${chapterIndex}`) {
                chap.classList.add("active");
            } else {
                chap.classList.remove("active");
            }
        });
    }

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const chapId = btn.getAttribute("data-chapter");
            switchChapter(chapId);
            
            // Scroll smoothly down to the chapter content area
            const headerOffset = 140; // Approx heights of header + tabs + padding
            const targetElement = document.querySelector(".chapter-navigation");
            if (targetElement && scrollContainer) {
                scrollContainer.scrollTo({
                    top: targetElement.offsetTop - 10,
                    behavior: "smooth"
                });
            }
        });
    });

    // "Begin Journey" button action: shifts to Chapter 1 and scrolls
    if (startJourneyBtn) {
        startJourneyBtn.addEventListener("click", () => {
            switchChapter(1);
            const targetElement = document.querySelector(".chapter-navigation");
            if (targetElement && scrollContainer) {
                scrollContainer.scrollTo({
                    top: targetElement.offsetTop - 10,
                    behavior: "smooth"
                });
            }
        });
    }
}

/* ==========================================================================
   CAROUSEL SYSTEMS
   ========================================================================== */
function initCarousels() {
    const carouselContainers = document.querySelectorAll(".card-image-container");

    carouselContainers.forEach(container => {
        const slides = container.querySelectorAll(".carousel-slide");
        const dots = container.querySelectorAll(".carousel-dot");
        
        if (slides.length <= 1) return; // Only run carousel if multiple slides exist

        let currentIndex = 0;
        let isCoverCarousel = container.closest(".cover-card-section") !== null;
        let timer = null;

        function showSlide(index) {
            // Keep index within bounds
            if (index >= slides.length) index = 0;
            if (index < 0) index = slides.length - 1;

            currentIndex = index;

            // Toggle active class on images
            slides.forEach((slide, idx) => {
                if (idx === index) {
                    slide.classList.add("active");
                } else {
                    slide.classList.remove("active");
                }
            });

            // Toggle active class on pagination dots
            dots.forEach((dot, idx) => {
                if (idx === index) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        }

        // Attach click listeners to dots
        dots.forEach((dot, idx) => {
            dot.addEventListener("click", (e) => {
                e.stopPropagation(); // Avoid triggering parent clicks
                showSlide(idx);
                resetAutoPlay();
            });
        });

        // Swipe Gestures Support
        let startX = 0;
        let endX = 0;

        container.addEventListener("touchstart", (e) => {
            startX = e.changedTouches[0].clientX;
        }, { passive: true });

        container.addEventListener("touchend", (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 40;
            if (endX < startX - threshold) {
                showSlide(currentIndex + 1); // Swipe left -> Next
                resetAutoPlay();
            } else if (endX > startX + threshold) {
                showSlide(currentIndex - 1); // Swipe right -> Prev
                resetAutoPlay();
            }
        }

        // Auto-play for the main Hero/Cover carousel only
        function startAutoPlay() {
            if (isCoverCarousel) {
                timer = setInterval(() => {
                    showSlide(currentIndex + 1);
                }, 5000);
            }
        }

        function resetAutoPlay() {
            if (timer) {
                clearInterval(timer);
                startAutoPlay();
            }
        }

        startAutoPlay();
    });
}

/* ==========================================================================
   FULLSCREEN IMAGE LIGHTBOX
   ========================================================================== */
function initLightbox() {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const modalCaption = document.getElementById("modal-caption");
    const modalClose = document.getElementById("modal-close");
    const modalPrev = document.getElementById("modal-prev");
    const modalNext = document.getElementById("modal-next");

    let galleryItems = [];
    let currentIndex = 0;

    // Gather all expandable images on the page
    // Includes stand-alone gallery-triggers and all carousel-slides
    function updateGalleryItems() {
        galleryItems = [];
        
        // Find all visual images in active view or all views
        // We gather all images from all chapters to make a unified gallery
        const triggers = document.querySelectorAll(".gallery-trigger, .carousel-slide, .gallery-trigger-btn");
        
        triggers.forEach(el => {
            if (el.tagName === "BUTTON") {
                // Button reference: has data-target-img attribute
                const imgSrc = el.getAttribute("data-target-img");
                const card = el.closest(".premium-card");
                const imgEl = card ? card.querySelector(".gallery-trigger") : null;
                const caption = imgEl ? (imgEl.getAttribute("data-caption") || imgEl.getAttribute("alt")) : "Certificate of Climb";
                
                galleryItems.push({
                    src: imgSrc,
                    caption: caption
                });
            } else {
                // Image tag
                const src = el.getAttribute("src");
                const caption = el.getAttribute("data-caption") || el.getAttribute("alt") || "";
                
                // Avoid duplicating the cover splash slides in the general gallery
                if (el.closest(".cover-card-section")) {
                    return; 
                }

                galleryItems.push({
                    src: src,
                    caption: caption
                });
            }
        });

        // Remove duplicates based on image src
        galleryItems = galleryItems.filter((value, index, self) =>
            self.findIndex(t => t.src === value.src) === index
        );
    }

    function openLightbox(src) {
        updateGalleryItems();
        
        // Find matched index in our unified gallery list
        const foundIdx = galleryItems.findIndex(item => item.src === src);
        currentIndex = foundIdx !== -1 ? foundIdx : 0;
        
        updateLightboxContent();
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Disable background scrolling
    }

    function updateLightboxContent() {
        const item = galleryItems[currentIndex];
        if (!item) return;

        modalImg.style.opacity = "0.2";
        modalImg.src = item.src;
        modalCaption.innerHTML = item.caption;

        modalImg.onload = () => {
            modalImg.style.opacity = "1";
        };
    }

    function showNext() {
        if (galleryItems.length === 0) return;
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateLightboxContent();
    }

    function showPrev() {
        if (galleryItems.length === 0) return;
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxContent();
    }

    function closeLightbox() {
        modal.classList.add("hidden");
        document.body.style.overflow = ""; // Restore scrolling
    }

    // Attach click listeners to gallery elements
    document.body.addEventListener("click", (e) => {
        const trigger = e.target.closest(".gallery-trigger, .carousel-slide, .gallery-trigger-btn");
        if (trigger) {
            // Check if it's the cover splash carousel (we don't want lightbox on cover)
            if (trigger.closest(".cover-card-section")) return;

            e.preventDefault();
            const src = trigger.tagName === "BUTTON" 
                ? trigger.getAttribute("data-target-img") 
                : trigger.getAttribute("src");
            
            openLightbox(src);
        }
    });

    // Close button click
    if (modalClose) modalClose.addEventListener("click", closeLightbox);

    // Prev/Next clicks
    if (modalPrev) {
        modalPrev.addEventListener("click", (e) => {
            e.stopPropagation();
            showPrev();
        });
    }

    if (modalNext) {
        modalNext.addEventListener("click", (e) => {
            e.stopPropagation();
            showNext();
        });
    }

    // Click outside image closes modal
    modal.addEventListener("click", (e) => {
        if (e.target.closest('#modal-img') || e.target.closest('.modal-caption') || e.target.closest('.modal-nav')) {
            return;
        }
        closeLightbox();
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
        if (modal.classList.contains("hidden")) return;
        
        if (e.key === "Escape") {
            closeLightbox();
        } else if (e.key === "ArrowRight") {
            showNext();
        } else if (e.key === "ArrowLeft") {
            showPrev();
        }
    });
}

/* ==========================================================================
   BOOKMARK SIMULATOR
   ========================================================================== */
function initBookmark() {
    const bookmarkBtn = document.querySelector(".bookmark-action");
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener("click", () => {
            bookmarkBtn.classList.toggle("active");
            
            // Add a small bounce/click animation
            bookmarkBtn.style.transform = "scale(0.85)";
            setTimeout(() => {
                bookmarkBtn.style.transform = "";
            }, 150);
        });
    }
}
