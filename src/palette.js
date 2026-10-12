import { Color } from '../src/color.js';

let g_palette = {
	primaries: [
		new Color(0, 1, 1),   // red
		new Color(60, 1, 1),  // yellow
		new Color(240, 1, 1)  // blue
	],
	secondaries: [],
	tertiaries: []
};

export function palette()
{
	if (g_palette.secondaries.length == 0) {
		for (let i = 0; i < g_palette.primaries.length; i++) {
			const a = g_palette.primaries[i];
			const b = g_palette.primaries[(i + 1) % g_palette.primaries.length];
			g_palette.secondaries.push(a.mix(b, 0.5));
			g_palette.tertiaries.push(a.mix(b, 1 / 3), a.mix(b, 2 / 3));
		}
	}

	return g_palette;
}