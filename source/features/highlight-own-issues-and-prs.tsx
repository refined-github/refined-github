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
	id: __featureName__,
	description: 'Highlights discussions opened by you.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/53065281-01560000-3506-11e9-9a51-0bdf69e20b4a.png',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
