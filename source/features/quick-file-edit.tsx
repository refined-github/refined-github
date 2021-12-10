import './quick-file-edit.css';
import React from 'dom-chef';
import select from 'select-dom';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '.';
import GitHubURL from '../github-helpers/github-url.js';
import {isPermalink} from '../github-helpers.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import onFileListUpdate from '../github-events/on-file-list-update.js';

async function init(): Promise<void> {
	const isPermalink_ = await isPermalink();
	for (const fileIcon of select.all('.js-navigation-container .octicon-file')) {
		const fileLink = fileIcon.closest('.js-navigation-item')!.querySelector('a.js-navigation-open')!;
		const url = new GitHubURL(fileLink.href).assign({
			route: 'edit',
		});

		if (isPermalink_) {
			// eslint-disable-next-line no-await-in-loop
			url.branch = await getDefaultBranch(); // Permalinks can't be edited
		}

		wrap(fileIcon, <a data-skip-pjax href={url.href} className="rgh-quick-file-edit"/>);
		fileIcon.after(<PencilIcon/>);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	additionalListeners: [
		onFileListUpdate,
	],
	deduplicate: '.rgh-quick-file-edit', // #3945
	init,
});
