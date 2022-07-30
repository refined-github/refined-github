import './show-whitespace.css';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onNewComments from '../github-events/on-new-comments';
import {onDiffFileLoad} from '../github-events/on-fragment-load';
import {codeElementsSelector} from '../github-helpers/dom-formatters';
import showWhiteSpacesOnLine from '../helpers/show-whitespace-on-line';
import onAbort from '../helpers/abort-controller';

const viewportObserver = new IntersectionObserver(changes => {
	for (const {target: line, isIntersecting} of changes) {
		if (isIntersecting) {
			const shouldAvoidSurroundingSpaces = Boolean(line.closest('.blob-wrapper-embedded')); // #2285
			showWhiteSpacesOnLine(line, shouldAvoidSurroundingSpaces);
			viewportObserver.unobserve(line);
		}
	}
});

function observeWhiteSpace(): void {
	for (const line of select.all(`:is(${codeElementsSelector}):not(.rgh-observing-whitespace, .blob-code-hunk)`)) {
		line.classList.add('rgh-observing-whitespace');
		viewportObserver.observe(line);
	}
}

function init(signal: AbortSignal): void {
	observeWhiteSpace();

	// Show whitespace on new review suggestions #2852
	// This event is not very reliable as it also triggers when review comments are edited or deleted
	delegate(document, '.js-pull-refresh-on-pjax', 'socket:message', observeWhiteSpace, {capture: true, signal});
	onAbort(signal, viewportObserver);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasCode,
	],
	additionalListeners: [
		onNewComments,
		onDiffFileLoad,
	],
	deduplicate: '.rgh-observing-whitespace',
	init,
});

/*
TEST URL
https://github.com/refined-github/sandbox/pull/18
*/
