import './collapse-markdown-sections.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function toggleAllSections(event: delegate.Event<MouseEvent, HTMLElement>): void {
	if (!event.altKey) {
		return;
	}

	const targetDetailElement = (event.target as HTMLElement).closest('details')!;
	for (const detailElement of select.all('details.rgh-markdown-section')) {
		if (!detailElement.isSameNode(targetDetailElement)) {
			detailElement.open = !targetDetailElement.open;
		}
	}
}

function init(): void {
	for (const sectionHeading of select.all('.markdown-body > h2')) {
		wrap(sectionHeading, <details open className="rgh-markdown-section"/>);
		wrap(sectionHeading, <summary/>);
	}

	/* Move top-level content blocks to the <details> element directly above them */
	for (const [index, sectionDetails] of [...select.all('.markdown-body > details').entries()].reverse()) {
		sectionDetails.append(...select.all(`.markdown-body > details:nth-of-type(${index + 1}) ~ :not(.rgh-markdown-section)`));
	}

	delegate(document, '.rgh-markdown-section > summary', 'click', toggleAllSections);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
		() => pageDetect.isSingleFile() && location.pathname.endsWith('.md')
	],
	init
});
