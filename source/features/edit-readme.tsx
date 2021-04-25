import React from 'dom-chef';
import select from 'select-dom';
import {PencilIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {isPermalink} from '../github-helpers';
import getDefaultBranch from '../github-helpers/get-default-branch';

async function init(): Promise<void | false> {
	const readmeHeader = await elementReady('#readme .Box-title');
	if (!readmeHeader) {
		return false;
	}

	const isPermalink_ = await isPermalink();
	const filename = readmeHeader.textContent!.trim();
	const fileLink = select<HTMLAnchorElement>(`.js-navigation-open[title="${filename}"]`)!;

	const url = new GitHubURL(fileLink.href).assign({
		route: 'edit'
	});

	if (isPermalink_) {
		url.branch = await getDefaultBranch(); // Permalinks can't be edited
	}

	// The button already exists on repos you can push to.
	const existingButton = select('a[aria-label="Edit this file"]');
	if (existingButton) {
		if (isPermalink_) {
			// GitHub has a broken link in this case #2997
			existingButton.href = String(url);
		}

		return;
	}

	const headerContainer = readmeHeader.closest('.d-flex.flex-items-center')!;
	headerContainer.after(
		<a
			href={String(url)}
			className={`${headerContainer.parentElement!.classList.contains('js-sticky') ? 'p-2' : 'Box-btn-octicon'} btn-octicon`}
			aria-label="Edit this file"
		>
			<PencilIcon/>
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree
	],
	awaitDomReady: false,
	init
});
