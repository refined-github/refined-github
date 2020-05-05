import './sticky-discussion-sidebar.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import onReplacedElement from '../libs/on-replaced-element';

const sideBarSelector = '#partial-discussion-sidebar, .discussion-sidebar';

function updateStickiness(): void {
	const sidebar = select(sideBarSelector)!;
	const sidebarHeight = sidebar.offsetHeight + 60; // 60 matches sticky header's height
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebarHeight < window.innerHeight);
}

const onResize = debounce(updateStickiness, {wait: 100});

function deinit(): void {
	window.removeEventListener('resize', onResize);
}

features.add({
	id: __filebasename,
	description: 'Makes the discussion sidebar sticky.',
	screenshot: 'https://user-images.githubusercontent.com/10238474/62276723-5a2eaa80-b44d-11e9-810b-ff598d1c5c6a.gif'
}, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPRConversation
	],
	additionalListeners: [
		() => window.addEventListener('resize', onResize),
		() => onReplacedElement(sideBarSelector, updateStickiness)
	],
	init: updateStickiness,
	deinit
});
