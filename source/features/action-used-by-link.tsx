import React from 'dom-chef';
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
	actionURL.search = new URLSearchParams({
		q: `${actionRepo} path:.github/workflows/ language:YAML`,
		type: 'Code',
		s: 'indexed',
		o: 'desc',
	}).toString();

	select('.d-block.mb-2[href^="/contact"]')!.after(
		<a href={actionURL.href} className="d-block mb-2">
			<SearchIcon width={14} className="color-text-primary color-fg-default mr-2"/>Usage examples
		</a>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isMarketplaceAction,
	],
	init,
});
