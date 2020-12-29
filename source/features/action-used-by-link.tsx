import React from 'dom-chef';
import {SearchIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const actionRepo = $('aside .octicon-repo')!
		.closest('a')!
		.pathname
		.slice(1);

	const actionURL = new URL('search', location.origin);
	actionURL.searchParams.set('q', `${actionRepo} path:.github/workflows/ language:YAML`);
	actionURL.searchParams.set('type', 'Code');
	actionURL.searchParams.set('s', 'indexed');
	actionURL.searchParams.set('o', 'desc');

	$('.d-block.mb-2[href^="/contact"]')!.after(
		<a href={String(actionURL)} className="d-block mb-2">
			<SearchIcon width={14} className="text-gray-dark mr-2"/>Usage examples
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isMarketplaceAction
	],
	init
});
