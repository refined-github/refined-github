import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int';

async function init(): Promise<void | false> {
	const requestedContent = new URL(location.href).searchParams;
	const commitCountIcon = await elementReady('div.Box.mb-3 .octicon-git-commit');
	const commitCount = commitCountIcon?.nextElementSibling;
	if (!commitCount || looseParseInt(commitCount) < 2 || !select.exists('#new_pull_request')) {
		return false;
	}

	const prTitle = select('.js-commits-list-item p')!;
	const prBody = prTitle.parentElement!.querySelector('.Details-content--hidden pre');
	if (!requestedContent.has('pull_request[title]')) {
		textFieldEdit.set(
			select('.discussion-topic-header input')!,
			prTitle.textContent!.trim(),
		);
	}

	if (prBody && !requestedContent.has('pull_request[body]')) {
		textFieldEdit.insert(
			select('#new_pull_request textarea[aria-label="Comment body"]')!,
			prBody.textContent!,
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
