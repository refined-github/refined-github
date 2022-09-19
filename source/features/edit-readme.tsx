import React from 'dom-chef';
import select from 'select-dom';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import GitHubURL from '../github-helpers/github-url';
import {isPermalink} from '../github-helpers';
import getDefaultBranch from '../github-helpers/get-default-branch';

async function init(): Promise<void | false> {
	const readmeHeader = select('#readme :is(.Box-header, .js-sticky)');

	// The button already exists on repos you can push to
	if (!readmeHeader || select.exists('[aria-label="Edit this file"]', readmeHeader)) {
		return false;
	}

	const isPermalink_ = await isPermalink();
	const filename = select('[href="#readme"]')!.textContent!.trim();
	const fileLink = select(`a.js-navigation-open[title="${filename}"]`)!;

	const url = new GitHubURL(fileLink.href).assign({
		route: 'edit',
	});

	if (isPermalink_) {
		url.branch = await getDefaultBranch(); // Permalinks can't be edited
	}

	readmeHeader.append(
		<a
			href={url.href}
			className={`${readmeHeader.matches('.js-sticky') ? 'p-2' : 'Box-btn-octicon'} btn-octicon`}
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
	],
	deduplicate: 'has-rgh-inner',
	init,
});
