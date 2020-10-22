import './remove-diff-signs.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-remove-diff-signs');
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.hasCode
	],
	awaitDomReady: false,
	init
});
