import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';

const handler = ({key, target}: KeyboardEvent): void => {
	if (key === 'y' && (target as Element).nodeName !== 'INPUT') {
		const permalink = select<HTMLAnchorElement>('.js-permalink-shortcut')!.href;
		copyToClipboard(permalink + location.hash);
	}
};

function init(): void {
	window.addEventListener('keyup', handler);
}

function deinit(): void {
	window.removeEventListener('keyup', handler);
}

features.add({
	id: __featureName__,
	description: 'Add keyboard shortcut to copy the permalink of a file to the clipboard',
	include: [
		features.isSingleFile
	],
	load: features.onAjaxedPagesRaw,
	init,
	deinit
});
