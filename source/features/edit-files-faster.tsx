import './edit-files-faster.css';
import React from 'dom-chef';
import select from 'select-dom';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {isPermalink} from '../github-helpers';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onFileListUpdate from '../github-events/on-file-list-update';

async function init(): Promise<void> {
	const isPermalink_ = await isPermalink();
	for (const fileIcon of select.all('.js-navigation-container .octicon-file')) {
		const fileLink = fileIcon.closest('.js-navigation-item')!.querySelector<HTMLAnchorElement>('.js-navigation-open')!;
		const url = new GitHubURL(fileLink.href).assign({
			route: 'edit'
		});

		if (isPermalink_) {
			// eslint-disable-next-line no-await-in-loop
			url.branch = await getDefaultBranch(); // Permalinks can't be edited
		}

		wrap(fileIcon, <a href={String(url)} className="rgh-edit-files-faster"/>);
		fileIcon.after(<PencilIcon/>);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree
	],
	additionalListeners: [
		onFileListUpdate
	],
	init
});
