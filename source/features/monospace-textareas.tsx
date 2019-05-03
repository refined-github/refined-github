import './monospace-textareas.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-monospace-textareas');
}

features.add({
	id: 'monospace-textareas',
	init
});
