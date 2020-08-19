import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

let progressLoader: HTMLElement;
const progressLoaderLoadingClass = 'is-loading';

function fixProfileNavAndTimeline() {
	for (const stickyElement of select.all('.js-sticky:not(.is-stuck)')) {
		stickyElement.removeAttribute('style');
	}
}

function keydownHandler(event: KeyboardEvent) {
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
				...history.state
			}, '', location.href);
		} else {
			features.error(__filebasename, 'Pjax container not found.');
		}
	}

	history.back();
	progressLoader.classList.remove(progressLoaderLoadingClass);
}

function pjaxErrorHandler(event: CustomEvent) {
	if (event.cancelable) {
		// Avoid location.replace() when AbortController.abort() throw an error
		event.preventDefault();
	}
}

function init() {
	progressLoader = select('.progress-pjax-loader')!;

	window.addEventListener('keydown', keydownHandler);

	window.addEventListener('pjax:error', pjaxErrorHandler);

	if (pageDetect.isUserProfile()) {
		window.addEventListener('pjax:end', fixProfileNavAndTimeline);
	}
}

void features.add({
	id: __filebasename,
	description: 'Stops pjax loading by pressing the Esc button',
	screenshot: false
}, {
	include: [
		pageDetect.isRepo,
		pageDetect.isRepoSearch,
		pageDetect.isGlobalSearchResults,
		pageDetect.isUserProfile,
		pageDetect.isSingleGist
	],
	init
});
