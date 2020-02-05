import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function handleAltClick(event: DelegateEvent<MouseEvent, HTMLFormElement>): void {
	if (!event.altKey) {
		return;
	}

	const form = event.delegateTarget;

	const buttons = select.all('button', form);
	const remainCommentsButton = buttons.find(button => /\s*\d+ hidden items\s*/.test(button.textContent!))!;
	const remainComments = remainCommentsButton.textContent!.replace(/\D+/g, '');

	/**
	As per #2625:
	Construct the new URL. This is undocumented, and may break at any time.
	As of 12/08/2019, URLs look like this:
	`/_render_node/MDExOlB1bGxSZXF1ZXN0MjE2MDA0MzU5/timeline/more_items?variables%5Bafter%5D=Y3Vyc29yOnYyOpPPAAABZemjg2AAqTQyMjE5MTk1MQ%3D%3D&variables%5Bbefore%5D=Y3Vyc29yOnYyOpPPAAABaENrVHAAqTQ1Mzc3MjMzNg%3D%3D&variables%5Bfirst%5D=60&variables%5BhasFocusedReviewComment%5D=false&variables%5BhasFocusedReviewThread%5D=false`
	The key "variables[first]" in the URL query parameters appears to control how many additional comments are fetched.
	Github appears to always set this to 60, but it can be increased up to the total number of hidden items.
	By setting "variables[first]" to total number of hidden items (extracted from the button tex), we can fetch all hidden comments at once.
	 */
	const url = new URL(form.action);
	url.searchParams.set('variables[first]', remainComments);
	form.action = url.href;
}

function init(): void {
	delegate('.ajax-pagination-form', 'click', handleAltClick);
}

features.add({
	id: __featureName__,
	description: 'On long discussions where GitHub hides comments under a "Load more...", alt-clicking "Load more..." will load *all* the comments at once instead of part of them.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/73838332-0c548e00-4846-11ea-935f-28d728b30ae9.png',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
