import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const header = select('.gh-header-meta .TableObject-item--primary')!;
	const childNodes = [...header.childNodes].slice(4);
	childNodes[0].textContent = childNodes[0].textContent!.replace('·', '');
	header.replaceWith(<div className="TableObject-item TableObject-item--primary">
		{...childNodes}
	</div>);
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
