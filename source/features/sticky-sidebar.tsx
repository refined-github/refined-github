import './sticky-sidebar.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

const deinit: VoidFunction[] = [];

function getSidebarSelector(): string {
	return pageDetect.isRepoRoot() ? '.Layout-sidebar > .BorderGrid' : '#partial-discussion-sidebar';
}

function updateStickiness(): void {
	const sidebar = select(getSidebarSelector())!;
	const margin = pageDetect.isConversation() ? 60 : 0; // 60 matches sticky header's height
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebar.offsetHeight + margin < window.innerHeight);
}

const onResize = debounce(updateStickiness, {wait: 100});

function init(): void {
	const resizeObserver = new ResizeObserver(onResize);
	const selectObserver = observe(getSidebarSelector(), {
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
