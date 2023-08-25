import './sticky-sidebar.css';
import debounce from 'debounce-fn';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import onAbort from '../helpers/abort-controller.js';
import calculateCssCalcString from '../helpers/calculate-css-calc-string.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

const minimumViewportWidthForSidebar = 768; // Less than this, the layout is single-column

// The first selector in the parentheses is for the repo root, the second one for conversation pages
const sidebarSelector = '.Layout-sidebar :is(.BorderGrid, #partial-discussion-sidebar)';

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
	sidebar = foundSidebar;
	sidebarObserver.observe(sidebar);
	onAbort(signal, sidebarObserver, () => {
		sidebar = undefined;
	});

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
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isConversation,
	],
	exclude: [
		() => screen.availWidth < minimumViewportWidthForSidebar,
	],
	init,
});

/*

Test URLs:

Repo: https://github.com/refined-github/refined-github
Conversation: https://github.com/refined-github/refined-github/issues/6752

*/
