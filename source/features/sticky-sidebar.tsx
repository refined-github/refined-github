import './sticky-sidebar.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

// The first selector in the parentheses is for the repo root, the second one for conversation pages
const sidebarSelector = '.Layout-sidebar :is(.BorderGrid, #partial-discussion-sidebar)';

function updateStickiness(): void {
	const sidebar = select(sidebarSelector)!;
	const margin = pageDetect.isConversation() ? 60 : 0; // 60 matches sticky header's height
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebar.offsetHeight + margin < window.innerHeight);
}

const onResize = debounce(updateStickiness, {wait: 100});

function init(signal: AbortSignal): Deinit[] {
	document.body.classList.add('rgh-sticky-sidebar-enabled');

	const resizeObserver = new ResizeObserver(onResize);
	const selectObserver = observe(sidebarSelector, {
		add(sidebar) {
			resizeObserver.observe(sidebar, {box: 'border-box'});
		},
	});
	window.addEventListener('resize', onResize, {signal});

	return [
		onResize.cancel,
		resizeObserver,
		selectObserver,
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isConversation,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
