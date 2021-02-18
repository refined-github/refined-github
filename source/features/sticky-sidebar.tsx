import './sticky-sidebar.css';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const sidebarSelector = [
		'#partial-discussion-sidebar', // Conversations
		'.repository-content .flex-column > :last-child [data-pjax]' // `isRepoRoot`
	].join();

	const resizeObserver = new ResizeObserver(([{target: sidebar}]) => {
		const margin = pageDetect.isConversation() ? 60 : 0; // 60 matches sticky header's height
		sidebar.classList.toggle('rgh-sticky-sidebar', (sidebar as HTMLElement).offsetHeight + margin < window.innerHeight);
	});

	observe(sidebarSelector, {
		add(sidebar) {
			resizeObserver.observe(sidebar, {box: 'border-box'});
		}
	});
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
