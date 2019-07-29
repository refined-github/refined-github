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
	description: 'Adds link to non-PR commit when visiting a PR commit.',
	screenshot: 'https://user-images.githubusercontent.com/101152/42968387-606b23f2-8ba3-11e8-8a4b-667bddc8d33c.png',
	include: [
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
