import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	for (const header of select.all('.js-notifications-group h6')) {
		header.append(
			<a className="text-inherit" href={'/' + header.textContent!.trim()}>
				{header.firstChild}
			</a>
		);
	}
}

features.add({
	id: __filebasename,
	description: 'Linkifies the header of each notification group (when grouped by repository).',
	screenshot: 'https://user-images.githubusercontent.com/1402241/80849887-81531c00-8c19-11ea-8777-7294ce318630.png'
}, {
	include: [
		pageDetect.isNotifications
	],
	init
});
