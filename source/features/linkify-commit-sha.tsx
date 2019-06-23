import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function init(): void {
	const el = select('.sha.user-select-contain');
	if (el) {
		wrap(el, <a href={location.pathname.replace(/pull\/\d+\/commits/, 'commit')}/>);
	}
}

features.add({
	id: __featureName__,
	description: 'Open the regular commit from PR-related commits by clicking the commit hash',
	include: [
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
