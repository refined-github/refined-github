import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';
import observeEl from '../libs/simplified-element-observer';
import {getEventDelegator} from '../libs/dom-utils';

function addButton() {
	const filesHeader = select('.commit-tease');
	if (!filesHeader || select.exists('.rgh-toggle-files')) {
		return false;
	}

	filesHeader.append(
		<button
			class="btn-octicon rgh-toggle-files"
			aria-label="Toggle files section"
			aria-expanded="true">
			{icons.chevronDown()}
		</button>
	);
}

function init() {
	const repoContent = select('.repository-content');
	observeEl(repoContent, addButton);
	document.addEventListener('click', event => {
		const delegateTarget = getEventDelegator(event, '.rgh-toggle-files');
		if (!delegateTarget) {
			return;
		}

		delegateTarget.setAttribute('aria-expanded', !repoContent.classList.toggle('rgh-files-hidden'));
	});
}

features.add({
	id: 'toggle-files-button',
	include: [
		features.isRepoTree
	],
	load: features.onAjaxedPages,
	init
});
