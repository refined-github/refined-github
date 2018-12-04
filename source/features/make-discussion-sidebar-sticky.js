import select from 'select-dom';
import debounce from 'debounce-fn';
import ghInjection from 'github-injection';
import * as pageDetect from '../libs/page-detect';

function updateStickiness() {
	const sidebar = select('.discussion-sidebar');
	const sidebarHeight = sidebar.offsetHeight + 25;
	sidebar.classList.toggle('rgh-sticky-sidebar', sidebarHeight < window.innerHeight);
}

const handler = debounce(updateStickiness, {wait: 100});

export default function () {
	ghInjection(() => {
		if (pageDetect.isIssue() || pageDetect.isPRConversation()) {
			updateStickiness();
			window.addEventListener('resize', handler);
		} else {
			window.removeEventListener('resize', handler);
		}
	});
}
