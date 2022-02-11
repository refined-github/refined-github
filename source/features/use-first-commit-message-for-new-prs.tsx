import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int';

// TODO [2022-05-01]: Drop GHE code and merge function back in init
function getFirstCommitMessage(): string[] {
	if (pageDetect.isEnterprise()) {
		return select('#commits_bucket [data-url$="compare/commit"] a[title]')!.title.split('\n\n');
	}

	// Linkified commit summaries are split into several adjacent links #5382
	const commitSummary = select.all('#commits_bucket .js-commits-list-item:first-child .js-details-container > p > a')
		.map(commitTitleLink => commitTitleLink.innerHTML)
		.join('')
		.replace(/<\/?code>/g, '`');

	const commitDescription = select('#commits_bucket .js-commits-list-item pre')?.textContent ?? '';

	return [commitSummary, commitDescription];
}

async function init(): Promise<void | false> {
	const commitCountIcon = await elementReady('div.Box.mb-3 .octicon-git-commit');
	const commitCount = commitCountIcon?.nextElementSibling;
	if (!commitCount || looseParseInt(commitCount) < 2 || !select.exists('#new_pull_request')) {
		return false;
	}

	const [prTitle, ...prBody] = getFirstCommitMessage();
	textFieldEdit.set(
		select('.discussion-topic-header input')!,
		prTitle,
	);
	textFieldEdit.insert(
		select('#new_pull_request textarea[aria-label="Comment body"]')!,
		prBody.join('\n\n'),
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	awaitDomReady: false,
	init,
});
