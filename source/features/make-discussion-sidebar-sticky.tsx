import './make-discussion-sidebar-sticky.css';
import select from 'select-dom';
import debounce from 'debounce-fn';
import features from '../libs/features';

function updateStickiness(): void {
	const sidebar = select<HTMLElement>('.discussion-sidebar')!;
	const sidebarHeight = sidebar.offsetHeight + 25 + 60; // 60 matches sticky header's height
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebarHeight < window.innerHeight);
}

const handler = debounce(updateStickiness, {wait: 100});

function init(): void {
	updateStickiness();
	window.addEventListener('resize', handler);
}

function deinit(): void {
	window.removeEventListener('resize', handler);
}

features.add({
	id: __featureName__,
	description: 'Makes the discussion filters bar sticky.',
	screenshot: 'https://user-images.githubusercontent.com/380914/39878141-7632e61a-542c-11e8-9c66-74fcd3a134aa.gif',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPagesRaw,
	init,
	deinit
});
