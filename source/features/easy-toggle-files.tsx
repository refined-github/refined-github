import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleFile(event: delegate.Event<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = event.delegateTarget;

	// The clicked element is either the bar itself or one of its 2 children
	if (elementClicked === headerBar || elementClicked.parentElement === headerBar) {
		select('[aria-label="Toggle diff contents"]', headerBar)!
			.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

function init(): Deinit {
	return delegate(document, '.file-header', 'click', toggleFile);
}

// TODO: https://github.com/refined-github/github-url-detection/pull/115
const isGistRevision = (url: URL | HTMLAnchorElement | Location = location): boolean => pageDetect.isGist(url) && /^\/(gist\/)?[^/]+\/[\da-f]{32}\/revisions$/.test(url.pathname);

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare,
		isGistRevision,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
