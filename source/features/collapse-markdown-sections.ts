import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleSection(sectionHeading: HTMLElement): void {
	const isSectionHidden = sectionHeading.classList.toggle('rgh-markdown-section-collapsed');
	let element = sectionHeading.nextElementSibling as HTMLElement;
	while (element) {
		if (/^H\d$/.test(element.tagName)) {
			if (element.tagName <= sectionHeading.tagName) {
				return;
			}

			element.classList.toggle('rgh-markdown-section-collapsed', isSectionHidden);
		} else {
			element.hidden = isSectionHidden;
		}

		element = element.nextElementSibling as HTMLElement;
	}
}

function toggleAllTopSections(): void {
	for (const topHeading of select.all('.markdown-body > h1')) {
		toggleSection(topHeading);
	}
}

function toggleSingleSection({delegateTarget: sectionHeading}: delegate.Event<MouseEvent, HTMLElement>): void {
	toggleSection(sectionHeading);
}

function init(): void {
	delegate(document, '.markdown-body > h1', 'click', toggleAllTopSections);
	delegate(document, '.markdown-body > :is(h2, h3, h4, h5, h6)', 'click', toggleSingleSection);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree,
		() => pageDetect.isSingleFile() && location.pathname.endsWith('.md')
	],
	init
});
