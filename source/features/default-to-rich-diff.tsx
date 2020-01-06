import select from 'select-dom';
import delegate from 'delegate-it';
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
	delegate('include-fragment.diff-progressive-loader', 'load', run);
}

features.add({
	disabled: '#2041',
	id: __featureName__,
	description: 'Renders the rich diff by default in SVG files’ diffs.',
	screenshot: 'https://user-images.githubusercontent.com/5243867/57125552-c08a2b00-6d81-11e9-9b84-cdb535baa98e.png',
	include: [
		features.isCommit,
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
