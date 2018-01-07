import select from 'select-dom';
import debounce from 'debounce-fn';
import onAjaxedPages from 'github-injection';
import {isSingleFile} from '../libs/page-detect';

function updateStickiness() {
	const sidebar = select('.discussion-sidebar');
	const sidebarHeight = sidebar.offsetHeight + 25;
	sidebar.style.position = sidebarHeight < window.innerHeight ? 'sticky' : null;
}

const handler = debounce(updateStickiness, {wait: 100});

export default function () {
	onAjaxedPages(() => {
		if (isSingleFile()) {
			updateStickiness();
			window.addEventListener('resize', handler);
		} else {
			window.removeEventListener('resize', handler);
		}
	});
}
