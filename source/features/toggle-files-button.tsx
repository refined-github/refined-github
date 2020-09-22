import './toggle-files-button.css';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import FoldIcon from 'octicon/fold.svg';
import UnfoldIcon from 'octicon/unfold.svg';

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

async function init(): Promise<void> {
	const repoContent = (await elementReady('.repository-content'))!;
	observeElement(repoContent, addButton);

	const cacheKey = 'files-list-toggled-off';
	delegate(document, '.rgh-toggle-files', 'click', async ({delegateTarget}) => {
		const toggleState = repoContent.classList.toggle('rgh-files-hidden');
		delegateTarget.setAttribute('aria-expanded', String(!toggleState));
		await cache.set(cacheKey, toggleState);
	});
	if (await cache.get<boolean>(cacheKey)) {
		select('.rgh-toggle-files')!.click();
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a button to toggle the repo file list.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/35480123-68b9af1a-043a-11e8-8934-3ead3cff8328.gif'
}, {
	include: [
		pageDetect.isRepoTree
	],
	awaitDomReady: false,
	init
});
