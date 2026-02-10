document.addEventListener('DOMContentLoaded', () => {
    // Shared Logic
    console.log('UI/UX Studio: Initialized');

    // Index Page Interaction (if present)
    const toggle = document.getElementById('design-toggle');
    if (toggle) {
        initIndexComparison(toggle);
    }
});

// --- Module: Index Page (Good vs Bad) ---
function initIndexComparison(toggle) {
    const previewCard = document.getElementById('ui-preview');
    const labels = document.querySelectorAll('.toggle-label');
    const analysisList = document.getElementById('analysis-list');

    const goodPoints = [
        "十分な余白（ホワイトスペース）による視線の誘導",
        "階層化されたタイポグラフィ（見出しと本文のコントラスト）",
        "一貫した配色とアクセントカラーの使用",
        "入力フォームの明確なラベルとプレースホルダー",
        "プライマリーアクションボタンの強調"
    ];

    const badPoints = [
        "色が多すぎて視線が散らばる（色の乱用）",
        "フォントが見づらく、階層構造がない",
        "余白がなく、要素が密集している（圧迫感）",
        "入力フィールドとボタンのデザインが一貫していない",
        "コントラスト比が低く、可読性が悪い"
    ];

    function updateState() {
        if (toggle.checked) {
            previewCard.className = 'ui-preview-card good';
            labels[0].classList.remove('active');
            labels[1].classList.add('active');
            renderAnalysis(goodPoints);
        } else {
            previewCard.className = 'ui-preview-card bad';
            labels[0].classList.add('active');
            labels[1].classList.remove('active');
            renderAnalysis(badPoints);
        }
    }

    function renderAnalysis(points) {
        analysisList.innerHTML = '';
        points.forEach((point, index) => {
            const li = document.createElement('li');
            li.style.opacity = '0';
            li.style.transform = 'translateX(20px)';
            li.textContent = point;
            analysisList.appendChild(li);
            setTimeout(() => {
                li.style.transition = 'all 0.5s ease';
                li.style.opacity = '1';
                li.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }

    toggle.addEventListener('change', updateState);
    toggle.checked = false; // Default to Bad
    updateState();
}

// --- Module: Color Tool ---
function initColorTool() {
    const primaryInput = document.getElementById('primary-color');
    const hexValue = document.getElementById('hex-value');

    const swatches = {
        primary: document.getElementById('color-primary'),
        light: document.getElementById('color-light'),
        dark: document.getElementById('color-dark'),
        accent: document.getElementById('color-accent')
    };

    const codes = {
        primary: document.getElementById('code-primary'),
        light: document.getElementById('code-light'),
        dark: document.getElementById('code-dark'),
        accent: document.getElementById('code-accent')
    };

    const mockup = document.getElementById('mockup');

    function updateColors(hex) {
        const rgb = hexToRgb(hex);
        if (!rgb) return;
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        const primary = `hsl(${Math.round(hsl.h * 360)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;
        const light = `hsl(${Math.round(hsl.h * 360)}, ${Math.round(hsl.s * 100) * 0.2}%, 96%)`;
        const dark = `hsl(${Math.round(hsl.h * 360)}, 20%, 20%)`;
        const accentH = (hsl.h + 0.5) % 1;
        const accent = `hsl(${Math.round(accentH * 360)}, 80%, 60%)`;

        swatches.primary.style.backgroundColor = primary;
        swatches.light.style.backgroundColor = light;
        swatches.dark.style.backgroundColor = dark;
        swatches.accent.style.backgroundColor = accent;

        codes.primary.textContent = primary;
        codes.light.textContent = light;
        codes.dark.textContent = dark;
        codes.accent.textContent = accent;

        mockup.style.setProperty('--primary', primary);
        mockup.style.setProperty('--bg-light', light);
        mockup.style.setProperty('--text-primary', dark);
        mockup.style.setProperty('--accent', accent);
    }

    primaryInput.addEventListener('input', (e) => {
        hexValue.textContent = e.target.value;
        updateColors(e.target.value);
    });

    updateColors(primaryInput.value);
}

// --- Module: Typography Tool ---
function initTypeTool() {
    const baseInput = document.getElementById('base-size');
    const ratioInput = document.getElementById('scale-ratio');
    const fontSelect = document.getElementById('font-pair');
    const baseValDisplay = document.getElementById('base-val');
    const preview = document.getElementById('type-preview');

    const els = {
        h1: document.querySelector('.h1'),
        h2: document.querySelector('.h2'),
        h3: document.querySelector('.h3'),
        body: document.querySelector('.body-text'),
        sH1: document.getElementById('s-h1'),
        sH2: document.getElementById('s-h2'),
        sH3: document.getElementById('s-h3'),
        sBody: document.getElementById('s-body')
    };

    function updateType() {
        const base = parseInt(baseInput.value);
        const ratio = parseFloat(ratioInput.value);
        const pair = fontSelect.value;

        baseValDisplay.textContent = base + 'px';

        const sBody = base;
        const sH3 = base * Math.pow(ratio, 2);
        const sH2 = base * Math.pow(ratio, 3);
        const sH1 = base * Math.pow(ratio, 4);

        els.body.style.fontSize = sBody + 'px';
        els.h3.style.fontSize = Math.round(sH3) + 'px';
        els.h2.style.fontSize = Math.round(sH2) + 'px';
        els.h1.style.fontSize = Math.round(sH1) + 'px';

        els.sBody.textContent = Math.round(sBody) + 'px';
        els.sH3.textContent = Math.round(sH3) + 'px';
        els.sH2.textContent = Math.round(sH2) + 'px';
        els.sH1.textContent = Math.round(sH1) + 'px';

        let headerFont, bodyFont;
        switch (pair) {
            case 'modern':
                headerFont = "'Outfit', sans-serif";
                bodyFont = "'Noto Sans JP', sans-serif";
                break;
            case 'classic':
                headerFont = "'Playfair Display', serif";
                bodyFont = "'Noto Sans JP', sans-serif";
                break;
            case 'mono':
                headerFont = "'Roboto Mono', monospace";
                bodyFont = "'Noto Sans JP', sans-serif";
                break;
        }

        preview.querySelectorAll('h1, h2, h3').forEach(el => el.style.fontFamily = headerFont);
        preview.querySelectorAll('p').forEach(el => el.style.fontFamily = bodyFont);
    }

    baseInput.addEventListener('input', updateType);
    ratioInput.addEventListener('change', updateType);
    fontSelect.addEventListener('change', updateType);

    updateType();
}

// --- Module: Layout Tool ---
function initLayoutTool() {
    const toggle8pt = document.getElementById('toggle-grid');
    const toggleCols = document.getElementById('toggle-columns');
    const grid8pt = document.getElementById('grid-8pt');
    const gridCols = document.getElementById('grid-cols');

    toggle8pt.addEventListener('change', () => {
        grid8pt.style.display = toggle8pt.checked ? 'block' : 'none';
    });

    toggleCols.addEventListener('change', () => {
        gridCols.style.display = toggleCols.checked ? 'flex' : 'none';
    });
}

// --- Module: Fitts's Law Game ---
function initFittsTool() {
    const startBtn = document.getElementById('start-fitts');
    const area = document.getElementById('fitts-game-area');
    const statSize = document.getElementById('stat-size');
    const statDist = document.getElementById('stat-dist');
    const statTime = document.getElementById('stat-time');

    let startTime;
    let targetCount = 0;
    const maxTargets = 5;

    startBtn.addEventListener('click', startGame);

    function startGame() {
        targetCount = 0;
        startBtn.style.display = 'none';
        spawnTarget();
    }

    function spawnTarget() {
        if (targetCount >= maxTargets) {
            // End
            startBtn.style.display = 'block';
            startBtn.textContent = 'Restart Experiment';
            return;
        }

        // Random size between 20 and 80
        const size = Math.floor(Math.random() * 60) + 20;

        // Random pos within area
        const maxWidth = area.offsetWidth - size;
        const maxHeight = area.offsetHeight - size;
        const x = Math.floor(Math.random() * maxWidth);
        const y = Math.floor(Math.random() * maxHeight);

        const circle = document.createElement('div');
        circle.className = 'target-circle';
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        circle.textContent = targetCount + 1;

        // Calculate distance from previous click (or center if first)
        // Simplified for demo: just tracking time to hit

        circle.addEventListener('mousedown', (e) => { // mousedown for faster response
            const endTime = Date.now();
            const timeTaken = endTime - startTime;

            circle.remove();
            statSize.textContent = size;
            statTime.textContent = timeTaken;
            statDist.textContent = 'Random'; // Could calculate actual dist

            targetCount++;
            spawnTarget();
        });

        area.appendChild(circle);
        startTime = Date.now();
    }
}

// Util
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0;
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, l };
}
