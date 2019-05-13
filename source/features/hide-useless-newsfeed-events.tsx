import './hide-useless-newsfeed-events.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-no-useless-events');
}

features.add({
	id: 'hide-useless-newsfeed-events',
	description: 'Hide useless news feed events like "User started following X"',
	include: [
		features.isDashboard
	],
	exclude: [
		features.isGist
	],
	init
});
