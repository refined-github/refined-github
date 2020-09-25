import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

let progressLoader: HTMLElement;
const progressLoaderLoadingClass = 'is-loading';

function fixProfileNavAndTimeline(): void {
	for (const stickyElement of select.all('.js-sticky:not(.is-stuck)')) {
		stickyElement.removeAttribute('style');
	}
}

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
				...history.state
			}, '', location.href);
		} else {
			features.error(__filebasename, 'Pjax container not found.');
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

	if (pageDetect.isUserProfile()) {
		window.addEventListener('pjax:end', fixProfileNavAndTimeline);
	}
}

void features.add({
	id: __filebasename,
	description: 'After you click on an ajaxed link, this lets you stop loading a page by pressing the esc key, like the browser does for regular page loads',
	screenshot: 'https://user-images.githubusercontent.com/36174850/90323385-3c08ef00-df69-11ea-8c0e-c85241888a7b.gif'
}, {
	include: [
		pageDetect.isRepo,
		pageDetect.isRepoSearch,
		pageDetect.isGlobalSearchResults,
		pageDetect.isUserProfile,
		pageDetect.isSingleGist,
		pageDetect.isGlobalConversationList
	],
	init
});
