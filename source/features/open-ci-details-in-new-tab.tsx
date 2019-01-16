import select from 'select-dom';
import features from '../libs/features';

function init() {
	const CIDetailsLinks = select.all('a.status-actions');
	for (const link of CIDetailsLinks) {
		link.setAttribute('target', '_blank');
		link.setAttribute('rel', 'noopener');
	}
}

features.add({
	id: 'open-ci-details-in-new-tab',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
