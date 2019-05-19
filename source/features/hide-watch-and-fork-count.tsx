import './hide-watch-and-fork-count.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-hide-watch-and-fork-count');
}

features.add({
	id: 'hide-watch-and-fork-count',
	description: 'Hide watch and fork count from repo pages',
	include: [
		features.isRepo
	],
	init
});
