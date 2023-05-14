import './resolve-conflicts.css';
import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

async function init(): Promise<void> {
	await elementReady('.CodeMirror', {
		stopOnDomReady: false,
	});

	document.head.append(<script src={browser.runtime.getURL('assets/resolve-conflicts.js')}/>);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConflicts,
	],
	init,
});
