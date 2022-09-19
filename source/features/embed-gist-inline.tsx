import React from 'dom-chef';
import domify from 'doma';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getCleanPathname} from '../github-helpers';

function parseGistLink(link: HTMLAnchorElement): string | undefined {
	if (link.host === 'gist.github.com') {
		return getCleanPathname(link);
	}

	if (link.host === location.host && link.pathname.startsWith('gist/')) {
		return link.pathname.replace('/gist', '').replace(/\/$/, '');
	}

	return undefined;
}

function isGist(link: HTMLAnchorElement): boolean {
	return parseGistLink(link)?.replace(/[^/]/g, '').length === 1; // Exclude user links and file links
}

const isOnlyChild = (link: HTMLAnchorElement): boolean => link.textContent!.trim() === link.parentNode!.textContent!.trim();

async function embedGist(link: HTMLAnchorElement): Promise<void> {
	const info = <em> (loading)</em>;
	link.after(info);

	try {
		// Fetch via background.js due to CORB policies
		const gistData = await browser.runtime.sendMessage({fetchJSON: `${link.href}.json`});
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

function init(): void {
	for (const link of select.all('.js-comment-body p a:only-child')) {
		if (isGist(link) && isOnlyChild(link)) {
			void embedGist(link);
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	deduplicate: 'has-rgh',
	init,
});
