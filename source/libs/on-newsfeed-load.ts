import select from 'select-dom';
import {isDashboard} from './page-detect';

export default async function onNewsfeedLoad(callback: VoidFunction): Promise<void> {
	// `onNewsfeedLoad` is used as a listener on global features like `parse-backticks`
	if (!isDashboard()) {
		return;
	}

	const observer = new MutationObserver((([{addedNodes}]) => {
		callback();

		// If the newly-loaded fragments allows further loading, observe them
		for (const node of addedNodes) {
			if (node instanceof Element && select.exists('.ajax-pagination-form', node)) {
				observer.observe(node, {childList: true});
			}
		}
	}));

	// Start from the main container
	observer.observe(select('.news')!, {childList: true});
}
