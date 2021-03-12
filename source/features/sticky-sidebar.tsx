import './sticky-sidebar.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import {observe, Observer} from 'selector-observer';
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
const resizeObserver = new ResizeObserver(onResize);
let selectObserver: Observer;

function init(): void {
	selectObserver = observe(sidebarSelector, {
		add(sidebar) {
			resizeObserver.observe(sidebar, {box: 'border-box'});
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
	init,
	deinit: () => {
		resizeObserver.disconnect();
		window.removeEventListener('resize', onResize);
	}
});
