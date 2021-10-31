import './sticky-sidebar.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

const deinit: VoidFunction[] = [];

// The first class in parentheses is for the repo root, the second one for conversation pages
const sidebarSelector = '.Layout-sidebar > :is(.Border-grid, #partial-discussion-sidebar)';

function updateStickiness(): void {
	const sidebar = select(sidebarSelector)!;
	const margin = pageDetect.isConversation() ? 60 : 0; // 60 matches sticky header's height
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebar.offsetHeight + margin < window.innerHeight);
}

const onResize = debounce(updateStickiness, {wait: 100});

function init(): void {
	const resizeObserver = new ResizeObserver(onResize);
	const selectObserver = observe(sidebarSelector, {
		add(sidebar) {
			resizeObserver.observe(sidebar, {box: 'border-box'});
		},
	});
	window.addEventListener('resize', onResize);
	deinit.push(() => {
		selectObserver.abort();
		resizeObserver.disconnect();
		window.removeEventListener('resize', onResize);
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isConversation,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
	],
	deduplicate: 'has-rgh-inner',
	init,
	deinit,
});
