import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	(await elementReady('#gollum-editor-submit'))!.before(
		<a
			className="flex-auto btn btn-danger float-left text-center mr-1"
			href={select('[name="gollum-editor"]')!.getAttribute('action')!}
		>
			Cancel
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isEditingWikiPage,
		pageDetect.isNewWikiPage
	],
	awaitDomReady: false,
	init
});
