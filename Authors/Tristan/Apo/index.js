// JS for Tristan's Mt. Apo Climb Log (Bansalan Trail) — "The Long Way Up"
// Shared, content-agnostic behavior: sticky nav, reveal, chapter-spy, carousels, lightbox.

document.addEventListener("DOMContentLoaded", () => {
    initNavScroll();
    initReveal();
    initChapterSpy();
    initCarousels();
    initLightbox();
});

/* =====================================================================
   STICKY NAV — solidify after leaving the hero
   ===================================================================== */
function initNavScroll() {
    const nav = document.getElementById("site-nav");
    const hero = document.querySelector(".hero");
    if (!nav || !hero) return;

    const onScroll = () => {
        const trigger = hero.offsetHeight - 90;
        nav.classList.toggle("scrolled", window.scrollY > trigger);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
}

/* =====================================================================
   REVEAL ON SCROLL
   ===================================================================== */
function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        items.forEach(el => el.classList.add("in-view"));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    items.forEach(el => observer.observe(el));
}

/* =====================================================================
   CHAPTER PROGRESS BAR — scroll-spy + smooth scroll
   ===================================================================== */
function initChapterSpy() {
    const links = document.querySelectorAll(".chapter-link");
    const chapters = document.querySelectorAll(".chapter");
    if (!links.length || !chapters.length) return;

    // Smooth scroll with offset for the sticky nav + bar
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            const id = link.getAttribute("href").slice(1);
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            const offset = 120;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
        });
    });

    // Highlight the chapter currently in view
    const setActive = (id) => {
        links.forEach(l => l.classList.toggle("active", l.dataset.chapter === id));
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    chapters.forEach(ch => observer.observe(ch));
}

/* =====================================================================
   CAROUSELS (auto-play on hero, manual elsewhere) + swipe
   ===================================================================== */
function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(carousel => {
        const slides = carousel.querySelectorAll(".carousel-slide");
        const dots = carousel.querySelectorAll(".dot");
        if (slides.length <= 1) return;

        const isHero = carousel.closest(".hero") !== null;
        let index = 0;
        let timer = null;

        const show = (i) => {
            index = (i + slides.length) % slides.length;
            slides.forEach((s, n) => s.classList.toggle("active", n === index));
            dots.forEach((d, n) => d.classList.toggle("active", n === index));
        };

        dots.forEach((dot, i) => {
            dot.addEventListener("click", (e) => {
                e.stopPropagation();
                show(i);
                restart();
            });
        });

        // Swipe gestures
        let startX = 0;
        carousel.addEventListener("touchstart", (e) => {
            startX = e.changedTouches[0].clientX;
        }, { passive: true });
        carousel.addEventListener("touchend", (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) { show(dx < 0 ? index + 1 : index - 1); restart(); }
        }, { passive: true });

        const start = () => { timer = setInterval(() => show(index + 1), isHero ? 5500 : 6000); };
        const restart = () => { if (timer) { clearInterval(timer); start(); } };

        start();
    });
}

/* =====================================================================
   FULLSCREEN IMAGE LIGHTBOX
   ===================================================================== */
function initLightbox() {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const modalCaption = document.getElementById("modal-caption");
    const modalClose = document.getElementById("modal-close");
    const modalPrev = document.getElementById("modal-prev");
    const modalNext = document.getElementById("modal-next");
    if (!modal) return;

    let items = [];
    let current = 0;

    function gather() {
        items = [];
        const triggers = document.querySelectorAll(".gallery-trigger, .carousel-slide, .gallery-trigger-btn");
        triggers.forEach(el => {
            // Skip hero background carousel
            if (el.closest(".hero")) return;

            if (el.tagName === "BUTTON") {
                const src = el.getAttribute("data-target-img");
                const card = el.closest(".story");
                const imgEl = card ? card.querySelector(".gallery-trigger") : null;
                const caption = imgEl
                    ? (imgEl.getAttribute("data-caption") || imgEl.getAttribute("alt"))
                    : "Certificate of Climb";
                items.push({ src, caption });
            } else {
                items.push({
                    src: el.getAttribute("src"),
                    caption: el.getAttribute("data-caption") || el.getAttribute("alt") || ""
                });
            }
        });
        // De-dupe by src
        items = items.filter((v, i, self) => self.findIndex(t => t.src === v.src) === i);
    }

    function render() {
        const item = items[current];
        if (!item) return;
        modalImg.style.opacity = "0.2";
        modalImg.src = item.src;
        modalCaption.innerHTML = item.caption;
        modalImg.onload = () => { modalImg.style.opacity = "1"; };
    }

    function open(src) {
        gather();
        const idx = items.findIndex(i => i.src === src);
        current = idx !== -1 ? idx : 0;
        render();
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function close() {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
    }

    const next = () => { if (items.length) { current = (current + 1) % items.length; render(); } };
    const prev = () => { if (items.length) { current = (current - 1 + items.length) % items.length; render(); } };

    document.body.addEventListener("click", (e) => {
        const trigger = e.target.closest(".gallery-trigger, .carousel-slide, .gallery-trigger-btn");
        if (!trigger || trigger.closest(".hero")) return;
        e.preventDefault();
        const src = trigger.tagName === "BUTTON"
            ? trigger.getAttribute("data-target-img")
            : trigger.getAttribute("src");
        open(src);
    });

    if (modalClose) modalClose.addEventListener("click", close);
    if (modalPrev) modalPrev.addEventListener("click", (e) => { e.stopPropagation(); prev(); });
    if (modalNext) modalNext.addEventListener("click", (e) => { e.stopPropagation(); next(); });

    modal.addEventListener("click", (e) => {
        if (e.target.closest("#modal-img") || e.target.closest(".modal-caption") || e.target.closest(".modal-nav")) return;
        close();
    });

    document.addEventListener("keydown", (e) => {
        if (modal.classList.contains("hidden")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight") next();
        else if (e.key === "ArrowLeft") prev();
    });
}
