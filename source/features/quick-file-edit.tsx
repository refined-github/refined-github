// TODO: In 2024, drop js-navigation-item. Pre-React makeover

import './quick-file-edit.css';
import React from 'dom-chef';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import {isArchivedRepoAsync, isPermalink} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {directoryListingFileIcon} from '../github-helpers/selectors.js';

async function linkifyIcon(fileIcon: Element): Promise<void> {
	const fileLink = fileIcon
		.closest('.js-navigation-item, .react-directory-filename-column')!
		.querySelector('a.js-navigation-open, a.Link--primary')!;

	const url = new GitHubFileURL(fileLink.href).assign({
		route: 'edit',
	});

	wrap(fileIcon, <a href={url.href} className="rgh-quick-file-edit"/>);
	fileIcon.after(<PencilIcon/>);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe(directoryListingFileIcon, linkifyIcon, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoFile404,
		isArchivedRepoAsync,
		isPermalink,
	],
	init,
});

/*

Test URLs

Legacy views: https://github.com/refined-github/refined-github
React views: https://github.com/refined-github/refined-github/tree/main/.github

*/
