import './edit-files-faster.css';
import React from 'dom-chef';
import select from 'select-dom';
import PencilIcon from 'octicon/pencil.svg';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import GitHubURL from '../github-helpers/github-url';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onFileListUpdate from '../github-events/on-file-list-update';

async function init(): Promise<void> {
	const isPermalink = /Tag|Tree/.test(select('[data-hotkey="w"] i')!.textContent!);
	for (const fileIcon of select.all('.js-navigation-container .octicon-file')) {
		const fileLink = fileIcon.closest('.js-navigation-item')!.querySelector<HTMLAnchorElement>('.js-navigation-open')!;
		const url = new GitHubURL(fileLink.href).assign({
			route: 'edit'
		});

		if (isPermalink) {
			// eslint-disable-next-line no-await-in-loop
			url.branch = await getDefaultBranch(); // Permalinks can't be edited
		}

		wrap(fileIcon, <a href={String(url)} className="rgh-edit-files-faster"/>);
		fileIcon.after(<PencilIcon/>);
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a button to edit files from the repo file list.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/56370462-d51cde00-622d-11e9-8cd3-8a173bd3dc08.png'
}, {
	include: [
		pageDetect.isRepoTree
	],
	additionalListeners: [
		onFileListUpdate
	],
	init
});
