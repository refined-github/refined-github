import mem from 'mem';

const onElementRemoval = mem(
	async (element: Element): Promise<void> => (
		new Promise(resolve => {
			// @ts-expect-error until https://github.com/microsoft/TypeScript/issues/37861
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
