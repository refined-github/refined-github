import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function preventSubmit({delegateTarget: pullButton}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	// Delay disabling the buttons to let it be submitted first
	setTimeout(() => {
		pullButton.disabled = true;
		((pullButton.nextElementSibling ?? pullButton.previousElementSibling) as HTMLButtonElement)!.disabled = true;
	});
}

function init(): void {
	delegate(document, '#new_pull_request button[type="submit"][aria-label$="for review"]', 'click', preventSubmit);
}

void features.add({
	id: __filebasename,
	description: 'Disables the create pull request button after submission to prevent creating duplicate pull requests.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/89417135-47a01e80-d6fc-11ea-98fb-724db6647592.gif'
}, {
	include: [
		pageDetect.isCompare
	],
	init
});
