import select from 'select-dom';

import features from '../feature-manager';

let progressLoader: HTMLElement;
const progressLoaderLoadingClass = 'is-loading';

function keydownHandler(event: KeyboardEvent): void {
	if (event.key !== 'Escape' || !progressLoader.classList.contains(progressLoaderLoadingClass)) {
		return;
	}

	if (history.state && '_id' in history.state) {
		const pjaxContainer = select('#js-repo-pjax-container, #js-pjax-container, #gist-pjax-container');

		if (pjaxContainer) {
			// We need it for correct work of browser forward-button
			history.replaceState({
				url: location.href,
				title: '',
				container: `#${pjaxContainer.id}`,
				...history.state,
			}, '', location.href);
		} else {
			features.log.error(import.meta.url, 'Pjax container not found.');
		}
	}

	window.addEventListener('pjax:error', pjaxErrorHandler, {once: true});

	history.back();
	progressLoader.classList.remove(progressLoaderLoadingClass);
}

function pjaxErrorHandler(event: CustomEvent): void {
	if (event.cancelable) {
		// Avoid location.replace() when AbortController.abort() throw an error
		event.preventDefault();
	}
}

function init(): void {
	progressLoader = select('.progress-pjax-loader')!;
	window.addEventListener('keydown', keydownHandler);
}

void features.add(import.meta.url, {
	deduplicate: 'has-rgh',
	init,
});
