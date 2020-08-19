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
	description: 'Stay on the local page while jumping to the definition of a function or method within the same file.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/90635640-7091da80-e1f7-11ea-9d79-eb340f9d2c61.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
