import {IterableElement, Promisable} from 'type-fest';

export function pSomeFunction<List extends Iterable<unknown>, Element extends IterableElement<List>>(
	iterable: List,
	predicate: (value: Element) => Promisable<boolean>,
): Promisable<boolean> {
	const promises: Array<PromiseLike<boolean>> = [];
	// Prioritize sync functions and early returns
	for (const item of iterable) {
		const result = predicate(item as Element);
		if (typeof result === 'boolean') {
			if (result) {
				// Early sync return on the first truthy value
				return true;
			}
		} else {
			promises.push(result);
		}
	}

	if (promises.length === 0) {
		// Matches `[].some(Boolean)`
		return false;
	}

	return pSome(promises);
}

export async function pSome(iterable: Iterable<PromiseLike<unknown>>): Promise<boolean> {
	// eslint-disable-next-line no-async-promise-executor -- It's fine, resolve is at the end
	return new Promise(async resolve => {
		for (const promise of iterable) {
			(async () => {
				if (await promise) {
					resolve(true);
				}
			})();
		}

		await Promise.allSettled(iterable);

		resolve(false);
	});
}

export function pEveryFunction<List extends Iterable<unknown>, Element extends IterableElement<List>>(
	iterable: List,
	predicate: (value: Element) => Promisable<boolean>,
): Promisable<boolean> {
	const promises: Array<PromiseLike<boolean>> = [];
	// Prioritize sync functions and early returns
	for (const item of iterable) {
		const result = predicate(item as Element);
		if (typeof result === 'boolean') {
			if (!result) {
				// Early sync return on the first falsy value
				return false;
			}
		} else {
			promises.push(result);
		}
	}

	if (promises.length === 0) {
		// Matches `[].every(Boolean)`
		return true;
	}

	return pEvery(promises);
}

export async function pEvery(iterable: Iterable<PromiseLike<unknown>>): Promise<boolean> {
	const results = await Promise.all(iterable);
	return results.every(Boolean);
}
