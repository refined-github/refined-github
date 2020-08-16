import onetime from 'onetime';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const progressLoaderLoadingClass = 'is-loading';

function fixProfileNavAndTimeline() {
	for (const stickyElement of select.all('.js-sticky:not(.is-stuck)')) {
		stickyElement.removeAttribute('style');
	}
}

function getPjaxContainerId(): string | boolean {
	const pjaxContainer = select('#js-repo-pjax-container, #js-pjax-container, #gist-pjax-container');

	if (pjaxContainer) {
		return `#${pjaxContainer.id}`;
	}

	features.error(__filebasename, 'Pjax container id not found.');
	return false;
}

function init() {
	const progressLoader = select('.progress-pjax-loader')!;

	window.addEventListener('keydown', event => {
		if (event.key === 'Escape' && progressLoader.classList.contains(progressLoaderLoadingClass)) {
			const pjaxContainerId = getPjaxContainerId();

			if (pjaxContainerId && history.state && '_id' in history.state) {
				history.replaceState({
					url: location.href,
					title: '',
					container: pjaxContainerId,
					...history.state
				}, '', location.href);
			}

			history.back();
			progressLoader.classList.remove(progressLoaderLoadingClass);
		}
	});

	window.addEventListener('pjax:error', event => {
		if (typeof event.cancelable !== 'boolean' || event.cancelable) {
			event.preventDefault();
		}
	});

	window.addEventListener('pjax:end', () => {
		if (pageDetect.isUserProfile()) {
			fixProfileNavAndTimeline();
		}
	});
}

void features.add({
	id: __filebasename,
	description: '',
	screenshot: false
}, {
	init: onetime(init)
});
