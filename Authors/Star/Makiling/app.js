/* Interactive functions for Mt. Makiling Hike Photo Journal */

/* The lightbox lives in an inline <script> at the foot of index.html. */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Interactive Elevation Dashboard ---
    const slider = document.getElementById('elevationSlider');
    const cpLabel = document.getElementById('cpLabel');
    const cpHeight = document.getElementById('cpHeight');
    const cpGrade = document.getElementById('cpGrade');
    const graphBars = document.querySelectorAll('.graph-bar');

    // Checklist elements
    const progressText = document.getElementById('packProgressText');
    const progressBar = document.getElementById('packProgressBar');
    const checkboxes = document.querySelectorAll('.checklist-item input');

    // The traverse in order, west to east. Index i maps to graph bar i, so the
    // lit bar always advances with the slider.
    const CHECKPOINTS = [
        { name: "Sto. Tomas Base (Batangas)", height: "150m",  grade: "12% Slope" },
        { name: "Forest Canopy Station",      height: "450m",  grade: "25% Slope" },
        { name: "Mudspring sulfuric vent",    height: "320m",  grade: "8% Slope" },
        { name: "Peak 2 Rappelling walls",    height: "890m",  grade: "55% Steep Slope" },
        { name: "Peak 2 Summit Peak",         height: "1109m", grade: "65% Extreme Cliff" },
        { name: "UPLB exit base (Laguna)",    height: "100m",  grade: "-15% Descent Path" }
    ];

    // Dashboard slider mapping
    function updateDashboard(val) {
        const span = 100 / CHECKPOINTS.length;
        const index = Math.min(CHECKPOINTS.length - 1, Math.floor(val / span));
        const cp = CHECKPOINTS[index];

        cpLabel.textContent = cp.name;
        cpHeight.textContent = cp.height;
        cpGrade.textContent = cp.grade;

        // Toggle active styling on graph bars
        graphBars.forEach((bar, i) => {
            bar.classList.toggle('active', i === index);
        });
    }

    slider.addEventListener('input', (e) => {
        updateDashboard(parseInt(e.target.value));
    });

    // Initialize dashboard values
    updateDashboard(parseInt(slider.value));


    // --- 2. Interactive Packing Checklist ---
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
