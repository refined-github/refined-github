import {elementExists} from 'select-dom';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField, setFieldText} from 'text-field-edit';

import features from '../feature-manager.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import observe from '../helpers/selector-observer.js';

function interpretNode(node: ChildNode): string | void {
	switch (node instanceof Element && node.tagName) {
		case false:
		case 'A': {
			return node.textContent;
		}

		case 'CODE': {
			// Restore backticks that GitHub loses when rendering them
			return '`' + node.textContent + '`';
		}

		default:
			// Ignore other nodes, like `<span>...</span>` that appears when commits have a body
	}
}

function getFirstCommit(firstCommit: HTMLElement): {title: string; body: string | undefined} {
	const body = $optional('.Details-content--hidden pre', firstCommit)
		?.textContent
		.trim() ?? undefined;

	const title = [...firstCommit.childNodes]
		.map(node => interpretNode(node))
		.join('')
		.trim();

	return {title, body};
}

function useCommitTitle(firstCommitElement: HTMLElement): void {
	const requestedContent = new URL(location.href).searchParams;
	const commitCountIcon = $([
		// Few commits
		'div.Box.mb-3 .octicon-git-commit',
		// Many commits (rendered in tabs)
		'a[href="#commits_bucket"] .octicon-git-commit',
	]);
	const commitCount = commitCountIcon?.nextElementSibling;
	if (!commitCount || looseParseInt(commitCount) < 2 || !elementExists('#new_pull_request')) {
		return;
	}

	const firstCommit = getFirstCommit(firstCommitElement);

	if (!requestedContent.has('pull_request[title]')) {
		setFieldText(
			$('#pull_request_title'),
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
	observe('#commits_bucket > :first-child .js-commits-list-item:first-child p', useCommitTitle, {signal});
}

// The user already altered the PR title/body in a previous load, don't overwrite it
// https://github.com/refined-github/refined-github/issues/7191
function hasUserAlteredThePR(): boolean {
	const sessionResumeId = $optional('meta[name="session-resume-id"]')?.content;
	return Boolean(sessionResumeId && sessionStorage.getItem(`session-resume:${sessionResumeId}`));
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	exclude: [
		() =>	new URLSearchParams(location.search).has('title'),
		hasUserAlteredThePR,
	],
	init,
});

/*
Test URLs

Few commit: https://github.com/refined-github/sandbox/compare/rendered-commit-title?expand=1
Many commits: https://github.com/refined-github/refined-github/compare/refined-github:refined-github:esbuild-2...pgimalac:refined-github:pgimalac/fit-rendered-markdown?expand=1
*/
