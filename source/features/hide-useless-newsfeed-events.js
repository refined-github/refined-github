import select from 'select-dom';
import features from '../libs/features';

function init() {
	select('.news').classList.add('rgh-no-useless-events');
}

features.add({
	id: 'hide-useless-newsfeed-events',
	dependencies: [
		features.and(
			features.isDashboard,
			features.not(features.isGist)
		)
	],
	init
});
