
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import {wrap} from '../libs/dom-utils';

function init(): void {
	for (const header of select.all('.js-notifications-group h6')) {
		wrap(
			header,
			<a
				className={header.className + ' text-inherit'}
				href={'/' + header.textContent!.trim()}
			/>);
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
