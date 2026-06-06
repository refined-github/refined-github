import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addPagination(pagination: HTMLElement): void {
	const container = pagination.parentElement;
	if (!container) {
		return;
	}

	// Avoid duplicating if already added
	if (container.querySelector('.rgh-top-commits-pagination')) {
		return;
	}

	const clone = pagination.cloneNode(true) as HTMLElement;
	clone.classList.remove('mt-4', 'mt-5');
	clone.classList.add('mb-4', 'rgh-top-commits-pagination');

	// Insert after the toolbar (first child), not at the very top of the container
	const toolbar = container.firstElementChild;
	if (toolbar) {
		toolbar.after(clone);
	} else {
		container.prepend(clone);
	}
}

function init(signal: AbortSignal): void {
	observe('[aria-label="Pagination"]:not(.rgh-top-commits-pagination), .paginate-container:not(.rgh-top-commits-pagination)', addPagination, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	init,
});
