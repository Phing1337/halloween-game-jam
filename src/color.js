const hue_stops = [
	[0, 0], [60, 30], [120, 60], [180, 120],
	[240, 240], [300, 300], [360, 360]
];

function map_hue(hue, from, to)
{
	for (let i = 1; i < hue_stops.length; i++) {
		if (hue <= hue_stops[i][from]) {
			const a = hue_stops[i - 1], b = hue_stops[i];
			const t = (hue - a[from]) / (b[from] - a[from]);
			return a[to] + t * (b[to] - a[to]);
		}
	}
	return 0;
}

class Color
{
	constructor(h, s, v)
	{
		this.h = ((h % 360) + 360) % 360;
		this.s = s;
		this.v = v;
		const angle = map_hue(this.h, 1, 0) * Math.PI / 180;
		this._mix_x = Math.cos(angle);
		this._mix_y = Math.sin(angle);
		this._mix_s = s;
	}

	mix(other, t)
	{
		// Keep weighted pigment vectors so repeated pours don't change the recipe.
		const x = this._mix_x * (1 - t) + other._mix_x * t;
		const y = this._mix_y * (1 - t) + other._mix_y * t;
		const magnitude = Math.hypot(x, y);
		const hue = magnitude < 1e-8 ? 0 :
			((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
		const s = this._mix_s * (1 - t) + other._mix_s * t;
		const v = this.v * (1 - t) + other.v * t;
		const result = new Color(map_hue(hue, 0, 1), s * Math.min(1, magnitude * 2), v);
		result._mix_x = x;
		result._mix_y = y;
		result._mix_s = s;
		return result;
	}

	distance_to(other)
	{
		var h_o = [
			other.h - 360,
			other.h,
			other.h + 360,
		];

		var distances = h_o.map(h => Math.abs(h - this.h));
		var minIndex = distances.indexOf(Math.min(...distances));
		h_o = h_o[minIndex];

		const dh = h_o - this.h;
		const ds = other.s - this.s;
		const dv = other.v - this.v;

		return { dh: dh, ds: ds, dv: dv };
	}

	get RGB()
	{
		let c = this.v * this.s;
		let h_prime = parseInt(this.h / 60);

		let x = c * (1 - Math.abs((this.h / 60) % 2 - 1));
		let m = this.v - c;

		// const h_prime_in_range = h_prime >= 0 && h_prime <= 5;
		// if (!h_prime_in_range) {
		// 	debugger;
		// }
		// console.assert(h_prime_in_range, `h_prime is out of range: ${h_prime}`);

		return [
			[c, x, 0],
			[x, c, 0],
			[0, c, x],
			[0, x, c],
			[x, 0, c],
			[c, 0, x]
		][h_prime].map(channel => channel + m);
	}
}

export { Color };