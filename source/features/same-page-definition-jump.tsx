import onetime from 'onetime';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url.js';

function followLocalLink(event: delegate.Event<MouseEvent, HTMLAnchorElement>): void {
	if (new GitHubURL(event.delegateTarget.href).filePath === new GitHubURL(location.href).filePath) {
		location.hash = event.delegateTarget.hash;
		event.preventDefault();
	}
}

function init(): void {
	delegate(document, '.TagsearchPopover-item', 'click', followLocalLink);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	init: onetime(init),
});
