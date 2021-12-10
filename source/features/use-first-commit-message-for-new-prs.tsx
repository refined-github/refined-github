import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int.js';

async function init(): Promise<void | false> {
	const commitCount = (await elementReady('div.Box.mb-3 .octicon-git-commit'))?.nextElementSibling;
	if (!commitCount || looseParseInt(commitCount) < 2 || !select.exists('#new_pull_request')) {
		return false;
	}

	const [prTitle, ...prMessage] = (pageDetect.isEnterprise()
		? select('#commits_bucket [data-url$="compare/commit"] a[title]')!.title // TODO [2022-05-01]: Remove GHE code
		: select('#commits_bucket .js-commits-list-item a.Link--primary')!.innerHTML.replace(/<\/?code>/g, '`')
	)!.split(/\n\n/);

	textFieldEdit.set(
		select('.discussion-topic-header input')!,
		prTitle,
	);
	textFieldEdit.insert(
		select('#new_pull_request textarea[aria-label="Comment body"]')!,
		prMessage.join('\n\n'),
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	awaitDomReady: false,
	init,
});
