import React from 'dom-chef';
import domify from 'doma';
import * as pageDetect from 'github-url-detection';
import mem from 'mem';

import features from '../feature-manager.js';
import {getCleanPathname} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

type GistData = {
	div: string;
	files: unknown[];
	stylesheet: string;
};

// Fetch via background.js due to CORB policies. Also memoize to avoid multiple requests.
const fetchGist = mem(
	async (url: string): Promise<GistData> =>
		browser.runtime.sendMessage({fetchJSON: `${url}.json`}),
);

function parseGistLink(link: HTMLAnchorElement): string | undefined {
	if (link.host === 'gist.github.com') {
		return getCleanPathname(link);
	}

	if (link.host === location.host && link.pathname.startsWith('gist/')) {
		return link.pathname.replace('/gist', '').replace(/\/$/, '');
	}

	return undefined;
}

// TODO: Replace with updated github-url-detection: isGistFile(link)
function isGist(link: HTMLAnchorElement): boolean {
	return parseGistLink(link)?.replace(/[^/]/g, '').length === 1; // Exclude user links and file links
}

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
			const container = <div/>;
			container.attachShadow({mode: 'open'}).append(
				<style>{`
					.gist .gist-data {
						max-height: 16em;
						overflow-y: auto;
					}
				`}
				</style>,
				<link rel="stylesheet" href={gistData.stylesheet}/>,
				domify.one(gistData.div)!,
			);
			link.parentElement!.after(container);
			info.remove();
		}
	} catch {
		info.remove();
	}
}

function init(signal: AbortSignal): void {
	observe('.js-comment-body p a:only-child', link => {
		if (isGist(link) && isOnlyChild(link)) {
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
