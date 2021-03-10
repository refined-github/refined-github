import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleSection({delegateTarget: sectionHeading}: delegate.Event<MouseEvent, HTMLElement>): void {
	const isSectionHidden = sectionHeading.classList.toggle('rgh-markdown-section-collapsed');
	let element = sectionHeading.tagName === 'H1' ?
		sectionHeading.parentElement!.firstElementChild as HTMLElement :
		sectionHeading.nextElementSibling as HTMLElement;
	while (element) {
		if (/^H\d$/.test(element.tagName)) {
			if (sectionHeading.tagName !== 'H1' && element.tagName <= sectionHeading.tagName) {
				return;
			}

			element.classList.toggle('rgh-markdown-section-collapsed', isSectionHidden);
		} else {
			element.hidden = isSectionHidden;
		}

		element = element.nextElementSibling as HTMLElement;
	}
}

function init(): void {
	delegate(document, '.markdown-body > :is(h1, h2, h3, h4, h5, h6)', 'click', toggleSection);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree,
		() => pageDetect.isSingleFile() && location.pathname.endsWith('.md')
	],
	init
});
