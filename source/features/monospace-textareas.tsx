import './monospace-textareas.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-monospace-textareas');
}

features.add({
	id: 'monospace-textareas',
	description: 'Limit the width of the commit title and description inputs to 50/80 characters and use a monospace font',
	init
});
