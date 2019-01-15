// TODO: move to CSS
import select from 'select-dom';
import features from '../libs/features';

function init() {
	const readmeContainer = select('.repository-content #readme');

	if (readmeContainer && !readmeContainer.classList.contains('blob')) {
		readmeContainer.classList.add('rgh-hide-readme-header');
	}
}

features.add({
	id: 'hide-readme-header',
	load: features.onDomReady,
	init
});
