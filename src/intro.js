export function introLayout(width, height, elapsed, exitProgress) {
    const size = Math.min(width, height);
    const fall = Math.max(0, 1 - elapsed / 0.7) ** 3;
    return {
        size,
        x: -5 * size / 300,
        y: -63 * size / 300 + fall * (height / 2 + 68 * size / 300 + 12) + exitProgress * height
    };
}

export function installGameStyles(fontUrl) {
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: "Booth Gothic";
            src: url("${fontUrl}") format("truetype");
            font-style: normal;
            font-weight: 700;
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
        #intro-overlay h1, #intro-overlay p {
            position: absolute;
            left: 44px;
            width: 220px;
            margin: 0;
        }
        #intro-overlay h1 {
            top: 27px;
            font: bold 28px/29px "Booth Gothic", Georgia, serif;
        }
        #intro-overlay .story {
            top: 58px;
            font-size: 12px;
            line-height: 12px;
        }
        #intro-overlay .rules {
            top: 82px;
            font-size: 11px;
            line-height: 11px;
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
    title.textContent = 'How to Play';
    const story = document.createElement('p');
    story.className = 'story';
    story.append('Mix potions to heal', document.createElement('br'), 'your spooky friends.');
    const rules = document.createElement('p');
    rules.className = 'rules';
    rules.append(
        'Hold the vials to mix colors.', document.createElement('br'),
        'Match their color.', document.createElement('br'),
        'Tap the cauldron to serve.'
    );
    const play = document.createElement('button');
    play.type = 'button';
    play.textContent = 'PLAY';
    play.addEventListener('click', () => {
        play.disabled = true;
        onPlay();
    });
    overlay.append(title, story, rules, play);
    document.body.appendChild(overlay);

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
