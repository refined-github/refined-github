import select from 'select-dom';
import features from '../libs/features';

function run() {
	const buttons = select.all<HTMLButtonElement>(`
		[data-file-type=".svg"]
		[aria-label="Display the rich diff"]:not(.rgh-rich-diff)
	`);
	for (const button of buttons) {
		button.classList.add('rgh-rich-diff');

		button.click();
	}
}

function init() {
	run();

	// Some files are loaded progressively later. On load, look for more buttons and more fragments
	for (const fragment of select.all('include-fragment.diff-progressive-loader')) {
		fragment.addEventListener('load', init);
	}
}

features.add({
	id: 'default-to-rich-diff',
	include: [
		features.isCommit,
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
