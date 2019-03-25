import React from 'dom-chef';
import features from '../libs/features';
import elementReady from 'element-ready';

async function init() {
	await elementReady('.CodeMirror'); // *Not* safeElementReady
	document.head.append(<script src={browser.runtime.getURL('resolve-conflicts.js')}/>);
}

features.add({
	id: 'resolve-conflict',
	include: [
		features.isConflict
	],
	load: features.onAjaxedPages,
	init
});
