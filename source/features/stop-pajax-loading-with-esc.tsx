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

function init() {
	const progressLoader = select('.progress-pjax-loader')!;

	window.addEventListener('keydown', event => {
		if (event.key === 'Escape' && progressLoader.classList.contains(progressLoaderLoadingClass)) {
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
