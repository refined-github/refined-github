import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

function followLocalLink(event: delegate.Event<MouseEvent, HTMLAnchorElement>): void {
	if (new GitHubURL(event.delegateTarget.href).filePath === new GitHubURL(location.href).filePath) {
		location.hash = event.delegateTarget.hash;
		event.preventDefault();
	}
}

function init(): void {
	delegate(document, '.TagsearchPopover-item', 'click', followLocalLink);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
