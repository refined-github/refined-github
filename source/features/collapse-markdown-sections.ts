import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const allHeadingsSelector = 'h1, h2, h3, h4, h5, h6';

function toggleSection(event: delegate.Event<MouseEvent, HTMLElement>): void {
	const sectionHeading = event.delegateTarget;
	const sectionState = sectionHeading.classList.contains('rgh-markdown-section-collapsed');
	sectionHeading.classList.toggle('rgh-markdown-section-collapsed');

	let element = sectionHeading.nextElementSibling as HTMLElement;
	while (element) {
		if (element.matches(allHeadingsSelector)) {
			if (sectionHeading.tagName.localeCompare(element.tagName) >= 0) {
				return;
			}

			element.classList.toggle('rgh-markdown-section-collapsed', !sectionState);
		} else {
			element.hidden = !sectionState;
		}

		element = element.nextElementSibling as HTMLElement;
	}
}

function init(): void {
	delegate(document, `.markdown-body > :is(${allHeadingsSelector})`, 'click', toggleSection);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
		() => pageDetect.isSingleFile() && location.pathname.endsWith('.md')
	],
	init
});
