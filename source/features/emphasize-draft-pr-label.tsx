import features from '../libs/features';

import './emphasize-draft-pr-label.css';

function init(): void {
	document.body.classList.add('rgh-emphasize-draft-pr-label');
}

function deinit(): void {
	document.body.classList.remove('rgh-emphasize-draft-pr-label');
}

features.add({
	id: __featureName__,
	description: 'Add a gray background to the `Draft` PR label',
	screenshot: 'https://user-images.githubusercontent.com/2259688/69123104-76795480-0adb-11ea-87d2-aff2b70b36c7.png',
	load: features.onDomReady,
	init,
	deinit
});

