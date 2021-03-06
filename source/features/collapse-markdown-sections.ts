import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const allHeadingsSelector = 'h1, h2, h3, h4, h5, h6';

function isHeading(element: HTMLElement): boolean {
	return element.matches(allHeadingsSelector);
}

function isSameLevelHeading(referenceHeading: HTMLElement, compareHeading: HTMLElement): boolean {
	return referenceHeading.tagName === compareHeading.tagName;
}

function isHigherLevelHeading(referenceHeading: HTMLElement, compareHeading: HTMLElement): boolean {
	return referenceHeading.tagName.localeCompare(compareHeading.tagName) > 0;
}

function toggleSection(event: delegate.Event<MouseEvent, HTMLElement>): void {
	let sectionHeading = (event.target as HTMLElement).closest<HTMLElement>(allHeadingsSelector)!;
	const sectionState = sectionHeading.classList.contains('rgh-markdown-section-collapsed');
	if (event.altKey) {
		// Set `sectionHeading` as the first same-level header of the larger section
		for (let element = sectionHeading; element; element = element.previousElementSibling as HTMLElement) {
			if (!isHeading(element)) {
				continue;
			}
			if (isHigherLevelHeading(sectionHeading, element)) {
				break;
			}
			if (isSameLevelHeading(sectionHeading, element)) {
				sectionHeading = element;
			}
		}
	}

	for (let element = sectionHeading; element; element = element.nextElementSibling as HTMLElement) {
		if (isHeading(element)) {
			if (isHigherLevelHeading(sectionHeading, element)) {
				break;
			}
			if (isSameLevelHeading(sectionHeading, element) && !element.isSameNode(sectionHeading) && !event.altKey) {
				break;
			}

			element.classList.toggle('rgh-markdown-section-collapsed', !sectionState);
			continue;
		}

		element.hidden = !sectionState;
	}
}

function init(): void {
	delegate(document, allHeadingsSelector, 'click', toggleSection);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
		() => pageDetect.isSingleFile() && location.pathname.endsWith('.md')
	],
	init
});
