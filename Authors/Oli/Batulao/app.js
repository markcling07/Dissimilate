/* Interactive functions for Oli's Mt. Batulao Traverse Photo Journal */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Audio Ambience Synthesizer (Web Audio API) ---
    let audioCtx = null;
    let windNode = null;
    let windFilter = null;
    let mainGain = null;
    let isPlaying = false;
    let windModTimer = null;

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
        mainGain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 2.0); // smooth fade in
        mainGain.connect(audioCtx.destination);

        // Wind Source
        const noiseBuffer = createNoiseBuffer();
        windNode = audioCtx.createBufferSource();
        windNode.buffer = noiseBuffer;
        windNode.loop = true;

        // Wind Filter (creates the open-ridge wind feel)
        windFilter = audioCtx.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.frequency.setValueAtTime(350, audioCtx.currentTime);
        windFilter.Q.setValueAtTime(1.5, audioCtx.currentTime);

        windNode.connect(windFilter);
        windFilter.connect(mainGain);
        windNode.start(0);

        // Slow wind modulation
        modulateWind();
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
                clearTimeout(windModTimer);
                windNode = null;
                windFilter = null;
                mainGain = null;
            }, 1600);
        } else {
            clearTimeout(windModTimer);
        }
    }

    function modulateWind() {
        if (!isPlaying || !windFilter) return;
        
        // Randomly modulate wind filter frequency to simulate dry, gusty ridge winds
        const targetFreq = 250 + Math.random() * 550;
        const speed = 1.5 + Math.random() * 3.5;
        
        if (windFilter && audioCtx) {
            windFilter.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + speed);
        }
        
        windModTimer = setTimeout(modulateWind, speed * 1000);
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
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    // Collect all zoomable image sources
    let activeImages = [];
    let currentIndex = 0;

    function buildActiveImageList() {
        // Collect all lightbox trigger images in document order
        const triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
        
        activeImages = triggers.map(img => ({
            src: img.getAttribute('src'),
            caption: img.getAttribute('data-caption') || img.getAttribute('alt')
        }));
    }

    function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // block scroll
        
        // Find index in current active images
        currentIndex = activeImages.findIndex(img => img.src === src);
        
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

    // Attach click events to triggers
    document.querySelectorAll('.lightbox-trigger').forEach(img => {
        img.addEventListener('click', (e) => {
            buildActiveImageList();
            const src = e.target.getAttribute('src');
            const caption = e.target.getAttribute('data-caption') || e.target.getAttribute('alt');
            openLightbox(src, caption);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    // Click outside modal content to close
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        }
    });


    // --- 3. Interactive Elevation Dashboard ---
    const slider = document.getElementById('elevationSlider');
    const cpLabel = document.getElementById('cpLabel');
    const cpHeight = document.getElementById('cpHeight');
    const cpGrade = document.getElementById('cpGrade');
    const graphBars = document.querySelectorAll('.graph-bar');

    // Dashboard slider mapping for Mt. Batulao
    function updateDashboard(val) {
        let name = "KC Hill Trailhead";
        let height = "200m";
        let grade = "15% Moderate Slope";
        let barIndex = 0;

        if (val < 20) {
            name = "Sto. Tomas Base (Batangas)";
            height = "200m";
            grade = "15% Moderate Slope";
            barIndex = 0;
        } else if (val >= 20 && val < 40) {
            name = "Camp 1 Grasslands";
            height = "380m";
            grade = "25% Rolling Ridge";
            barIndex = 1;
        } else if (val >= 40 && val < 60) {
            name = "Old Trail Ridge & Forest";
            height = "520m";
            grade = "35% Exposed Dirt";
            barIndex = 2;
        } else if (val >= 60 && val < 80) {
            name = "Peak 8 Rocky Scrambles";
            height = "680m";
            grade = "45% Vertical Scramble";
            barIndex = 4;
        } else if (val >= 80 && val < 92) {
            name = "Summit Peak (811 MASL)";
            height = "811m";
            grade = "55% Extreme Ridge";
            barIndex = 3;
        } else {
            name = "New Trail Descent Exit";
            height = "200m";
            grade = "-20% Loose Gravel";
            barIndex = 6;
        }

        if (cpLabel) cpLabel.textContent = name;
        if (cpHeight) cpHeight.textContent = height;
        if (cpGrade) cpGrade.textContent = grade;

        // Toggle active styling on graph bars
        graphBars.forEach((bar, index) => {
            if (index === barIndex) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    if (slider) {
        slider.addEventListener('input', (e) => {
            updateDashboard(parseInt(e.target.value));
        });
        
        // Initialize dashboard values
        updateDashboard(parseInt(slider.value));
    }


    // --- 4. Interactive Packing Checklist ---
    const progressText = document.getElementById('packProgressText');
    const progressBar = document.getElementById('packProgressBar');
    const checkboxes = document.querySelectorAll('.checklist-item input');

    function updateChecklistProgress() {
        const total = checkboxes.length;
        if (total === 0) return;
        const packed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const percentage = Math.round((packed / total) * 100);

        if (progressText) progressText.textContent = `${packed} of ${total} items packed`;
        if (progressBar) progressBar.style.width = `${percentage}%`;
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateChecklistProgress);
    });

    // Initialize checklist progress
    updateChecklistProgress();
});
