import mem from 'memoize';

const onElementRemoval = mem(async (element: Element, signal?: AbortSignal): Promise<void> => {
	// eslint-disable-next-line no-restricted-syntax -- signal is an optional AbortSignal parameter
	if (signal?.aborted) {
		return;
	}

	return new Promise(resolve => {
		const observer = new ResizeObserver(([{target}], observer) => {
			if (!target.isConnected) {
				observer.disconnect();
				resolve();
			}
		});

		if (signal) {
			signal.addEventListener('abort', () => {
				observer.disconnect();
				resolve();
			}, {
				once: true,
			});
		}

		observer.observe(element);
	});
});

export default onElementRemoval;
