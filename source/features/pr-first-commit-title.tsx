import * as pageDetect from 'github-url-detection';
import { elementExists } from 'select-dom';
import { $, $optional } from 'select-dom/strict.js';
import { insertTextIntoField, setFieldText } from 'text-field-edit';

import features from '../feature-manager.js';
import parseRenderedText from '../github-helpers/parse-rendered-text.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import observe from '../helpers/selector-observer.js';

function getFirstCommit(firstCommitTitle: HTMLElement): { title: string; body: string | undefined; } {
	const body = $optional('.Details-content--hidden pre', firstCommitTitle.parentElement!)
		?.textContent
		.trim() ?? undefined;

	const title = parseRenderedText(firstCommitTitle, ({ nodeName }) =>
		// Exclude expand body button
		nodeName === 'BUTTON' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT);

	return { title, body };
}

function useCommitTitle(firstCommitTitle: HTMLElement): void {
	const requestedContent = new URL(location.href).searchParams;
	const commitCount = $([
		// Few commits
		'div.Box:is(.tmp-mb-3, .mb-3) .octicon-git-commit + span',
		// Many commits (rendered in tabs)
		'a[href="#commits_bucket"] .Counter',
	]);
	if (looseParseInt(commitCount) < 2 || !elementExists('#new_pull_request')) {
		return;
	}

	const firstCommit = getFirstCommit(firstCommitTitle);

	if (!requestedContent.has('pull_request[title]')) {
		setFieldText(
			$([
				'input[name="pull_request[title]"]',
				'#pull_request_title', // Remove after August 2026
			]),
			firstCommit.title,
		);
	}

	if (firstCommit.body && !requestedContent.has('pull_request[body]')) {
		insertTextIntoField(
			$('#pull_request_body'),
			firstCommit.body,
		);
	}
}

function init(signal: AbortSignal): void {
	observe('#commits_bucket > :first-child .js-commits-list-item:first-child p', useCommitTitle, { signal });
}

// The user already altered the PR title/body in a previous load, don't overwrite it
// https://github.com/refined-github/refined-github/issues/7191
function hasUserAlteredThePr(): boolean {
	const sessionResumeId = $optional('meta[name="session-resume-id"]')?.content;
	return Boolean(
		sessionStorage.getItem(`copilot-generate-pull-title:${location.pathname}`)
			// Remove after August 2026
			?? (sessionResumeId && sessionStorage.getItem(`session-resume:${sessionResumeId}`)),
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	exclude: [
		() => new URLSearchParams(location.search).has('title'),
		hasUserAlteredThePr,
	],
	init,
});

/*

Test URLs

Few commits:
	- https://github.com/refined-github/sandbox/compare/rendered-commit-title?expand=1
	- https://github.com/refined-github/sandbox/compare/9012?expand=1
Many commits:
	- https://github.com/refined-github/refined-github/compare/refined-github:refined-github:esbuild-2...pgimalac:refined-github:pgimalac/fit-rendered-markdown?expand=1
	- https://github.com/refined-github/sandbox/compare/9012-2?expand=1

*/
