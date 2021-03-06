/** @jsx h */

import {h} from 'preact';
import select from 'select-dom';
import {SearchIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import render from '../helpers/render';

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

	render.after(
		<a href={String(actionURL)} className="d-block mb-2">
			<div ref={ref => ref && ref.replaceWith(SearchIcon({size: 14, className: 'text-gray-dark color-text-primary mr-2'}))}/>
			Usage examples
		</a>,
		select('.d-block.mb-2[href^="/contact"]')!,
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isMarketplaceAction
	],
	init
});
