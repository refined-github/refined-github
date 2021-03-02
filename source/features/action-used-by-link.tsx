import React from 'jsx-dom';
import select from 'select-dom';
import {SearchIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const actionRepo = select('aside .octicon-repo')!
		.closest('a')!
		.pathname
		.slice(1);

	const actionURL = new URL('search', location.origin);
	actionURL.searchParams.set('q', `${actionRepo} path:.github/workflows/ language:YAML`);
	actionURL.searchParams.set('type', 'Code');
	actionURL.searchParams.set('s', 'indexed');
	actionURL.searchParams.set('o', 'desc');

	select('.d-block.mb-2[href^="/contact"]')!.after(
		<a href={String(actionURL)} className="d-block mb-2">
			<span className="text-gray-dark color-text-primary mr-2">
				<SearchIcon width={14}/>
			</span> Usage examples
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isMarketplaceAction
	],
	init
});
