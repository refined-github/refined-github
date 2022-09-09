import * as pageDetect from 'github-url-detection';
import type {DelegateEvent} from 'delegate-it';
import delegate from 'delegate-it';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

function followLocalLink(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	if (new GitHubURL(event.delegateTarget.href).filePath === new GitHubURL(location.href).filePath) {
		location.hash = event.delegateTarget.hash;
		event.preventDefault();
	}
}

function init(signal: AbortSignal): void {
	delegate(document, '.TagsearchPopover-item', 'click', followLocalLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	deduplicate: false,
	init,
});
