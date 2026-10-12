export function installIntroEditor({ overlay, blocks, layout, defaults, apply, setEditing, canEdit }) {
    const panel = document.createElement('aside');
    panel.id = 'intro-editor';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Placard text editor');
    const heading = document.createElement('h2');
    heading.textContent = 'Placard editor';
    const hint = document.createElement('p');
    hint.textContent = 'Drag text on the placard, or use these controls. D toggles the editor. Copy your layout before leaving.';
    const section = document.createElement('select');
    section.id = 'editor-block';
    for (const [key, name] of Object.entries({ title: 'Heading', story: 'Story', rules: 'Instructions', play: 'Play label' })) {
        section.add(new Option(name, key));
    }
    const field = (name, input) => {
        const label = document.createElement('label');
        label.append(name, input);
        panel.appendChild(label);
    };
    panel.append(heading, hint);
    field('Text block', section);
    const text = document.createElement('textarea');
    text.id = 'editor-text';
    text.rows = 3;
    field('Text (Enter makes a new line)', text);
    const font = document.createElement('select');
    font.id = 'editor-font';
    font.add(new Option('Gothic pixel - Jacquard 12', 'gothic'));
    font.add(new Option('Readable pixel - Pixelify Sans', 'pixel'));
    field('Font', font);
    const inputs = {};
    const numbers = document.createElement('div');
    numbers.className = 'editor-numbers';
    const status = document.createElement('p');
    status.id = 'editor-status';
    status.setAttribute('role', 'status');
    for (const [key, name, min, max] of [
        ['x', 'X', -100, 300], ['y', 'Y', -100, 300],
        ['width', 'Width', 8, 300], ['size', 'Font size', 4, 72],
        ['lineHeight', 'Line spacing', 4, 80]
    ]) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.id = `editor-${key}`;
        input.type = 'number';
        input.min = min;
        input.max = max;
        input.step = 0.5;
        input.required = true;
        input.addEventListener('input', () => {
            if (!input.checkValidity()) {
                status.textContent = `${name} must be between ${min} and ${max}.`;
                return;
            }
            layout[section.value][key] = input.valueAsNumber;
            changed();
        });
        inputs[key] = input;
        label.append(name, input);
        numbers.appendChild(label);
    }
    panel.appendChild(numbers);
    const align = document.createElement('select');
    align.id = 'editor-align';
    for (const value of ['left', 'center', 'right']) { align.add(new Option(value, value)); }
    field('Alignment', align);
    const output = document.createElement('textarea');
    output.id = 'editor-output';
    output.readOnly = true;
    output.rows = 5;
    output.setAttribute('aria-label', 'Layout details to send back');
    output.hidden = true;
    const exportLayout = () => JSON.stringify({
        version: 1,
        units: 'Pixels on the original 300 by 300 placard canvas',
        fonts: { gothic: 'Jacquard 12', pixel: 'Pixelify Sans' },
        blocks: layout
    }, null, 2);
    const changed = () => {
        apply();
        status.textContent = 'Updated. Toggle D to preview without outlines.';
        if (!output.hidden) { output.value = exportLayout(); }
    };
    const refresh = () => {
        const block = layout[section.value];
        text.value = block.text;
        font.value = block.font;
        align.value = block.align;
        for (const [key, input] of Object.entries(inputs)) { input.value = block[key]; }
        for (const [key, node] of Object.entries(blocks)) {
            node.classList.toggle('editor-selected', key === section.value);
        }
    };
    section.addEventListener('change', refresh);
    for (const [input, key] of [[text, 'text'], [font, 'font'], [align, 'align']]) {
        input.addEventListener('input', () => {
            layout[section.value][key] = input.value;
            changed();
        });
    }
    const actions = document.createElement('div');
    actions.className = 'editor-actions';
    const copy = document.createElement('button');
    copy.id = 'editor-copy';
    copy.type = 'button';
    copy.textContent = 'Copy layout';
    copy.addEventListener('click', async () => {
        output.hidden = false;
        output.value = exportLayout();
        output.focus();
        output.select();
        if (!navigator.clipboard) {
            status.textContent = 'Clipboard unavailable. Copy the selected layout below.';
            return;
        }
        try {
            await navigator.clipboard.writeText(output.value);
            status.textContent = 'Layout copied. Paste it into our chat.';
        } catch (error) {
            console.error('Unable to copy placard layout:', error);
            status.textContent = 'Clipboard blocked. Copy the selected layout below.';
        }
    });
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'Reset';
    reset.addEventListener('click', () => {
        Object.assign(layout, structuredClone(defaults));
        changed();
        refresh();
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close / preview';
    close.addEventListener('click', () => toggle(false));
    actions.append(copy, reset, close);
    panel.append(actions, output, status);
    document.body.appendChild(panel);
    const toggle = open => {
        panel.hidden = !open;
        overlay.classList.toggle('editing', open);
        setEditing(open);
        if (open) { refresh(); }
        else if (panel.contains(document.activeElement)) { document.activeElement.blur(); }
    };
    window.addEventListener('keydown', event => {
        if (event.key.toLowerCase() !== 'd' || event.repeat || event.ctrlKey || event.metaKey || event.altKey) { return; }
        if (event.target.closest('input, textarea, select, [contenteditable]') || overlay.hidden || !canEdit()) { return; }
        event.preventDefault();
        toggle(panel.hidden);
    });
    for (const [key, node] of Object.entries(blocks)) {
        let drag = null;
        node.addEventListener('pointerdown', event => {
            if (panel.hidden || event.button !== 0) { return; }
            event.preventDefault();
            section.value = key;
            refresh();
            drag = {
                pointer: event.pointerId,
                x: event.clientX, y: event.clientY,
                startX: layout[key].x, startY: layout[key].y,
                scale: overlay.getBoundingClientRect().width / 300
            };
            node.setPointerCapture(event.pointerId);
        });
        node.addEventListener('pointermove', event => {
            if (panel.hidden) { drag = null; return; }
            if (!drag || event.pointerId !== drag.pointer) { return; }
            const coordinate = (start, delta) => Math.max(-100, Math.min(300, Math.round((start + delta / drag.scale) * 2) / 2));
            layout[key].x = coordinate(drag.startX, event.clientX - drag.x);
            layout[key].y = coordinate(drag.startY, event.clientY - drag.y);
            changed();
            refresh();
        });
        const endDrag = () => { drag = null; };
        node.addEventListener('pointerup', endDrag);
        node.addEventListener('pointercancel', endDrag);
        node.addEventListener('lostpointercapture', endDrag);
    }
}
