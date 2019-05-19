import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const body = select('body');
	if (body) {
		body.classList.add('rgh-responsive-layout');
	}
}

features.add({
	id: 'responsive-layout',
	description: 'Make GitHub responsive',
	init
});
