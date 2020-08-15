import onetime from 'onetime';
import select from 'select-dom';

import features from '.';

const progressLoaderLoadingClass = 'is-loading';

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
}

void features.add({
	id: __filebasename,
	description: '',
	screenshot: false
}, {
	init: onetime(init)
});
