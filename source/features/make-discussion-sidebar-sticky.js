import select from 'select-dom';
import debounce from 'debounce-fn';
import ghInjection from 'github-injection';
import * as pageDetect from '../libs/page-detect';

function updateStickiness() {
	const sidebar = select('.discussion-sidebar');
	const sidebarHeight = sidebar.offsetHeight + 25;
	if (sidebarHeight < window.innerHeight) {
		sidebar.style.position = 'sticky';
		sidebar.style.zIndex = 26;
	} else {
		sidebar.style.position = null;
		sidebar.style.zIndex = null;
	}
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
