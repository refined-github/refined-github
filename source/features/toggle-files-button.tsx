import './toggle-files-button.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import {
	FoldIcon,
	UnfoldIcon
} from '@primer/octicons-react';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

function addButton(): void {
	// `div` excludes `include-fragment`, which means the list is still loading. #2160
	const filesHeader = select([
		'div.commit-tease',
		'.Box-header--blue .Details > :last-child > ul' // "Repository refresh" layout
	]);
	if (!filesHeader || select.exists('.rgh-toggle-files')) {
		return;
	}

	filesHeader.append(
		<button
			type="button"
			className="btn-octicon rgh-toggle-files"
			aria-label="Toggle files section"
			aria-expanded="true"
		>
			<FoldIcon/>
			<UnfoldIcon/>
		</button>
	);
}

function init(): void {
	const repoContent = select('.repository-content')!;
	observeElement(repoContent, addButton);
	delegate(document, '.rgh-toggle-files', 'click', ({delegateTarget}) => {
		delegateTarget.setAttribute('aria-expanded', String(!repoContent.classList.toggle('rgh-files-hidden')));
	});
}

void features.add({
	id: __filebasename,
	description: 'Adds a button to toggle the repo file list.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/35480123-68b9af1a-043a-11e8-8934-3ead3cff8328.gif'
}, {
	include: [
		pageDetect.isRepoTree
	],
	init
});
