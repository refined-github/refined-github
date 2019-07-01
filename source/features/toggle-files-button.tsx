import './toggle-files-button.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as icons from '../libs/icons';
import observeEl from '../libs/simplified-element-observer';

function addButton(): void {
	// `div` excludes `include-fragment`, which means the list is still loading. #2160
	const filesHeader = select('div.commit-tease');
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

function init(): void {
	const repoContent = select('.repository-content')!;
	observeEl(repoContent, addButton);
	delegate('.rgh-toggle-files', 'click', ({delegateTarget}) => {
		delegateTarget.setAttribute('aria-expanded', String(!repoContent.classList.toggle('rgh-files-hidden')));
	});
}

features.add({
	id: __featureName__,
	description: 'Add a "Toggle all files" button to file lists in repositories',
	include: [
		features.isRepoTree
	],
	load: features.onAjaxedPages,
	init
});
