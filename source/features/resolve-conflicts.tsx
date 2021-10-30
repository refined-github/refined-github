import './resolve-conflicts.css';
import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	await elementReady('.CodeMirror', {
		stopOnDomReady: false,
	});

	document.head.append(<script src={browser.runtime.getURL('resolve-conflicts.js')}/>);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConflicts,
	],
	init,
});
