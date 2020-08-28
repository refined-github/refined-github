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

void features.add({
	id: __filebasename,
	description: 'Avoids re-loading the page when jumping to function definition in the current file.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/90833649-7a5e2f80-e316-11ea-827d-a4e3ac8ced69.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
