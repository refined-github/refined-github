import './sticky-sidebar.css';

import debounce from 'debounce-fn';
import * as pageDetect from 'github-url-detection';
import {onAbort} from 'abort-utils';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import calculateCssCalcString from '../helpers/calculate-css-calc-string.js';

const minimumViewportWidthForSidebar = 768; // Less than this, the layout is single-column

const sidebarSelector = [
	'.Layout-sidebar .BorderGrid', // `isRepoRoot`
	'div[data-testid="issue-viewer-metadata-pane"]', // Issue `isConversation`. TODO: Remove after March 2026
	'#partial-discussion-sidebar', // `isDiscussion`, old `isPRConversation`
];

let sidebar: HTMLElement | undefined;
const onResize = debounce(updateStickiness, {wait: 100});
const sidebarObserver = new ResizeObserver(onResize);

// Avoid disabling the stickiness while the user is interacting with it
function toggleHoverState(event: MouseEvent): void {
	const isHovered = event.type === 'mouseenter';
	if (isHovered) {
		sidebarObserver.disconnect();
	} else {
		// Also immediately calls `onResize`, so it has the welcome side effect of unsticking the sidebar if its height changes
		sidebarObserver.observe(sidebar!);
	}
}

// Can't use delegate because it's not efficient to track mouse events across the document
function trackSidebar(signal: AbortSignal, foundSidebar: HTMLElement): void {
	if (elementExists('[data-testid="sticky-sidebar"]', foundSidebar)) {
		return;
	}

	sidebar = foundSidebar;
	sidebarObserver.observe(sidebar);
	onAbort(signal, sidebarObserver, () => {
		sidebar = undefined;
	});

	sidebar.classList.add('rgh-sticky-sidebar-container');

	sidebar.addEventListener('mouseenter', toggleHoverState, {signal});
	sidebar.addEventListener('mouseleave', toggleHoverState, {signal});
}

function updateStickiness(): void {
	if (!sidebar) {
		return;
	}

	const offset = calculateCssCalcString(getComputedStyle(sidebar).getPropertyValue('--rgh-sticky-sidebar-offset'));
	sidebar.classList.toggle(
		'rgh-sticky-sidebar',
		window.innerWidth >= minimumViewportWidthForSidebar
		&& sidebar.offsetHeight + offset < window.innerHeight,
	);
}

function init(signal: AbortSignal): void {
	document.documentElement.setAttribute('rgh-sticky-sidebar-enabled', '');

	// The element is recreated when the page is updated
	// `trackSidebar` also triggers the first update via `sidebarObserver.observe()`
	observe(sidebarSelector, trackSidebar.bind(undefined, signal), {signal});

	// Update it when the window is resized
	window.addEventListener('resize', onResize, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isConversation,
		pageDetect.isDiscussion,
	],
	exclude: [
		() => screen.availWidth < minimumViewportWidthForSidebar,
	],
	init,
});

/*

Test URLs:

- Repo: https://github.com/refined-github/refined-github
- Issue conversation: https://github.com/refined-github/refined-github/issues/6752
- PR conversation: https://github.com/refined-github/refined-github/pull/755
- Discussion: https://github.com/orgs/community/discussions/40299

*/
