import features from '../libs/features';

function init() {
	document.body.classList.add('rgh-no-useless-events');
}

features.add({
	id: 'hide-useless-newsfeed-events',
	include: [
		features.isDashboard
	],
	exclude: [
		features.isGist
	],
	init
});
