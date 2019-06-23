import select from 'select-dom';
import features from '../libs/features';

function run(): void {
	const buttons = select.all<HTMLButtonElement>(`
		[data-file-type=".svg"]
		[aria-label="Display the rich diff"]:not(.rgh-rich-diff)
	`);
	for (const button of buttons) {
		button.classList.add('rgh-rich-diff');

		// The ajax form handler might not be ready yet, so without this the page would change
		button.form!.addEventListener('submit', event => event.preventDefault());

		button.click();

		const interval = setInterval(() => {
			// Either button is selected (the last one to be clicked on) or rich diff container is being rendered
			if (button.classList.contains('selected') || button.closest('.js-details-container')!.querySelector('.render-wrapper')) {
				clearInterval(interval);
			} else {
				button.disabled = false;
				button.click();
			}
		}, 300);
	}
}

function init(): void {
	run();

	// Some files are loaded progressively later. On load, look for more buttons and more fragments
	for (const fragment of select.all('include-fragment.diff-progressive-loader')) {
		fragment.addEventListener('load', init);
	}
}

features.add({
	disabled: 'https://github.com/sindresorhus/refined-github/issues/2041', // TODO
	id: __featureName__,
	description: 'Some of the files in pull requests can be reviewed using a rich-diff mode, for example, Markdown and SVG. This feature sets the rich-diff view as default in pull requests for files with a rich diff.',
	include: [
		features.isCommit,
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
