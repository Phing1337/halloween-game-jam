export const introTextDefaults = {
    title: { text: 'How to Play', x: 44, y: 27, width: 220, size: 32, lineHeight: 29, font: 'gothic', align: 'center' },
    body: { text: 'Mix potions to heal your spooky friends. Hold the vials to mix colors. Match their color. Tap the cauldron to serve.', x: 50.5, y: 68.5, width: 193, size: 12, lineHeight: 11, font: 'pixel', align: 'center' },
    play: { text: 'PLAY', x: 116, y: 117, width: 76, size: 20, lineHeight: 24, font: 'pixel', align: 'center' }
};

export function introLayout(width, height, elapsed, exitProgress) {
    const size = Math.min(width, height);
    const fall = Math.max(0, 1 - elapsed / 0.7) ** 3;
    return {
        size,
        x: -5 * size / 300,
        y: -63 * size / 300 + fall * (height / 2 + 68 * size / 300 + 12) + exitProgress * height
    };
}

export function installGameStyles(gothicUrl, pixelUrl) {
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: "Booth Gothic";
            src: url("${gothicUrl}") format("truetype");
            font-style: normal;
            font-weight: 400;
            font-display: swap;
        }
        @font-face {
            font-family: "Booth Pixel";
            src: url("${pixelUrl}") format("truetype");
            font-style: normal;
            font-weight: 400 700;
            font-display: swap;
        }
        html, body, body * {
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
        }
        #primary { touch-action: none; }
        #intro-overlay {
            position: fixed;
            width: 300px;
            height: 300px;
            transform-origin: top left;
            pointer-events: none;
            color: #422613;
            text-align: center;
            font-family: system-ui, sans-serif;
        }
        #intro-overlay .intro-text {
            position: absolute;
            margin: 0;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            pointer-events: none;
        }
        #intro-overlay button {
            position: absolute;
            left: 116px;
            top: 117px;
            width: 76px;
            height: 24px;
            padding: 0;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: #422613;
            font: bold 16px/24px Georgia, serif;
            cursor: pointer;
            pointer-events: auto;
            touch-action: manipulation;
        }
        #intro-overlay button:hover { background: #ffffff20; }
        #intro-overlay button:focus-visible { outline: 2px solid #422613; }
        #intro-overlay button:disabled { pointer-events: none; }
    `;
    document.head.appendChild(style);
}

export function createIntro(onPlay) {
    const overlay = document.createElement('section');
    overlay.id = 'intro-overlay';
    overlay.setAttribute('aria-labelledby', 'intro-title');
    const title = document.createElement('h1');
    title.id = 'intro-title';
    const body = document.createElement('p');
    body.className = 'body';
    const playLabel = document.createElement('span');
    playLabel.className = 'play-label';
    playLabel.setAttribute('aria-hidden', 'true');
    const play = document.createElement('button');
    play.type = 'button';
    let started = false;
    play.addEventListener('click', () => {
        if (started) { return; }
        started = true;
        play.disabled = true;
        onPlay();
    });
    overlay.append(title, body, play, playLabel);
    document.body.appendChild(overlay);
    const blocks = { title, body, play: playLabel };
    for (const [key, node] of Object.entries(blocks)) {
        const block = introTextDefaults[key];
        node.classList.add('intro-text');
        node.textContent = block.text;
        Object.assign(node.style, {
            left: `${block.x}px`, top: `${block.y}px`, width: `${block.width}px`,
            fontSize: `${block.size}px`, lineHeight: `${block.lineHeight}px`,
            fontFamily: block.font === 'gothic' ? '"Booth Gothic", serif' : '"Booth Pixel", sans-serif',
            fontWeight: '400', textAlign: block.align
        });
    }
    play.setAttribute('aria-label', introTextDefaults.play.text);

    return {
        update(canvas, elapsed, progress) {
            overlay.hidden = progress >= 1;
            if (overlay.hidden) { return; }
            const rect = canvas.getBoundingClientRect();
            const { size, x, y } = introLayout(rect.width, rect.height, elapsed, progress);
            overlay.style.left = `${rect.left + (rect.width - size) / 2 + x}px`;
            overlay.style.top = `${rect.top + (rect.height - size) / 2 - y}px`;
            overlay.style.transform = `scale(${size / 300})`;
        }
    };
}
