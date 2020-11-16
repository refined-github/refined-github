import './sticky-sidebar.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';

const sideBarSelector = [
	'#partial-discussion-sidebar', // Conversations
	'.repository-content .flex-column > :last-child [data-pjax]' // `isRepoRoot`
].join();

function updateStickiness(): void {
	const sidebar = select(sideBarSelector)!;
	const margin = pageDetect.isConversation() ? 60 : 0; // 60 matches sticky header's height
	const sidebarHeight = sidebar.offsetHeight + margin;
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebarHeight < window.innerHeight);
}

const onResize = debounce(updateStickiness, {wait: 100});

function deinit(): void {
	window.removeEventListener('resize', onResize);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isConversation
	],
	additionalListeners: [
		() => window.addEventListener('resize', onResize),
		() => void onReplacedElement(sideBarSelector, updateStickiness)
	],
	init: updateStickiness,
	deinit
});
