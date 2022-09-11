import './sticky-sidebar.css';
import debounce from 'debounce-fn';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observe from '../helpers/selector-observer';
import onAbort from '../helpers/abort-controller';

let sidebar: HTMLElement;
let isHovered = false;
const onResize = debounce(updateStickiness, {wait: 100});
const resizeObserver = new ResizeObserver(onResize);

function toggleHoverState(event: MouseEvent): void {
	isHovered = event.type === 'mouseenter';
}

// Can't use delegate because it's not efficient to track mouse events across the document
function trackSidebar(foundSidebar: HTMLElement, signal: AbortSignal): void {
	sidebar = foundSidebar;
	resizeObserver.observe(sidebar, {box: 'border-box'});

	sidebar.addEventListener('mouseenter', toggleHoverState, {signal});
	sidebar.addEventListener('mouseleave', toggleHoverState, {signal});
}

function updateStickiness(): void {
	if (isHovered) {
		return;
	}

	const margin = pageDetect.isConversation() ? 60 : 0; // 60 matches sticky header's height
	sidebar.classList.toggle(
		'rgh-sticky-sidebar',
		sidebar.offsetHeight + margin < window.innerHeight,
	);
}


function init(signal: AbortSignal): void {
	isHovered = false;
	document.documentElement.classList.add('rgh-sticky-sidebar-enabled');

	window.addEventListener('resize', onResize, {signal});
	window.addEventListener('load', onResize, {signal});

	observe(
		// The first selector in the parentheses is for the repo root, the second one for conversation pages
		'.Layout-sidebar :is(.BorderGrid, #partial-discussion-sidebar)',
		element => {
			trackSidebar(element, signal);
		},
		{signal},
	);
	updateStickiness();
	onAbort(signal, resizeObserver);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isConversation,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
	],
	deduplicate: false,
	init,
});
