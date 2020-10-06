import './resolve-conflicts.css';
import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	await elementReady('.CodeMirror', {
		stopOnDomReady: false
	});

	document.head.append(<script src={browser.runtime.getURL('resolve-conflicts.js')}/>);
}

void features.add({
	id: __filebasename,
	description: 'Fix merge conflicts in a click.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54978791-45906080-4fdc-11e9-8fe1-45374f8ff636.png',
	testOn: ''
}, {
	include: [
		pageDetect.isPRConflicts
	],
	init
});
