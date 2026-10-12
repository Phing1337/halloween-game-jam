import assert from 'node:assert/strict';
import test from 'node:test';
import { introLayout, introTextDefaults } from '../src/intro.js';

test('the single body block uses the finalized text layout', () => {
    assert.deepEqual(Object.keys(introTextDefaults), ['title', 'body', 'play']);
    assert.deepEqual(introTextDefaults.body, {
        text: 'Mix potions to heal your spooky friends. Hold the vials to mix colors. Match their color. Tap the cauldron to serve.',
        x: 50.5, y: 68.5, width: 193, size: 12, lineHeight: 11,
        font: 'pixel', align: 'center'
    });
});

test('the placard falls from above the viewport without bouncing', () => {
    for (const [width, height] of [[750, 450], [375, 667], [1024, 768]]) {
        const initial = introLayout(width, height, 0, 0);
        const placardBottom = (height - initial.size) / 2 - initial.y + 155 * initial.size / 300;
        assert.ok(placardBottom < 0);
        let previous = initial.y;
        const settled = introLayout(width, height, 0.7, 0);
        for (const elapsed of [0.1, 0.2, 0.3, 0.5, 0.7, 1, 2]) {
            const current = introLayout(width, height, elapsed, 0);
            assert.ok(current.y <= previous);
            assert.ok(current.y >= settled.y);
            previous = current.y;
        }
    }
});

test('the visible placard settles in the center, including portrait screens', () => {
    for (const [width, height] of [[750, 450], [375, 667], [1024, 768]]) {
        const { size, x, y } = introLayout(width, height, 1, 0);
        assert.equal(size, Math.min(width, height));
        const centerX = (width - size) / 2 + x + 155 * size / 300;
        const centerY = (height - size) / 2 - y + 87 * size / 300;
        assert.ok(Math.abs(centerX - width / 2) < 1e-7);
        assert.ok(Math.abs(centerY - height / 2) < 1e-7);
        const exiting = introLayout(width, height, 1, 1);
        assert.equal(exiting.y - y, height);
    }
});
