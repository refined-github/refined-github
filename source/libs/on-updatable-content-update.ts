/**
This will call the callback when the supplied `.js-updatable-content` element is replaced.

Limitations:
- only tested in the discussion sidebar
- won't detect removals of ancestors (it could recursively look for `.js-updatable-content`)

 * @param updatable The `.js-updatable-content` element to watch
 * @param callback The function to call after it's replaced
*/
export default function onUpdatableContentUpdate(updatable: HTMLElement, callback: VoidFunction): void {
	new MutationObserver(mutations => {
		if (updatable.isConnected) {
			return;
		}

		for (const mutation of mutations) {
			const replacedElement = [...mutation.addedNodes].find(newNode =>
				newNode instanceof HTMLElement && newNode.dataset.url === updatable.dataset.url
			);

			if (replacedElement) {
				callback();

				// Listen to future updates
				updatable = replacedElement as HTMLElement;
				return;
			}
		}
	}).observe(updatable.parentElement!, {childList: true});
}
