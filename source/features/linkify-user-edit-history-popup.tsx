import React from 'dom-chef';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	observe('details-dialog .Box-header .mr-3 img:not([alt*="[bot]"])', {
		add(element) {
			const userName = (element as HTMLImageElement).alt.slice(1);

			element.nextElementSibling!.replaceWith(
				<a
					className="link-gray-dark css-truncate-target v-align-middle text-bold text-small"
					href={`/${userName}`}
				>
					{userName}
				</a>
			);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Linkifies the username in the edit history popup.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/88803491-85d89380-d17a-11ea-9aad-53635ad7b699.png'
}, {
	init,
	include: [
		pageDetect.isIssue,
		pageDetect.isPRConversation
	],
	repeatOnAjax: false
});
