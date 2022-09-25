import './quick-file-edit.css';
import mem from 'mem';
import React from 'dom-chef';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import GitHubURL from '../github-helpers/github-url';
import {isPermalink} from '../github-helpers';
import getDefaultBranch from '../github-helpers/get-default-branch';
import observe from '../helpers/selector-observer';

// For https://github.com/refined-github/refined-github/issues/5821
// TODO: Maybe drop it after `isPermalink` accepts a value thanks to https://github.com/refined-github/github-url-detection/issues/85
const cachePerPage = {
	cacheKey: () => location.pathname,
};

const cachedIsPermalink = mem(isPermalink, cachePerPage);
const cachedGetDefaultBranch = mem(getDefaultBranch, cachePerPage);

async function linkifyIcon(fileIcon: Element): Promise<void> {
	const isPermalink_ = await cachedIsPermalink();
	const fileLink = fileIcon.closest('.js-navigation-item')!.querySelector('a.js-navigation-open')!;
	const url = new GitHubURL(fileLink.href).assign({
		route: 'edit',
	});

	if (isPermalink_) {
		// Permalinks can't be edited
		url.branch = await cachedGetDefaultBranch();
	}

	wrap(fileIcon, <a data-skip-pjax href={url.href} className="rgh-quick-file-edit"/>);
	fileIcon.after(<PencilIcon/>);
}

function init(signal: AbortSignal): void {
	observe('.js-navigation-container :not(a) > .octicon-file', linkifyIcon, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isArchivedRepo,
	],
	// Can't because `isArchivedRepo` is DOM-based
	// Also not needed since it appears on hover
	// awaitDomReady: false,
	init,
});
