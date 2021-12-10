import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int.js';

/*
The ajaxed form that loads the new comments points to a URL like:
/_render_node/MDExOlB1bGxSZXF1ZXN0MjE2MDA0MzU5/timeline/more_items?variables%5Bafter%5D=Y3Vyc29yOnYyOpPPAAABZemjg2AAqTQyMjE5MTk1MQ%3D%3D&variables%5Bbefore%5D=Y3Vyc29yOnYyOpPPAAABaENrVHAAqTQ1Mzc3MjMzNg%3D%3D&variables%5Bfirst%5D=60&variables%5BhasFocusedReviewComment%5D=false&variables%5BhasFocusedReviewThread%5D=false
The parameter `variables[first]` controls how many additional comments are fetched. We change this number from 60 to the total number of hidden items to have it load all of them at once.
*/
function handleAltClick(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	if (!event.altKey) {
		return;
	}

	const form = event.delegateTarget.form!;
	const hiddenItemsCount = Math.min(
		200, // It fails with more than this https://github.com/refined-github/refined-github/issues/2931#issuecomment-603818778
		looseParseInt(form),
	);

	const url = new URL(form.action);
	url.searchParams.set('variables[first]', String(hiddenItemsCount));
	form.action = url.href;
}

function init(): void {
	delegate(document, '.ajax-pagination-form button[type="submit"]', 'click', handleAltClick);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
