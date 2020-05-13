import select from 'select-dom';
import debounce from 'debounce-fn';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';
import {lazilyObserveSelector, ElementCallback} from '../libs/once-visible-observer';

function loadMore(button: HTMLButtonElement): void {
	console.log('will click', button.disabled)
	button.click();
	button.textContent = 'Loading…';
}

function init(): void {
	const form = select('.ajax-pagination-form');
	if (form) {
		// If GH hasn't loaded the JS,
		// the fake click will submit the form without ajax.
		form.addEventListener('submit', event => event.preventDefault());

		lazilyObserveSelector('.ajax-pagination-btn', loadMore as ElementCallback);
	}
}

features.add({
	id: __filebasename,
	description: 'Automagically expands the newsfeed when you scroll down.',
	screenshot: false
}, {
	include: [
		pageDetect.isDashboard
	],
	repeatOnAjax: false,
	init
});
