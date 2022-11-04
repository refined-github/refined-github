/**
 * Inverse operation of linear interpolation. Given a range and a
 * value, returns the interpolation amount to get that value.
 *
 * @param min Lowest value in the range
 * @param max Highest value in the range
 * @param value Value in the range
 * @returns Interpolation amount from 0.0 to 1.0 (or beyond if `x` is outside the range [min, max])
 */
export function inverseLinearInterpolation(min: number, max: number, value: number): number {
	if (min === max) {
		return 0;
	}

	return (value - min) / (max - min);
}

/**
 * Create a function that calculates a GitHub heat index based on a list of numbers.
 * The list is used to find the min and max of the range. The function can then
 * calculate a heat index for a given value based on that range.
 *
 * GitHub has 10 heat values, and uses a lower heat index for a higher value. So the
 * highest heat index that will be returned is 1, and the lowest is 10.
 *
 * @param numbers values to use to calculate the min and max of the heat range
 * @returns function to calculate heat index of a given number
 */
export function createHeatIndexFunction(numbers: number[]): (value: number) => number {
	const steps = 10; // GH has 10 heat colors
	const min = Math.min(...numbers);
	const max = Math.max(...numbers);

	return (value: number) => {
		// Inverse linear interpolation figures out how far the value is between min & max
		const interp = Math.max(0, Math.min(1, inverseLinearInterpolation(min, max, value)));

		// Maps the [0.0, 1.0] value to [steps, 1]
		const floored = Math.floor(interp * steps);
		const heatIndex = Math.max(1, steps - floored);

		return heatIndex;
	};
}
