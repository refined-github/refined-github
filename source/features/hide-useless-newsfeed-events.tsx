import select from 'select-dom';
import features from '../libs/features';

function init() {
	select('.news').classList.add('rgh-no-useless-events');
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
