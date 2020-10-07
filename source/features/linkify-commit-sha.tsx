import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	const element = select('.sha.user-select-contain');
	if (element) {
		wrap(element, <a href={location.pathname.replace(/pull\/\d+\/commits/, 'commit')}/>);
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a link to non-PR commit when visiting a PR commit.',
	screenshot: 'https://user-images.githubusercontent.com/101152/42968387-606b23f2-8ba3-11e8-8a4b-667bddc8d33c.png'
}, {
	include: [
		pageDetect.isPRCommit
	],
	init
});
