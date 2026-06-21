/* Interactive functions for Mt. Makiling Hike Photo Journal */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Audio Ambience Synthesizer (Web Audio API) ---
    let audioCtx = null;
    let windNode = null;
    let windFilter = null;
    let mainGain = null;
    let isPlaying = false;
    let birdTimer = null;

    const soundToggle = document.getElementById('soundToggle');

    function createNoiseBuffer() {
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        
        // Generate Pink-ish/Brown-ish noise for wind
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // First-order filter for brown-ish/pink-ish sound
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // boost volume
        }
        return noiseBuffer;
    }

    function startAmbience() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume context if suspended (browser security)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Master Gain
        mainGain = audioCtx.createGain();
        mainGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
        mainGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 2); // smooth fade in
        mainGain.connect(audioCtx.destination);

        // Wind Source
        const noiseBuffer = createNoiseBuffer();
        windNode = audioCtx.createBufferSource();
        windNode.buffer = noiseBuffer;
        windNode.loop = true;

        // Wind Filter (creates the rustling leaf feel)
        windFilter = audioCtx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.setValueAtTime(400, audioCtx.currentTime);
        windFilter.Q.setValueAtTime(1.0, audioCtx.currentTime);

        windNode.connect(windFilter);
        windFilter.connect(mainGain);
        windNode.start(0);

        // Slow wind modulation
        modulateWind();

        // Bird chirping scheduler
        scheduleBirds();
    }

    function stopAmbience() {
        if (mainGain) {
            // Smooth fade out
            mainGain.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 1.5);
            setTimeout(() => {
                if (windNode) {
                    try { windNode.stop(); } catch(e) {}
                    windNode.disconnect();
                }
                if (windFilter) windFilter.disconnect();
                if (mainGain) mainGain.disconnect();
                clearTimeout(birdTimer);
                windNode = null;
                windFilter = null;
                mainGain = null;
            }, 1600);
        } else {
            clearTimeout(birdTimer);
        }
    }

    function modulateWind() {
        if (!isPlaying || !windFilter) return;
        
        // Randomly modulate wind filter frequency to simulate gusts
        const targetFreq = 200 + Math.random() * 600;
        const speed = 2 + Math.random() * 4;
        
        if (windFilter && audioCtx) {
            windFilter.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + speed);
        }
        
        setTimeout(modulateWind, speed * 1000);
    }

    function makeBirdChirp() {
        if (!isPlaying || !audioCtx || !mainGain) return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(mainGain);

        osc.type = 'sine';
        // Bird sweep frequency: quick slide up and down
        const startTime = audioCtx.currentTime;
        const duration = 0.15 + Math.random() * 0.15;
        const baseFreq = 2200 + Math.random() * 600;

        osc.frequency.setValueAtTime(baseFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 1200, startTime + duration * 0.4);
        osc.frequency.exponentialRampToValueAtTime(baseFreq - 500, startTime + duration);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);

        // occasional double chirp
        if (Math.random() > 0.6) {
            setTimeout(() => {
                makeBirdChirp();
            }, 200);
        }
    }

    function scheduleBirds() {
        if (!isPlaying) return;
        const nextTime = 4000 + Math.random() * 8000; // chirp every 4-12 seconds
        birdTimer = setTimeout(() => {
            makeBirdChirp();
            scheduleBirds();
        }, nextTime);
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                soundToggle.classList.add('playing');
                soundToggle.querySelector('.sound-icon').textContent = '🔊';
                startAmbience();
            } else {
                soundToggle.classList.remove('playing');
                soundToggle.querySelector('.sound-icon').textContent = '🔈';
                stopAmbience();
            }
        });
    }


    // --- 2. Lightbox Modal Functionality ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // Collect all zoomable image sources
    let activeImages = [];
    let currentIndex = 0;

    function buildActiveImageList() {
        // Collect images from the currently visible gallery elements or timeline
        const galleryItems = Array.from(document.querySelectorAll('.gallery-item'))
            .filter(item => item.style.display !== 'none');
        
        // map elements to object list
        activeImages = galleryItems.map(item => ({
            src: item.getAttribute('data-src'),
            caption: item.querySelector('h4').textContent
        }));
    }

    function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // block scroll
        
        // Find index in current active images
        currentIndex = activeImages.findIndex(img => img.src === src);
        
        // If not in gallery (e.g. from timeline), add it temporarily
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

    // Attach timeline click events
    document.querySelectorAll('.lightbox-trigger').forEach(img => {
        img.addEventListener('click', (e) => {
            const src = e.target.getAttribute('src');
            const caption = e.target.getAttribute('data-caption');
            activeImages = []; // reset so timeline click works stand-alone
            openLightbox(src, caption);
        });
    });

    // Attach gallery click events
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            buildActiveImageList();
            const src = item.getAttribute('data-src');
            const caption = item.querySelector('h4').textContent;
            openLightbox(src, caption);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Click outside modal content to close
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


    // --- 3. Filterable Photo Gallery ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    // Trigger fade in animation
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });


    // --- 4. Interactive Elevation Dashboard ---
    const slider = document.getElementById('elevationSlider');
    const cpLabel = document.getElementById('cpLabel');
    const cpHeight = document.getElementById('cpHeight');
    const cpGrade = document.getElementById('cpGrade');
    const graphBars = document.querySelectorAll('.graph-bar');

    // Checklist elements
    const progressText = document.getElementById('packProgressText');
    const progressBar = document.getElementById('packProgressBar');
    const checkboxes = document.querySelectorAll('.checklist-item input');

    // Dashboard slider mapping
    function updateDashboard(val) {
        let name = "Sipit Base";
        let height = "150m";
        let grade = "12% Slope";
        let barIndex = 0;

        if (val < 20) {
            name = "Sto. Tomas Base (Batangas)";
            height = "150m";
            grade = "12% Slope";
            barIndex = 0;
        } else if (val >= 20 && val < 40) {
            name = "Forest Canopy Station";
            height = "450m";
            grade = "25% Slope";
            barIndex = 1;
        } else if (val >= 40 && val < 55) {
            name = "Mudspring sulfuric vent";
            height = "320m";
            grade = "8% Slope";
            barIndex = 2;
        } else if (val >= 55 && val < 75) {
            name = "Peak 2 Rappelling walls";
            height = "890m";
            grade = "55% Steep Slope";
            barIndex = 4;
        } else if (val >= 75 && val < 90) {
            name = "Peak 2 Summit Peak";
            height = "1109m";
            grade = "65% Extreme Cliff";
            barIndex = 3;
        } else {
            name = "UPLB exit base (Laguna)";
            height = "100m";
            grade = "-15% Descent Path";
            barIndex = 6;
        }

        cpLabel.textContent = name;
        cpHeight.textContent = height;
        cpGrade.textContent = grade;

        // Toggle active styling on graph bars
        graphBars.forEach((bar, index) => {
            if (index === barIndex) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    slider.addEventListener('input', (e) => {
        updateDashboard(parseInt(e.target.value));
    });

    // Initialize dashboard values
    updateDashboard(parseInt(slider.value));


    // --- 5. Interactive Packing Checklist ---
    function updateChecklistProgress() {
        const total = checkboxes.length;
        const packed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const percentage = Math.round((packed / total) * 100);

        progressText.textContent = `${packed} of ${total} items packed`;
        progressBar.style.width = `${percentage}%`;
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateChecklistProgress);
    });

    // Initialize checklist progress
    updateChecklistProgress();
});
