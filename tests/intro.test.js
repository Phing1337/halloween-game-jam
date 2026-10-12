import assert from 'node:assert/strict';
import test from 'node:test';
import { introLayout, introTextDefaults } from '../src/intro.js';

test('story and instructions share one configurable body block above Play', () => {
    assert.deepEqual(Object.keys(introTextDefaults), ['title', 'body', 'play']);
    const { body, play } = introTextDefaults;
    assert.match(body.text, /Mix potions to heal/);
    assert.match(body.text, /Tap the cauldron to serve/);
    assert.ok(body.y + body.text.split('\n').length * body.lineHeight < play.y);
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
