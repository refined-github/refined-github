export default function getDeinitHandler(deinit: Deinit): VoidFunction {
	if (deinit instanceof MutationObserver || deinit instanceof ResizeObserver || deinit instanceof IntersectionObserver) {
		return () => {
			deinit.disconnect();
		};
	}

	if ('abort' in deinit) { // Selector observer
		return () => {
			deinit.abort();
		};
	}

	if ('destroy' in deinit) { // Delegate subscription
		return deinit.destroy;
	}

	return deinit;
}
