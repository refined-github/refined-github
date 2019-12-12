import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	// Retrieve the form associated with the "X Hidden Items\nLoad More" button
	const form = select('form.ajax-pagination-form');
	if (form) {
		// The first button, which has the text "X hidden items".
		const button = select('button', form);
		if (button) {
			// Extract the number of hidden items from the button text
			const numberString = button.textContent?.trim()?.split(' ')[0];
			if (numberString) {
				// Construct the new URL. This is undocumented, and may break at any time.
				// As of 12/08/2019, URLS look like this:
				// "/_render_node/MDExOlB1bGxSZXF1ZXN0MjE2MDA0MzU5/timeline/more_items?variables%5Bafter%5D=Y3Vyc29yOnYyOpPPAAABZemjg2AAqTQyMjE5MTk1MQ%3D%3D&variables%5Bbefore%5D=Y3Vyc29yOnYyOpPPAAABaENrVHAAqTQ1Mzc3MjMzNg%3D%3D&variables%5Bfirst%5D=60&variables%5BhasFocusedReviewComment%5D=false&variables%5BhasFocusedReviewThread%5D=false"
				// The key "variables[first]" in the URL query parameters appears to control
				// how many additional comments are fetched.
				// Github appears to always set this to 60, but it can be increased up to the
				// total number of hidden items.
				// By setting "variables[first]" to total number of hidden items (extracted from the button tex),
				// we can fetch all hidden comments at once
				const url = new URL('https://github.com' + (form.getAttribute('action')?.toString() || ''));
				url.searchParams.set('variables[first]', numberString);
				form.setAttribute('action', url.toString());

				// Trigger a button click, causing the page to fetch and display
				// the hidden comments.
				// For some reason, trying to do this immediately (without setTimeout)
				// causes the browser to navigate to the actual URL (e.g. https://github.com//_render_node/...)
				// instead of triggering the proper Github event handler.
				// It seems likely that the event handler isn't yet registered when this function runs.
				// Delaying the button clock with setTimeout() appears to cause the event
				// handler to be consistently triggered, resulting in the desired behavior
				setTimeout(() => button.click(), 0);
			}
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Simplify the GitHub interface and adds useful features',
	screenshot: false,
	include: [
		features.hasComments
	],
	load: features.onAjaxedPages,
	init
});
