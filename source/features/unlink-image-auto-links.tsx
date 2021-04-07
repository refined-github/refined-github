import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isMarkdownFile} from '../github-helpers';
import GitHubURL from '../github-helpers/github-url';

function getRawUrl(link: HTMLAnchorElement): string {
	if (pageDetect.isSingleFile(link)) {
		const rawLink = new GitHubURL(link.href).assign({route: 'raw'});
		return rawLink.href;
	}

	return link.href;
}

function init(): void {
	for (const image of select.all('.markdown-body a > img')) {
		const link = image.parentElement as HTMLAnchorElement;

		if (image.src === getRawUrl(link)) {
			link.replaceWith(image);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree,
		() => pageDetect.isSingleFile() && isMarkdownFile()
	],
	init
});
