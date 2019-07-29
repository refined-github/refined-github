import './hide-watch-and-fork-count.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-hide-watch-and-fork-count');
}

features.add({
	id: __featureName__,
	description: 'Hides forks and watchers counters.',
	screenshot: 'https://user-images.githubusercontent.com/14323370/58944460-e1aeb480-874f-11e9-8052-2d4dc794ecab.png',
	include: [
		features.isRepo
	],
	init
});
