import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const header = select('.gh-header-meta .TableObject-item--primary')!;
	header.textContent = select('relative-time' ,header)!.nextSibling!.textContent!.replace('·', '');
}

void features.add({
	id: __filebasename,
	description: '',
	screenshot: ''
}, {
	include: [
		pageDetect.isIssue
	],
	init
});
