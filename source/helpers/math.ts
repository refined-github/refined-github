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

export function createHeatFunc(values: number[], steps: number): (value: number) => number {
	steps = Math.max(1, steps);
	const {min, max} = calculateMinMax(values);

	return (value: number) => {
		// Inverse lerp figures out how far the value is between min & max
		const interp = invlerp(min, max, value);

		// Round to nearest step, so 5 steps can give a range from 0-5 inclusive
		const rounded = Math.round(interp * steps);

		return rounded;
	};
}
