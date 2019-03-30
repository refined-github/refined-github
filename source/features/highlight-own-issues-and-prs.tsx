import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init() {
	// "Opened by {user}" and "Created by {user}"
	for (const username of select.all(`.opened-by a[title$="ed by ${CSS.escape(getUsername())}"]`)) {
		username.style.fontWeight = 'bold';
	}
}

features.add({
	id: 'highlight-own-issues-and-prs',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
