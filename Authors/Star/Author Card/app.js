/* Star's Author Profile Cards JS */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. MINIMALIST DRAWER ACTIONS ---
    window.toggleMinimalistDrawer = function(btn) {
        const drawer = btn.closest('.card-minimalist').querySelector('.minimalist-drawer');
        drawer.classList.add('active');
    };

    window.closeMinimalistDrawer = function(btn) {
        const drawer = btn.closest('.card-minimalist').querySelector('.minimalist-drawer');
        drawer.classList.remove('active');
    };

    // --- 2. FOREST AUDIO CHIRP ACTIONS (Web Audio API Synthesizer) ---
    let audioCtx = null;
    window.playForestChirp = function(btn) {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Visual pulse effect
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 500);

        const now = audioCtx.currentTime;
        
        // 1. Warm Forest Breeze Pad
        const oscillatorPad = audioCtx.createOscillator();
        const padGain = audioCtx.createGain();
        oscillatorPad.type = 'triangle';
        oscillatorPad.frequency.setValueAtTime(220, now); // A3
        oscillatorPad.frequency.exponentialRampToValueAtTime(330, now + 1.2); // E4
        
        padGain.gain.setValueAtTime(0, now);
        padGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        padGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        
        oscillatorPad.connect(padGain);
        padGain.connect(audioCtx.destination);
        oscillatorPad.start(now);
        oscillatorPad.stop(now + 1.8);

        // 2. Forest Bird Chime
        const chimeOsc = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(1500, now + 0.15);
        chimeOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.25);
        chimeOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

        chimeGain.gain.setValueAtTime(0, now + 0.15);
        chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.18);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(audioCtx.destination);
        chimeOsc.start(now + 0.15);
        chimeOsc.stop(now + 0.5);

        // Double chirp follow-up
        setTimeout(() => {
            if (!audioCtx) return;
            const chimeOsc2 = audioCtx.createOscillator();
            const chimeGain2 = audioCtx.createGain();
            chimeOsc2.type = 'sine';
            chimeOsc2.frequency.setValueAtTime(1800, audioCtx.currentTime);
            chimeOsc2.frequency.exponentialRampToValueAtTime(2400, audioCtx.currentTime + 0.08);
            chimeOsc2.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.2);

            chimeGain2.gain.setValueAtTime(0, audioCtx.currentTime);
            chimeGain2.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.03);
            chimeGain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.22);

            chimeOsc2.connect(chimeGain2);
            chimeGain2.connect(audioCtx.destination);
            chimeOsc2.start(audioCtx.currentTime);
            chimeOsc2.stop(audioCtx.currentTime + 0.25);
        }, 220);
    };
});
