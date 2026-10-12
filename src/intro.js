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
        #intro-overlay.editing .intro-text {
            pointer-events: auto;
            touch-action: none;
            cursor: move;
            outline: 1px dashed #e7c48c;
        }
        #intro-overlay.editing .editor-selected { outline: 1px solid #fff5c9; }
        #intro-editor {
            position: fixed;
            z-index: 10;
            top: 12px;
            right: 12px;
            width: min(270px, calc(100vw - 48px));
            max-height: calc(100vh - 48px);
            overflow-y: auto;
            padding: 12px;
            border: 1px solid #9c745c;
            border-radius: 8px;
            background: #211825f5;
            color: #fff0dc;
            font: 13px/1.3 system-ui, sans-serif;
            box-shadow: 0 4px 20px #0008;
        }
        #intro-editor[hidden], #intro-editor textarea[hidden] { display: none; }
        #intro-editor h2 { margin: 0; font-size: 16px; }
        #intro-editor p { margin: 8px 0; }
        #intro-editor label { display: grid; gap: 3px; margin: 7px 0; }
        #intro-editor input, #intro-editor textarea, #intro-editor select {
            box-sizing: border-box;
            width: 100%;
            min-width: 0;
            padding: 4px;
            border: 1px solid #8e7368;
            border-radius: 3px;
            background: #fff3df;
            color: #211825;
            font: inherit;
            -webkit-user-select: text;
            user-select: text;
            -webkit-touch-callout: default;
        }
        #intro-editor textarea { resize: vertical; }
        .editor-numbers { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px; }
        .editor-actions { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
        #intro-editor button { cursor: pointer; padding: 5px 8px; }
    `;
    document.head.appendChild(style);
}

export function createIntro(onPlay) {
    const overlay = document.createElement('section');
    overlay.id = 'intro-overlay';
    overlay.setAttribute('aria-labelledby', 'intro-title');
    const title = document.createElement('h1');
    title.id = 'intro-title';
    const story = document.createElement('p');
    story.className = 'story';
    const rules = document.createElement('p');
    rules.className = 'rules';
    const playLabel = document.createElement('span');
    playLabel.className = 'play-label';
    playLabel.setAttribute('aria-hidden', 'true');
    const play = document.createElement('button');
    play.type = 'button';
    let editing = false;
    let started = false;
    play.addEventListener('click', () => {
        if (editing || started) { return; }
        started = true;
        play.disabled = true;
        onPlay();
    });
    overlay.append(title, story, rules, play, playLabel);
    document.body.appendChild(overlay);
    const blocks = { title, story, rules, play: playLabel };
    const layout = structuredClone(introTextDefaults);
    const apply = () => {
        for (const [key, node] of Object.entries(blocks)) {
            const block = layout[key];
            node.classList.add('intro-text');
            node.textContent = block.text;
            Object.assign(node.style, {
                left: `${block.x}px`, top: `${block.y}px`, width: `${block.width}px`,
                fontSize: `${block.size}px`, lineHeight: `${block.lineHeight}px`,
                fontFamily: block.font === 'gothic' ? '"Booth Gothic", serif' : '"Booth Pixel", sans-serif',
                fontWeight: '400', textAlign: block.align
            });
        }
        play.setAttribute('aria-label', layout.play.text);
    };
    apply();
    installIntroEditor({
        overlay, blocks, layout, defaults: introTextDefaults, apply,
        canEdit: () => !started,
        setEditing(open) {
            editing = open;
            play.disabled = editing || started;
        }
    });

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
import { installIntroEditor } from './intro-editor.js';

export const introTextDefaults = {
    title: { text: 'How to Play', x: 44, y: 27, width: 220, size: 32, lineHeight: 29, font: 'gothic', align: 'center' },
    story: { text: 'Mix potions to heal\nyour spooky friends.', x: 44, y: 58, width: 220, size: 12, lineHeight: 12, font: 'pixel', align: 'center' },
    rules: { text: 'Hold the vials to mix colors.\nMatch their color.\nTap the cauldron to serve.', x: 44, y: 82, width: 220, size: 12, lineHeight: 11, font: 'pixel', align: 'center' },
    play: { text: 'PLAY', x: 116, y: 117, width: 76, size: 20, lineHeight: 24, font: 'pixel', align: 'center' }
};
