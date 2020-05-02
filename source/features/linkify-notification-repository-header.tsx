
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import {wrap} from '../libs/dom-utils';

function init(): void {
	for (const header of select.all('.js-notifications-group h6')) {
		wrap(header, <a className={header.className + ' text-inherit'} href={'/' + header.textContent!.trim()}/>);
	}
}

features.add({
	id: __filebasename,
	description: 'Linkifies the header of each notification group (when grouped by repository).'
}, {
	include: [
		pageDetect.isNotifications
	],
	init
});
