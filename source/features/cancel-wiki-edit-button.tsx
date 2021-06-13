import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	(await elementReady('#gollum-editor-submit'))!.after(
		<a
			className="flex-auto btn btn-danger"
			href={location.href.replace(/\/_(edit|new)$/, '')}
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
