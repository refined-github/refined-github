/** @jsx h */
import {h} from 'preact';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	const element = select('.sha.user-select-contain');
	if (element) {
		wrap(element, <a href={location.pathname.replace(/pull\/\d+\/commits/, 'commit')}/>);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRCommit
	],
	init
});
