import features from '../libs/features';

function init() {
	document.body.classList.add('rgh-hide-watch-and-fork-count');
}

features.add({
	id: 'hide-watch-and-fork-count',
	include: [
		features.isRepo
	],
	init
});
