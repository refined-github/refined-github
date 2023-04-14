import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import {buildRepoURL} from '../github-helpers';
import getCommentAuthor from '../github-helpers/get-comment-author';
import observe from '../helpers/selector-observer';

function linkify(label: Element): void {
	if (label.closest('a')) {
		features.log.error(import.meta.url, 'Already linkified, feature needs to be updated');
		return;
	}

	const url = new URL(buildRepoURL('commits'));
	url.searchParams.set('author', getCommentAuthor(label));
	wrap(label, <a className="Link--secondary" href={url.href}/>);
}

function init(signal: AbortSignal): void {
	observe([
		'.tooltipped[aria-label*="a member of the"]',
		'.tooltipped[aria-label^="This user has previously committed"]',
	], linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	asLongAs: [
		pageDetect.isRepo,
	],
	init,
});

/*
Test URLs:

Bot PR
https://github.com/webpack/webpack/pull/15926#issue-1264092372

Bot comment
https://github.com/webpack/webpack/pull/15926#issuecomment-1149371743

Bot commented on behalf of
https://github.com/webpack/webpack/pull/15926#issuecomment-1170670173

Member review
https://github.com/refined-github/refined-github/pull/5721#pullrequestreview-1018226910

Contributor review comment
https://github.com/refined-github/refined-github/pull/5691#discussion_r895191327

Contributor review second comment
https://github.com/refined-github/refined-github/pull/5691#discussion_r895192800

Contributor review second comment in Files tab
https://github.com/refined-github/refined-github/pull/2667/files#r366433031
*/
