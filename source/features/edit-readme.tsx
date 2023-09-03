import React from 'dom-chef';
import select from 'select-dom';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import {isPermalink} from '../github-helpers/index.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';

async function init(): Promise<void | false> {
	const readmeHeader = select('#readme :is(.Box-header, .js-sticky)');

	// The button already exists on repos you can push to
	if (!readmeHeader || select.exists('[aria-label="Edit this file"]', readmeHeader)) {
		return false;
	}

	const isPermalink_ = await isPermalink();
	const filename = select('[href="#readme"]')!.textContent!.trim();
	const fileLink = select(`a.js-navigation-open[title="${filename}"]`)!;

	const url = new GitHubFileURL(fileLink.href).assign({
		route: 'edit',
	});

	if (isPermalink_) {
		url.branch = await getDefaultBranch(); // Permalinks can't be edited
	}

	readmeHeader.append(
		<a
			href={url.href}
			className={`${readmeHeader.matches('.js-sticky') ? 'p-2' : 'Box-btn-octicon'} btn-octicon rgh-edit-readme`}
			aria-label="Edit this file"
		>
			<PencilIcon/>
		</a>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isArchivedRepo,
		pageDetect.isRepoFile404,
	],
	deduplicate: '.rgh-edit-readme',
	// TODO: Use isArchivedRepoAsync and elementReady across the feature
	awaitDomReady: true,
	init,
});

/*

Test URLs:

Tree on tag: https://github.com/refined-github/refined-github/tree/23.8.24
Tree on commit: https://github.com/refined-github/refined-github/tree/ec32c7bf7030ecd797be0cb148ec982d3a035a20

 */
