import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import {buildRepoURL} from '../github-helpers/index.js';
import getCommentAuthor from '../github-helpers/get-comment-author.js';
import observe from '../helpers/selector-observer.js';

function linkify(label: Element): void {
	if (label.closest('a')) {
		throw new Error('Already linkified, feature needs to be updated');
	}

	// React might create a new label without removing the old one
	// https://github.com/refined-github/refined-github/issues/8478
	label.parentElement!.querySelector('.rgh-linkify-user-labels')?.remove();

	const url = new URL(buildRepoURL('commits'));
	url.searchParams.set('author', getCommentAuthor(label));
	wrap(label, <a className="Link--secondary rgh-linkify-user-labels" href={url.href} />);
}

const ariaLabelSelector = [
	'[aria-label^="This user is a member"]',
	'[aria-label^="This user has previously committed"]',
	'[aria-label^="This user has been invited to collaborate"]',
].join(',');

function init(signal: AbortSignal): void {
	observe([
		`span[data-testid="comment-author-association"]:is(${ariaLabelSelector})`,
		// PRs
		`.tooltipped:is(${ariaLabelSelector})`,
	], linkify, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepo,
	],
	include: [
		pageDetect.hasComments,
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

Collaborator review comment
https://github.com/editorconfig/editorconfig-emacs/pull/389/changes#r2809824690

*/
