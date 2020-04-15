import mem from 'mem';

const onElementRemoval = mem((element: Element): Promise<void> => {
	return new Promise(resolve => {
		// @ts-ignore until https://github.com/microsoft/TypeScript/issues/37861
		new ResizeObserver(([{target}], observer) => {
			if (!target.isConnected) {
				observer.disconnect();
				resolve();
			}
		}).observe(element);
	});
});

export default onElementRemoval;
