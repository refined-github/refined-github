import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import features from '../libs/features';
import * as icons from '../libs/icons';
import observeEl from '../libs/simplified-element-observer';

function addButton(): void {
	const filesHeader = select('.commit-tease');
	if (!filesHeader || select.exists('.rgh-toggle-files')) {
		return;
	}

	filesHeader.append(
		<button
			className="btn-octicon rgh-toggle-files"
			aria-label="Toggle files section"
			aria-expanded="true">
			{icons.chevronDown()}
		</button>
	);
}

function init() {
	const repoContent = select('.repository-content')!;
	observeEl(repoContent, addButton);
	delegate('.rgh-toggle-files', 'click', ({delegateTarget}) => {
		(delegateTarget as HTMLElement).setAttribute('aria-expanded', String(!repoContent.classList.toggle('rgh-files-hidden')));
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
