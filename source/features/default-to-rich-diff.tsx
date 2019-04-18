import select from 'select-dom';
import features from '../libs/features';

function run() {
	const buttons = select.all<HTMLButtonElement>(`
		[data-file-type=".svg"]
		[aria-label="Display the rich diff"]:not(.rgh-rich-diff)
	`);
	for (const button of buttons) {
		button.classList.add('rgh-rich-diff');

		// The ajax form handler might not be ready yet, so without this the page would change
		button.form!.addEventListener('submit', event => event.preventDefault());

		button.click();
	}
}

function init() {
	// Arbitrary timeout because the form handler might not be ready yet
	setTimeout(run, 1000);

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
