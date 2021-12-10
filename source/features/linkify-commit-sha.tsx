import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '.';

function init(): void {
	const element = select('.sha.user-select-contain');
	if (element) {
		wrap(element, <a href={location.pathname.replace(/pull\/\d+\/commits/, 'commit')}/>);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
