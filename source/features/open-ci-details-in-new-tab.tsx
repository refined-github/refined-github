import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const CIDetailsLinks = select.all('a.status-actions');
	for (const link of CIDetailsLinks) {
		link.setAttribute('target', '_blank');
		link.setAttribute('rel', 'noopener');
	}
}

features.add({
	id: __featureName__,
	description: 'Opens the Checks "details" link in a new tab.',
	screenshot: false,
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
