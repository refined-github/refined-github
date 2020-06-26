import React from 'dom-chef';
import select from 'select-dom';
import PencilIcon from 'octicon/pencil.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import getDefaultBranch from '../github-helpers/get-default-branch';

async function init(): Promise<void | false> {
	const readmeHeader = select('#readme .Box-header h2');
	if (!readmeHeader) {
		return false;
	}

	const isPermalink = /Tag|Tree/.test(select('[data-hotkey="w"] i')!.textContent!);
	const filename = readmeHeader.textContent!.trim();
	const fileLink = select<HTMLAnchorElement>(`.js-navigation-open[title="${filename}"]`)!;

	const url = new GitHubURL(fileLink.href).assign({
		route: 'edit'
	});

	if (isPermalink) {
		url.branch = await getDefaultBranch(); // Permalinks can't be edited
	}

	// The button already exists on repos you can push to.
	const existingButton = select<HTMLAnchorElement>('a[aria-label="Edit this file"]');
	if (existingButton) {
		if (isPermalink) {
			// GitHub has a broken link in this case #2997
			existingButton.href = String(url);
		}

		return;
	}

	readmeHeader.after(
		<a
			href={String(url)}
			className="Box-btn-octicon btn-octicon float-right"
			aria-label="Edit this file"
		>
			<PencilIcon/>
		</a>
	);
}

void features.add({
	id: __filebasename,
	description: 'Ensures that the “Edit readme” button always appears (even when you have to make a fork) and works (GitHub’s link does’t work on git tags).',
	screenshot: 'https://user-images.githubusercontent.com/1402241/62073307-a8378880-b26a-11e9-9e31-be6525d989d2.png'
}, {
	include: [
		pageDetect.isRepoTree
	],
	init
});
