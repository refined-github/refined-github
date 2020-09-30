import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepoURL} from '../github-helpers';

function init(): void {
	// In "Repository refresh" layout, it's part of an "Add file" dropdown, don't delete it there
	select(`.file-navigation a[href^="/${getRepoURL()}/upload"]:not(.dropdown-item)`)?.remove();
}

void features.add({
	id: __filebasename,
	description: 'Remove the "Upload files" button.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepoTree
	],
	init
});
