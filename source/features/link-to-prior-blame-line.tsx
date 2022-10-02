import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

function init(): void {
	for (const link of select.all('a.reblame-link')) {
		const lineNumber = link.closest('.blame-hunk')!.querySelector('.js-line-number[id]')!.id;
		link.hash = `#${lineNumber}`;
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isBlame,
	],
	deduplicate: 'has-rgh',
	init,
});
