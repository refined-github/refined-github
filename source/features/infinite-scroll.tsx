import './infinite-scroll.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import debounce from 'debounce-fn';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

const loadMore = debounce(() => {
	const button = select('button.ajax-pagination-btn')!;
	button.click();
	button.textContent = 'Loading…';

	// If GH hasn't loaded the JS, the click will not load anything.
	// We can detect if it worked by looking at the button's state,
	// and then trying again (auto-debounced)
	if (!button.disabled) {
		loadMore();
	}
}, {wait: 200});

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) {
		loadMore();
	}
}, {
	rootMargin: '500px', // https://github.com/refined-github/refined-github/pull/505#issuecomment-309273098
});

function init(): void {
	observe('.ajax-pagination-btn', {
		add(button) {
			inView.observe(button);
		},
	});

	// Use cloneNode to keep the original ones for responsive layout
	const feedLink = select('.news a.f6')!.cloneNode(true);
	const footer = select('.footer > .d-flex')!.cloneNode(true);

	for (const child of footer.children) {
		child.classList.remove('pl-lg-4', 'col-xl-3');
	}

	select('[aria-label="Explore"]')!.append(
		<div className="footer">
			<div>
				{feedLink}
			</div>
			{footer}
		</div>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDashboard,
	],
	init: onetime(init),
});
