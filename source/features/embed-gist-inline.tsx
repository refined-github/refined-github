import React from 'dom-chef';
import domify from 'doma';
import * as pageDetect from 'github-url-detection';
import mem from 'memoize';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {standaloneGistLinkInMarkdown} from '../github-helpers/selectors.js';
import {messageBackground} from '../helpers/messaging.js';

type GistData = {
	div: string;
	files: unknown[];
	stylesheet: string;
};

// Fetch via background.js due to CORB policies. Also memoize to avoid multiple requests.
const fetchGist = mem(
	async (url: string): Promise<GistData> =>
		messageBackground({fetchJSON: `${url}.json`}),
);

const isOnlyChild = (link: HTMLAnchorElement): boolean => link.textContent.trim() === link.parentElement!.textContent.trim();

async function embedGist(link: HTMLAnchorElement): Promise<void> {
	const info = <em> (loading)</em>;
	link.after(info);

	try {
		const gistData = await fetchGist(link.href);
		if (gistData.div.length > 10_000) {
			info.textContent = ' (too large to embed)';
			return;
		}

		const fileCount: number = gistData.files.length;
		if (fileCount > 1) {
			info.textContent = ` (${fileCount} files)`;
		} else {
			const container = <div />;
			container.attachShadow({mode: 'open'}).append(
				<style>{`
					.gist .gist-data {
						max-height: 16em;
						overflow-y: auto;
					}
				`}
				</style>,
				<link rel="stylesheet" href={gistData.stylesheet} />,
				domify.one(gistData.div)!,
			);
			link.parentElement!.after(container);
			info.remove();
		}
	} catch (error) {
		info.remove();
		throw error;
	}
}

function init(signal: AbortSignal): void {
	observe(standaloneGistLinkInMarkdown, link => {
		if (pageDetect.isGist(link) && isOnlyChild(link)) {
			void embedGist(link);
		}
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/issues/77

*/
