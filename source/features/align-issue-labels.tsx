import './align-issue-labels.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-align-issue-labels');
}

void features.add({
	id: __filebasename,
	description: 'Aligns labels in lists to the left.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/85866472-11aa7900-b7e5-11ea-80aa-d84e3aee2551.png'
}, {
	awaitDomReady: false,
	include: [
		pageDetect.isConversationList
	],
	init
});
