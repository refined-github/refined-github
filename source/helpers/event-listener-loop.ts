import pDefer from 'p-defer';

async function* createEventIterator<T extends Event>(
	element: EventTarget,
	eventName: string,
	{signal, once}: {
		signal?: AbortSignal;
		once?: boolean;
	} = {},
): AsyncGenerator<T> {
	const queue: T[] = [];
	let deferred = pDefer<void>();

	const handler = (event: Event): void => {
		queue.push(event as T);
		deferred.resolve();
		deferred = pDefer();
	};

	try {
		element.addEventListener(eventName, handler, {once});

		while (!signal?.aborted) {
			if (queue.length === 0) {
				// eslint-disable-next-line no-await-in-loop
				await deferred.promise;
			}
			yield queue.shift()!;

			if (once) {
				break;
			}
		}
	} finally {
		element.removeEventListener(eventName, handler);
	}
}

export default createEventIterator;
