// TODO: update position to avoid overlap with new top bar
// https://github.com/sindresorhus/refined-github/issues/1300#issuecomment-446856763
import select from 'select-dom';
import debounce from 'debounce-fn';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

function updateStickiness() {
	const sidebar = select('.discussion-sidebar');
	const sidebarHeight = sidebar.offsetHeight + 25;
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebarHeight < window.innerHeight);
}

const handler = debounce(updateStickiness, {wait: 100});

function init() {
	if (pageDetect.isIssue() || pageDetect.isPRConversation()) {
		updateStickiness();
		window.addEventListener('resize', handler);
	} else {
		window.removeEventListener('resize', handler);
	}
}

features.add({
	id: 'make-discussion-sidebar-sticky',
	load: features.onAjaxedPagesRaw,
	init
});
