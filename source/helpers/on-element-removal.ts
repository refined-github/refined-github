import mem from 'mem';

const onElementRemoval = mem(
	async (element: Element, signal?: AbortSignal): Promise<void> => (
		new Promise(resolve => {
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
				}, {once: true});
			}

			observer.observe(element);
		})
	),
);

export default onElementRemoval;
