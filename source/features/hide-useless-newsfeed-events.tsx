import './hide-useless-newsfeed-events.css';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	document.body.classList.add('rgh-no-useless-events');
}

features.add({
	id: __filebasename,
	description: 'Hides inutile newsfeed events (commits, forks, new followers).',
	screenshot: false
}, {
	include: [
		pageDetect.isDashboard
	],
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
