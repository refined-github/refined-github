import './clean-dashboard.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-clean-dashboard');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isDashboard
	],
	init
});
