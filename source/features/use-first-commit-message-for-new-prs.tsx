import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int';

async function init(): Promise<void | false> {
	const commitCount = await elementReady<HTMLElement>([
		'.overall-summary > ul > li:nth-child(1) .text-emphasized', // Cross fork
		'[href="#commits_bucket"] .Counter' // Same repository
	].join());

	if (!commitCount || looseParseInt(commitCount.textContent!) < 2 || !select.exists('#new_pull_request')) {
		return false;
	}

	const [prTitle, ...prMessage] = select('#commits_bucket .commit-message code a')!.title.split(/\n\n/);

	textFieldEdit.set(
		select<HTMLInputElement>('.discussion-topic-header input')!,
		prTitle
	);
	textFieldEdit.insert(
		select<HTMLTextAreaElement>('#new_pull_request textArea[aria-label="Comment body"]')!,
		prMessage.join('\n\n')
	);
}

void features.add({
	id: __filebasename,
	description: 'Use the first commit for a new PR’s title and description.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/87246205-ccf42400-c419-11ea-86d5-0e6570d99e6e.gif'
}, {
	include: [
		pageDetect.isCompare
	],
	awaitDomReady: false,
	init
});
