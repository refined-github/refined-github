import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function isSameLevelHeading(element: HTMLElement, heading: HTMLElement): boolean {
	return element.tagName === heading.tagName;
}

function isHigherLevelHeading(element: HTMLElement, heading: HTMLElement): boolean {
	return /^H[1-6]$/.test(element.tagName) && element.tagName.localeCompare(heading.tagName) < 0;
}

function toggleSection(event: delegate.Event<MouseEvent, HTMLElement>): void {
	let sectionHeading = (event.target as HTMLElement).closest<HTMLElement>('h2, h3, h4, h5, h6')!;
	const sectionState = sectionHeading.classList.contains('rgh-markdown-section-collapsed');
	if (event.altKey) {
		// Set `sectionHeading` as the first same-level header of the larger section
		for (let element = sectionHeading; element && !isHigherLevelHeading(element, sectionHeading); element = element.previousElementSibling as HTMLElement) {
			if (isSameLevelHeading(element, sectionHeading)) {
				sectionHeading = element;
			}
		}
	}

	for (let element = sectionHeading; element && !isHigherLevelHeading(element, sectionHeading); element = element.nextElementSibling as HTMLElement) {
		if (isSameLevelHeading(element, sectionHeading)) {
			if (element.isSameNode(sectionHeading) || event.altKey) {
				element.classList.toggle('rgh-markdown-section-collapsed', !sectionState);
				continue;
			}

			break;
		}

		element.hidden = !sectionState;
	}
}

function init(): void {
	delegate(document, 'h2, h3, h4, h5, h6', 'click', toggleSection);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
		() => pageDetect.isSingleFile() && location.pathname.endsWith('.md')
	],
	init
});
