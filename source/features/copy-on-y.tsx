import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';

const handler = ({key, target}) => {
	if (key === 'y' && target.nodeName !== 'INPUT') {
		const permalink = (select('.js-permalink-shortcut') as HTMLAnchorElement).href;
		copyToClipboard(permalink + location.hash);
	}
};

function init() {
	window.addEventListener('keyup', handler);
}

function deinit() {
	window.removeEventListener('keyup', handler);
}

features.add({
	id: 'copy-on-y',
	include: [
		features.isSingleFile
	],
	load: features.onAjaxedPagesRaw,
	init,
	deinit
});
