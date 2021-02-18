import mem from 'mem';

const onElementRemoval = mem(
	async (element: Element): Promise<void> => (
		new Promise(resolve => {
			new ResizeObserver(([{target}], observer) => {
				if (!target.isConnected) {
					observer.disconnect();
					resolve();
				}
			}).observe(element);
		})
	)
);

export default onElementRemoval;
