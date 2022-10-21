export function lerp(min: number, max: number, t: number): number {
	return min + ((max - min) * t);
}

export function invlerp(min: number, max: number, x: number): number {
	return (x - min) / (max - min);
}

export function calculateMinMax(values: number[]): {min: number; max: number} {
	let min = values[0];
	let max = values[0];
	for (let i = 1; i < values.length; i++) {
		if (values[i] < min) {
			min = values[i];
		} else if (values[i] > max) {
			max = values[i];
		}
	}

	return {min, max};
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
