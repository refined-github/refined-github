import {$, elementExists} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField, setFieldText} from 'text-field-edit';

import features from '../feature-manager.js';
import looseParseInt from '../helpers/loose-parse-int.js';

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

function getFirstCommit(): {title: string; body: string | undefined} {
	const titleParts = $('.js-commits-list-item:first-child p')!.childNodes;
	const body = $('.js-commits-list-item:first-child .Details-content--hidden pre')
		?.textContent.trim() ?? undefined;

	const title = [...titleParts]
		.map(node => interpretNode(node))
		.join('')
		.trim();

	return {title, body};
}

async function init(): Promise<void | false> {
	const requestedContent = new URL(location.href).searchParams;
	const commitCountIcon = await elementReady('div.Box.mb-3 .octicon-git-commit');
	const commitCount = commitCountIcon?.nextElementSibling;
	if (!commitCount || looseParseInt(commitCount) < 2 || !elementExists('#new_pull_request')) {
		return false;
	}

	const firstCommit = getFirstCommit();
	if (!requestedContent.has('pull_request[title]')) {
		setFieldText(
			$('.discussion-topic-header input')!,
			firstCommit.title,
		);
	}

	if (firstCommit.body && !requestedContent.has('pull_request[body]')) {
		insertTextIntoField(
			$('#new_pull_request textarea[aria-label="Comment body"]')!,
			firstCommit.body,
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	deduplicate: 'has-rgh',
	init,
});

/*
Test URLs
https://github.com/refined-github/sandbox/compare/linked-commit-title?expand=1
https://github.com/refined-github/sandbox/compare/rendered-commit-title?expand=1
https://github.com/refined-github/sandbox/compare/github-moji?expand=1
*/
