import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

function followLocalLink(event: delegate.Event<MouseEvent, HTMLAnchorElement>) {
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
	screenshot: 'https://user-images.githubusercontent.com/1402241/90641702-70aace00-e229-11ea-946c-3a76697b9184.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
