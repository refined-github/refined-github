import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const link of select.all<HTMLAnchorElement>('.reblame-link')) {
		const lineNumber = link.closest('.blame-hunk')!.querySelector('.js-line-number[id]')!.id;
		link.hash = `#${lineNumber}`;
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isBlame
	],
	init
});
