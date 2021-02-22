import './sticky-sidebar.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

// Both selectors are present on conversation pages so we need to discriminate
const sidebarSelector = pageDetect.isRepoRoot() ? '.repository-content .flex-column > :last-child [data-pjax]' : '#partial-discussion-sidebar';

function updateStickiness(): void {
	const sidebar = select(sidebarSelector)!;
	const margin = pageDetect.isConversation() ? 60 : 0; // 60 matches sticky header's height
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebar.offsetHeight + margin < window.innerHeight);
}

const onResize = debounce(updateStickiness, {wait: 100});

function init(): void {
	const observer = new ResizeObserver(onResize);
	observe(sidebarSelector, {
		add(sidebar) {
			observer.observe(sidebar, {box: 'border-box'});
		},
		remove() {
			observer.disconnect();
		}
	});
	window.addEventListener('resize', onResize);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isConversation
	],
	exclude: [
		pageDetect.isEmptyRepoRoot
	],
	init
});
