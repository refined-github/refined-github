import './monospace-textareas.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-monospace-textareas');
}

features.add({
	id: __featureName__,
	description: 'Use a monospace font for all textareas.',
	screenshot: false,
	init
});
