import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

const regex = /\/_(edit|new)$/;

async function init(): Promise<void> {
	(await elementReady('#gollum-editor-submit'))!.after(
		<a
			className="flex-auto btn btn-danger"
			href={location.href.replace(regex, '')}
		>
			Cancel
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		() => pageDetect.isRepoWiki() && regex.test(location.href)
	],
	awaitDomReady: false,
	init
});
