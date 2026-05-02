import './quick-file-edit.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import PencilIcon from 'octicons-plain-react/Pencil';
import {$, $closest} from 'select-dom';

import features from '../feature-manager.js';
import GitHubFileUrl from '../github-helpers/github-file-url.js';
import {isArchivedRepoAsync, isPermalink} from '../github-helpers/index.js';
import {directoryListingFileIcon} from '../github-helpers/selectors.js';
import {wrap} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

async function linkifyIcon(fileIcon: Element): Promise<void> {
	const fileLink = $('a.Link--primary', $closest('.react-directory-filename-column', fileIcon));

	const url = new GitHubFileUrl(fileLink.href).assign({
		route: 'edit',
	});

	wrap(fileIcon, <a href={url.href} className="rgh-quick-file-edit" />);
	fileIcon.after(<PencilIcon />);
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

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/tree/main/.github

*/
