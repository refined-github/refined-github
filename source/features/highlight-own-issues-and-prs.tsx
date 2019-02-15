import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init() {
	for (const username of select.all(`.opened-by a[href*="${CSS.escape(getUsername())}"]`)) {
		username.style.fontWeight = 'bold';
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
