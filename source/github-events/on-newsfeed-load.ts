
export default async function onNewsfeedLoad(callback: VoidFunction): Promise<void> {
	const observer = new MutationObserver((([{addedNodes}]) => {
		callback();

		// If the newly-loaded fragments allows further loading, observe them
		for (const node of addedNodes) {
			if (node instanceof Element && node.$exists('.ajax-pagination-form')) {
				observer.observe(node, {childList: true});
			}
		}
	}));

	// Start from the main container
	observer.observe($('.news')!, {childList: true});
}
