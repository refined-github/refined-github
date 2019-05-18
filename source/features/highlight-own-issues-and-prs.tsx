import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init(): void {
	// "Opened by {user}" and "Created by {user}"
	for (const username of select.all(`.opened-by a[title$="ed by ${CSS.escape(getUsername())}"]`)) {
		username.style.fontWeight = 'bold';
	}
}

features.add({
	id: 'highlight-own-issues-and-prs',
	description: 'Highlight your own issues and pull requests in the issue list',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
