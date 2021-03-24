import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isSingleMarkdownFile} from '../github-helpers';
import GitHubURL from '../github-helpers/github-url';

function init(): void {
	for (const image of select.all('.markdown-body a > img')) {
		const link = image.parentElement as HTMLAnchorElement;

		if (image.src === link.href) {
			link.replaceWith(image);
		}

		if (pageDetect.isSingleFile(link)) {
			const rawUrl = new GitHubURL(link.href).assign({route: 'raw'});

			if (image.src === rawUrl.href) {
				link.replaceWith(image);
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree,
		() => pageDetect.isSingleFile() && isSingleMarkdownFile()
	],
	init
});
