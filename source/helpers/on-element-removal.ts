import mem from 'mem';

const onElementRemoval = mem(async (element: Element, signal?: AbortSignal): Promise<void> => {
	if (signal?.aborted) {
		return Promise.reject();
	}

	return new Promise((resolve, reject) => {
		const observer = new ResizeObserver(([{target}], observer) => {
			if (!target.isConnected) {
				observer.disconnect();
				resolve();
			}
		});

		if (signal) {
			signal.addEventListener('abort', () => {
				observer.disconnect();
				reject();
			}, {
				once: true,
			});
		}

		observer.observe(element);
	});
});

export default onElementRemoval;
