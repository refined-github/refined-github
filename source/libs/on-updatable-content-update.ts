import select from 'select-dom';

/**
This will call the callback when the supplied `.js-updatable-content` element (or its updatable ancestors) are replaced.

 * @param updatable The `.js-updatable-content` element to watch
 * @param callback The function to call after it's replaced
*/
export default function onUpdatableContentUpdate(updatable: HTMLElement, callback: VoidFunction): void {
	if (!updatable.classList.contains('js-updatable-content')) {
		throw new Error('Element is missing js-updateable-content class');
	}

	const observer = new MutationObserver(() => {
		if (updatable.isConnected) {
			return;
		}

		const replacedElement = select(`[data-url="${updatable.dataset.url!}"]`);
		if (replacedElement) {
			callback();

			// Future updates will be tested against the new element
			updatable = replacedElement;
		} else {
			observer.disconnect();
		}
	});

	recursivelyObserve(updatable, observer);
}

/**
Observe nested `.js-updatable-content` element without using a page-wide `{subtree: true}` or polling
*/
function recursivelyObserve(updatableAncestor: HTMLElement, observer: MutationObserver): void {
	do {
		observer.observe(updatableAncestor.parentElement!, {childList: true});
		updatableAncestor = updatableAncestor.parentElement!.closest<HTMLElement>('.js-updatable-content')!;
	} while (updatableAncestor);
}
