import React from 'dom-chef';
import {$} from 'select-dom';
import debounce from 'debounce-fn';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import onAbort from '../helpers/abort-controller.js';

const loadMore = debounce((button: HTMLButtonElement) => {
	button.click();

	// If GH hasn't loaded the JS, the click will not load anything.
	// We can detect if it worked by looking at the button's state,
	// and then trying again (auto-debounced)
	if (!button.disabled) {
		loadMore(button);
	}
}, {wait: 200});

const inView = new IntersectionObserver(([{target, isIntersecting}]) => {
	if (isIntersecting) {
		loadMore(target as HTMLButtonElement);
	}
}, {
	rootMargin: '500px', // https://github.com/refined-github/refined-github/pull/505#issuecomment-309273098
});

function copyFooter(originalFooter: HTMLElement): void {
	// Copy the footer links to the sidebar to make them more accessible. Also keep a copy in the footer.
	const footer = originalFooter.cloneNode(true);

	for (const child of footer.children) {
		child.classList.remove('pl-lg-4', 'col-xl-3');
	}

	$('[aria-label^="Explore"]')!.append(
		<div className="footer mt-4 py-4 border-top">
			{footer}
		</div>,
	);
}

function init(signal: AbortSignal): void {
	onAbort(signal, inView);
	observe('.ajax-pagination-btn', button => {
		inView.observe(button);
	}, {signal});

	observe('.footer > .d-flex', copyFooter, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDashboard,
	],
	init,
});

/*

## Test URLs

https://github.com/

*/
