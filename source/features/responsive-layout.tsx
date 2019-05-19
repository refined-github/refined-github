import features from '../libs/features';

function init(): void {
	if (document.body) {
		document.body.classList.add('rgh-responsive-layout');
	}
}

features.add({
	id: 'responsive-layout',
	description: 'Make GitHub responsive',
	exclude: [
		features.isResponsive
	],
	init
});
