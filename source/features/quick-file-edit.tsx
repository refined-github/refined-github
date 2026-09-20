/**
@description Adds a button to edit files from the repo file list.
@screenshot https://github-production-user-asset-6210df.s3.amazonaws.com/83146190/252182890-081975f4-f041-4ba5-ae48-d52cb0796543.png
*/

import './quick-file-edit.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PencilIcon from 'octicons-plain-react/Pencil';
import {$, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import GitHubFileUrl from '../github-helpers/github-file-url.js';
import {isArchivedRepoAsync, isPermalink} from '../github-helpers/index.js';
import {directoryListingFileIcon} from '../github-helpers/selectors.js';
import {wrap} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

// Only directories are expandable; the child combinator excludes the pencil that this feature adds
const sidebarFileIcon = '[role="treeitem"]:not([aria-expanded]) .PRIVATE_TreeView-item-visual > svg';

function addIcon(fileIcon: Element, url: GitHubFileUrl): void {
	wrap(fileIcon, <a href={url.href} className="rgh-quick-file-edit" />);
	fileIcon.after(<PencilIcon />);
}

async function linkifyIcon(fileIcon: Element): Promise<void> {
	const fileLink = $('.react-directory-filename-cell a', fileIcon.parentElement!);

	const url = new GitHubFileUrl(fileLink.href).assign({
		route: 'edit',
	});

	addIcon(fileIcon, url);
}

function linkifySidebarIcon(fileIcon: Element): void {
	// The sidebar items aren't links, but their ID holds the path
	const {id} = closestElement('[role="treeitem"]', fileIcon);

	const url = new GitHubFileUrl(location.href).assign({
		route: 'edit',
		filePath: id.replace(/-item$/, ''),
	});

	addIcon(fileIcon, url);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe(directoryListingFileIcon, linkifyIcon, {signal});
	observe(sidebarFileIcon, linkifySidebarIcon, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile, // The sidebar appears here too
	],
	exclude: [
		pageDetect.is404,
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
