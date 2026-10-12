import assert from 'node:assert/strict';
import test from 'node:test';
import { Color } from '../src/color.js';
import { palette } from '../src/palette.js';
import { Cauldron, Customer, Potion } from '../src/state.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const [red, yellow, blue] = palette().primaries;

test('primary pairs produce orange, green, and purple', () => {
    for (const [a, b, hue] of [[red, yellow, 30], [yellow, blue, 120], [red, blue, 300]]) {
        near(a.mix(b, 0.5).h, hue);
        near(b.mix(a, 0.5).h, hue);
    }
});

test('recipes are independent of order and frame-sized pours', () => {
    const recipe = [[red, 0.2], [yellow, 0.3], [blue, 0.1]];
    const brew = (order, chunks) => {
        const cauldron = new Cauldron();
        for (const [color, amount] of order) {
            for (let i = 0; i < chunks; i++) {
                cauldron.add(color, amount / chunks);
            }
        }
        return cauldron.color;
    };
    const expected = brew(recipe, 1);
    for (const order of [recipe, [...recipe].reverse(), [recipe[1], recipe[0], recipe[2]]]) {
        for (const chunks of [1, 30, 120]) {
            const actual = brew(order, chunks);
            near(actual.h, expected.h);
            near(actual.s, expected.s);
            near(actual.v, expected.v);
        }
    }
});

test('customer matching wraps hue and rejects wrong colors and empty brews', () => {
    const target = new Color(0, 1, 1);
    const customer = new Customer('ghost',
        new Potion(new Color(-15, 0.85, 0.85), 0),
        new Potion(target, 0.5),
        new Potion(new Color(15, 1.15, 1.15), 1));
    assert.ok(customer.satisfied_with_potion(new Potion(new Color(355, 1, 1), 0.5)));
    assert.ok(!customer.satisfied_with_potion(new Potion(yellow, 0.5)));
    assert.ok(!customer.satisfied_with_potion(new Potion(new Color(0, 0.2, 1), 0.5)));
    assert.ok(!customer.satisfied_with_potion(new Potion(target, 0)));
    assert.ok(!customer.satisfied_with_potion(new Potion(target, 1.1)));
});

test('secondary and tertiary requests have primary-vial recipes', () => {
    const colors = palette();
    let index = 0;
    for (let i = 0; i < colors.primaries.length; i++) {
        const a = colors.primaries[i];
        const b = colors.primaries[(i + 1) % colors.primaries.length];
        near(a.mix(b, 0.5).h, colors.secondaries[i].h);
        for (const ratio of [1 / 3, 2 / 3]) {
            near(a.mix(b, ratio).h, colors.tertiaries[index++].h);
        }
    }
});

test('desaturated colors include the HSV brightness offset', () => {
    assert.deepEqual(new Color(0, 0, 0.5).RGB, [0.5, 0.5, 0.5]);
});
