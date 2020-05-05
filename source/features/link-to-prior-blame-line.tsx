import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	for (const link of select.all<HTMLAnchorElement>('.reblame-link')) {
		const lineNumber = link.closest('.blame-hunk')!.querySelector('.js-line-number[id]')!.id;
		link.hash = `#${lineNumber}`;
	}
}

features.add({
	id: __filebasename,
	description: 'Preserves the current line on “View blame prior to this change” links.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/60064482-26b47e00-9733-11e9-803c-c113ea612fbe.png'
}, {
	include: [
		pageDetect.isBlame
	],
	init
});
