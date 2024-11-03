import React from 'dom-chef';
// import domify from 'doma';
import CodeSquare from 'octicons-plain-react/CodeSquare';
import * as pageDetect from 'github-url-detection';
import mem from 'memoize';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import { searchResultFileName } from '../github-helpers/selectors.js';
import { messageBackground } from '../helpers/messaging.js';

type GistData = {
	div: string;
	files: unknown[];
	stylesheet: string;
};

// Fetch via background.js due to CORB policies. Also memoize to avoid multiple requests.
const fetchFile = mem(
	async (url: string): Promise<GistData> =>
		messageBackground({ fetchJSON: `${url}.json` }),
);

function init(signal: AbortSignal): void {
	observe(searchResultFileName, link => {
		link.parentNode?.prepend(
			<a
				href="#"
				title="Preview File"
				className="self-end px-2"
				onClick={async event => {
					event.preventDefault();
					console.log('click.event', event);
				}}
			>
				<CodeSquare />
			</a>,
		);

		// if (pageDetect.isGlobalSearchResults(link.href)) {
		// 	const a = fetchFile(link.href);
		// 	console.log('found', a);
		// }
	}, { signal });
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isGlobalSearchResults,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/issues/77

*/
