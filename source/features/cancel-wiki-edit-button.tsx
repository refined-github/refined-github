import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	const submitButton = await elementReady('button#gollum-editor-submit');
	submitButton!.before(
		<a
			className="flex-auto btn btn-danger float-left text-center mr-1"
			href={submitButton!.form!.action}
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
