import './hide-useless-newsfeed-events.css';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-no-useless-events');
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isDashboard
	],
	awaitDomReady: false,
	init: onetime(init)
});
