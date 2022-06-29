import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int';

/** Restore backticks that GitHub loses when rendering them */
function restoreMarkdown(node: ChildNode): string {
	return node instanceof Element && node.tagName === 'CODE'
		? '`' + node.textContent! + '`'
		: node.textContent!;
}

function getFirstCommit(): {title: string; body: string | undefined} {
	const title = select('.js-commits-list-item:first-child p')!;
	const body = select('.js-commits-list-item:first-child .Details-content--hidden pre')
		?.textContent!.trim() ?? undefined;

	// GitHub loses the backticks when it renders them, so we must restore them
	const reformattedTitle = [...title.childNodes]
		.map(node => restoreMarkdown(node))
		.join('')
		.trim();
	return {title: reformattedTitle, body};
}

async function init(): Promise<void | false> {
	const requestedContent = new URL(location.href).searchParams;
	const commitCountIcon = await elementReady('div.Box.mb-3 .octicon-git-commit');
	const commitCount = commitCountIcon?.nextElementSibling;
	if (!commitCount || looseParseInt(commitCount) < 2 || !select.exists('#new_pull_request')) {
		return false;
	}

	const firstCommit = getFirstCommit();
	if (!requestedContent.has('pull_request[title]')) {
		textFieldEdit.set(
			select('.discussion-topic-header input')!,
			firstCommit.title,
		);
	}

	if (firstCommit.body && !requestedContent.has('pull_request[body]')) {
		textFieldEdit.insert(
			select('#new_pull_request textarea[aria-label="Comment body"]')!,
			firstCommit.body,
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	awaitDomReady: false,
	init,
});

/*
Test URLs
https://github.com/refined-github/sandbox/compare/linked-commit-title?expand=1
https://github.com/refined-github/sandbox/compare/rendered-commit-title?expand=1
*/
