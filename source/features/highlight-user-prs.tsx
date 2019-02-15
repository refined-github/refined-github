import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init() {
	for (const openedByEl of select.all('span.opened-by > a')) {
		if (openedByEl.textContent === getUsername()) {
			openedByEl.classList.add('highlighted-pr-author');
		}
	}
}

features.add({
	id: 'highlight-user-prs',
	include: [features.isPRList],
	load: features.onAjaxedPages,
	init,
});
