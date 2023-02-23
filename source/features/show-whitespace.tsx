import './show-whitespace.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {codeElementsSelector} from '../github-helpers/dom-formatters';
import showWhiteSpacesOnLine from '../helpers/show-whitespace-on-line';
import onAbort from '../helpers/abort-controller';
import observe from '../helpers/selector-observer';

const viewportObserver = new IntersectionObserver(changes => {
	for (const {target: line, isIntersecting} of changes) {
		if (isIntersecting) {
			const shouldAvoidSurroundingSpaces = Boolean(line.closest('.blob-wrapper-embedded')); // #2285
			showWhiteSpacesOnLine(line, shouldAvoidSurroundingSpaces);
			viewportObserver.unobserve(line);
		}
	}
});

function showWhitespaceWhenInViewport(line: HTMLElement): void {
	viewportObserver.observe(line);
}

function init(signal: AbortSignal): void {
	observe(`:is(${codeElementsSelector.join(',')}):not(.blob-code-hunk)`, showWhitespaceWhenInViewport, {signal});
	onAbort(signal, viewportObserver);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasCode,
	],
	init,
});

/*
TEST URL
https://github.com/refined-github/sandbox/pull/18
*/
