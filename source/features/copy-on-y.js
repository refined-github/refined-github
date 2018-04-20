import select from 'select-dom';
import ghInjection from 'github-injection';
import copyToClipboard from 'copy-text-to-clipboard';
import * as pageDetect from '../libs/page-detect';

const handler = ({key, target}) => {
	if (key === 'y' && target.nodeName !== 'INPUT') {
		const permalink = select('.js-permalink-shortcut').href;
		copyToClipboard(permalink + location.hash);
	}
};

export default function () {
	ghInjection(() => {
		if (pageDetect.isSingleFile()) {
			window.addEventListener('keyup', handler);
		} else {
			window.removeEventListener('keyup', handler);
		}
	});
}
