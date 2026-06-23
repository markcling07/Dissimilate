// JS Logic for Mt. Matutum Essay Page - Editorial Redesign

// Lightbox Modal Elements
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");
const modalImgWrapper = document.getElementById("modal-img-wrapper");
const modalCaption = document.getElementById("modal-caption");
const modalClose = document.getElementById("modal-close");
const modalPrev = document.getElementById("modal-prev");
const modalNext = document.getElementById("modal-next");

// Gather all images for the dynamic gallery
const galleryImages = Array.from(document.querySelectorAll('.editorial-img, .gallery-img'));
let currentIndex = 0;

// Initialize click listeners on all images
galleryImages.forEach((img, index) => {
    img.addEventListener("click", () => {
        openLightbox(index);
    });
});

function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevents background scrolling
}

function updateLightbox() {
    const targetImg = galleryImages[currentIndex];
    if (!targetImg) return;
    
    // Add a fade out/in effect for smoother transit
    modalImg.style.opacity = "0.2";
    modalImg.src = targetImg.getAttribute("src");
    modalCaption.innerHTML = targetImg.getAttribute("data-caption") || targetImg.getAttribute("alt");
    
    // Fade back in when image is loaded
    modalImg.onload = () => {
        modalImg.style.opacity = "1";
    };
}

function showNext() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updateLightbox();
}

function showPrev() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightbox();
}

function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = ""; // Re-enable background scrolling
}

// Lightbox Event Listeners
modalClose.addEventListener("click", closeModal);
modalPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
});
modalNext.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
});

modal.addEventListener("click", (e) => {
    // If clicking outside the active image, the caption text, or navigation buttons, close the modal
    if (e.target.closest('#modal-img') || e.target.closest('.modal-caption') || e.target.closest('.modal-nav')) {
        return;
    }
    closeModal();
});

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
    if (modal.classList.contains("hidden")) return;
    
    if (e.key === "Escape") {
        closeModal();
    } else if (e.key === "ArrowRight") {
        showNext();
    } else if (e.key === "ArrowLeft") {
        showPrev();
    }
});

// Smooth Scroll Links (adjusted for sticky header offset)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        
        if (!targetId) return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerOffset = 20;
            const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Responsive DOM repositioning of Title Area
const titleArea = document.querySelector('.title-area');
const heroTopGrid = document.querySelector('.hero-top-grid');
const leftImageCard = document.querySelector('.left-image .card-inner');

function handleResponsiveLayout() {
    if (window.innerWidth <= 1024) {
        if (titleArea && leftImageCard && !leftImageCard.contains(titleArea)) {
            leftImageCard.appendChild(titleArea);
        }
    } else {
        if (titleArea && heroTopGrid && !heroTopGrid.contains(titleArea)) {
            heroTopGrid.appendChild(titleArea);
        }
    }
}

// Run on load and resize
window.addEventListener('DOMContentLoaded', handleResponsiveLayout);
window.addEventListener('resize', handleResponsiveLayout);
// Call immediately to handle initial load
handleResponsiveLayout();

// Mobile Chapter Tabs Interactivity
const tabButtons = document.querySelectorAll('.chapter-tab-btn');
const chapters = document.querySelectorAll('.chapter-section');
const chaptersContainer = document.querySelector('.chapter-tabs-mobile');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        
        // Update active class on buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show target chapter, hide others on mobile
        chapters.forEach(chap => {
            if (chap.id === targetId) {
                chap.classList.remove('mobile-hidden');
            } else {
                chap.classList.add('mobile-hidden');
            }
        });
        
        // Scroll window smoothly to just above the tabs selector
        if (chaptersContainer) {
            const containerPosition = chaptersContainer.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: containerPosition - 10,
                behavior: 'smooth'
            });
        }
    });
});
