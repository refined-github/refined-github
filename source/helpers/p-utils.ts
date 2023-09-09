import {IterableElement, Promisable} from 'type-fest';

export function pSomeFunction<
	List extends Iterable<unknown>,
	Element extends IterableElement<List>,
>(
	iterable: List,
	predicate: (value: Element) => Promisable<boolean>,
): Promisable<boolean> {
	const promises: Array<PromiseLike<boolean>> = [];
	// Prioritize sync functions and early returns
	for (const item of iterable) {
		const result = predicate(item as Element);
		if (typeof result === 'boolean') {
			if (result) {
				return true;
			}
		} else {
			promises.push(result);
		}
	}

	if (promises.length === 0) {
		return false;
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
