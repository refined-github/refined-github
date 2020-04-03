import './sticky-discussion-sidebar.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import onDomReady from 'dom-loaded';
import features from '../libs/features';
import onUpdatableContentUpdate from '../libs/on-updatable-content-update';

const sideBarSelector = '#partial-discussion-sidebar, .discussion-sidebar';

function updateStickiness(): void {
	const sidebar = select(sideBarSelector)!;
	const sidebarHeight = sidebar.offsetHeight + 60; // 60 matches sticky header's height
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebarHeight < window.innerHeight);
}

const handler = debounce(updateStickiness, {wait: 100});

async function init(): Promise<void> {
	await onDomReady;
	updateStickiness();
	window.addEventListener('resize', handler);
	onUpdatableContentUpdate(select(sideBarSelector)!, updateStickiness);
}

function deinit(): void {
	window.removeEventListener('resize', handler);
}

features.add({
	id: __featureName__,
	description: 'Makes the discussion sidebar sticky.',
	screenshot: 'https://user-images.githubusercontent.com/10238474/62276723-5a2eaa80-b44d-11e9-810b-ff598d1c5c6a.gif'
}, {
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPagesRaw,
	init,
	deinit
});
