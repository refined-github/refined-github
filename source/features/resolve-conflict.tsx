import React from 'dom-chef';
import features from '../libs/features';

function init() {
	setTimeout(() => {
		document.head.append(<script src={browser.runtime.getURL('resolve-conflicts.js')}/>);
	}, 2000);
}

features.add({
	id: 'resolve-conflict',
	include: [
		features.isConflict
	],
	load: features.onAjaxedPages,
	init
});
