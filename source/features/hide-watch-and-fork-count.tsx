import './hide-watch-and-fork-count.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-hide-watch-and-fork-count');
}

features.add({
	id: __featureName__,
	description: 'Hides forks and watchers counters.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/53681077-f3328b80-3d1e-11e9-9e29-2cb017141769.png'
}, {
	include: [
		features.isRepo
	],
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
