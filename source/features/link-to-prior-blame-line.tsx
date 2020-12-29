import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const link of $$('a.reblame-link')) {
		const lineNumber = link.closest('.blame-hunk')!.$('.js-line-number[id]')!.id;
		link.hash = `#${lineNumber}`;
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isBlame
	],
	init
});
