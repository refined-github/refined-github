import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import {looseParseInt} from '../github-helpers';

async function init(): Promise<void | false> {
	const commitCount = await elementReady<HTMLElement>('.overall-summary > ul > li:nth-child(1) .text-emphasized');

	if (!commitCount || looseParseInt(commitCount.textContent!) < 2 || select.exists('.existing-pull')) {
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
	description: 'Sync a new pr message when there is more then one commit.',
	screenshot: ''
}, {
	include: [
		pageDetect.isCompare
	],
	waitForDomReady: false,
	init
});
