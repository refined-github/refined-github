import './hide-useless-newsfeed-events.css';
import features from '../libs/features';
import {isDashboard} from '../libs/page-detect';

function init(): void {
	document.body.classList.add('rgh-no-useless-events');
}

features.add({
	id: __featureName__,
	description: 'Hides inutile newsfeed events (commits, forks, new followers).',
	screenshot: false
}, {
	include: [
		isDashboard
	],
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
