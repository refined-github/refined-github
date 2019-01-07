import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';
import {isSingleFile} from '../libs/page-detect';

const handler = ({key, target}) => {
	if (key === 'y' && target.nodeName !== 'INPUT') {
		const permalink = select('.js-permalink-shortcut').href;
		copyToClipboard(permalink + location.hash);
	}
};

function init() {
	if (isSingleFile()) {
		window.addEventListener('keyup', handler);
	} else {
		window.removeEventListener('keyup', handler);
	}
}

features.add({
	id: 'copy-on-y',
	load: features.onAjaxedPages,
	init
});
