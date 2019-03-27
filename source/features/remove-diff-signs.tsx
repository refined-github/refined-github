import features from '../libs/features';

function init() {
	document.body.classList.add('rgh-remove-diff-signs');
}

features.add({
	id: 'remove-diff-signs',
	description: 'Diff signs are hidden',
	init
});
