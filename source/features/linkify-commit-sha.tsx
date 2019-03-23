import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function init() {
	const el = select('.sha.user-select-contain');
	if (el) {
		wrap(el, <a href={location.pathname.replace(/pull\/\d+\/commits/, 'commit')}/>);
	}
}

features.add({
	id: 'linkify-commit-sha',
	description: 'Linkify commit sha',
	include: [
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
