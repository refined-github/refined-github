import './hide-watch-and-fork-count.css';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-hide-watch-and-fork-count');
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init: onetime(init)
});
