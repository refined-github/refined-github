export function lerp(min: number, max: number, t: number): number {
	return min + ((max - min) * t);
}

export function invlerp(min: number, max: number, x: number): number {
	return (x - min) / (max - min);
}

export function calculateMinMax(values: number[]): {min: number; max: number} {
	return {
		min: Math.min(...values),
		max: Math.max(...values),
	};
}

export function createHeatIndexFunc(values: number[]): (value: number) => number {
	const steps = 10; // GH has 10 heat colors
	const {min, max} = calculateMinMax(values);

	return (value: number) => {
		// Inverse lerp figures out how far the value is between min & max
		const interp = invlerp(min, max, value);

		// Higher heat values have a lower index, 1 is highest and 10 lowest.
		// This maps the [0.0, 1.0] value to [10, 1].
		const floored = Math.floor(interp * steps);
		const heatIndex = Math.max(1, steps - floored);

		return heatIndex;
	};
}
