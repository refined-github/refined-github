import {PromisableBooleanFunction} from '../github-helpers/index.js';

export default async function pSomeFunction(iterable: Iterable<PromisableBooleanFunction>): Promise<boolean> {
	const promises: Array<PromiseLike<boolean>> = [];
	// Prioritize sync functions and early returns
	for (const fn of iterable) {
		const result = fn();
		if (typeof result === 'boolean') {
			if (result) {
				return true;
			}
		} else {
			promises.push(result);
		}
	}

	return pSome(promises);
}

export async function pSome(iterable: Iterable<PromiseLike<unknown>>): Promise<boolean> {
	return new Promise(resolve => {
		for (const promise of iterable) {
			(async () => {
				if (await promise) {
					resolve(true);
				}
			})();
		}

		void Promise.allSettled(iterable).then(() => {
			resolve(false);
		});
	});
}
