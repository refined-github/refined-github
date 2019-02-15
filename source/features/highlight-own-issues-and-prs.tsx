import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init() {
	for (const openedByElement of select.all(`.opened-by a[href*="${CSS.escape(getUsername())}"]`)) {
		openedByElement.style.fontWeight = 'bold';
	}
}

features.add({
	id: 'highlight-own-issues-and-prs',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
