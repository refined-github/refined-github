import features from '../libs/features';

function init() {
	document.body.classList.add('rgh-monospace-textareas');
}

features.add({
	id: 'monospace-textareas',
	description: 'Limit width of commit title and description inputs to 50/80 chars',
	init
});
