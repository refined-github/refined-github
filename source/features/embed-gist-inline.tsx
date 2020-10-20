import React from 'dom-chef';
import domify from 'doma';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const isGist = (link: HTMLAnchorElement): boolean =>
	!link.pathname.includes('.') && // Exclude links to embed files
	(
		(link.hostname.startsWith('gist.') && link.pathname.includes('/', 1)) || // Exclude user links
		link.pathname.startsWith('gist/')
	);

const isOnlyChild = (link: HTMLAnchorElement): boolean => link.textContent!.trim() === link.parentNode!.textContent!.trim();

async function embedGist(link: HTMLAnchorElement): Promise<void> {
	const info = <em> (loading)</em>;
	link.after(info);

	try {
		// Get the gist via background.js due to CORB policies introduced in Chrome 73
		const gistData = await browser.runtime.sendMessage({request: `${link.href}.json`, json: true});

		const files = domify.one(gistData.div)!;
		const fileCount = files.children.length;

		if (fileCount > 1) {
			info.textContent = ` (${fileCount} files)`;
		} else {
			link.parentElement!.attachShadow({mode: 'open'}).append(
				<style>{`
					.gist .gist-data {
						max-height: 16em;
						overflow-y: auto;
					}
				`}
				</style>,
				<link rel="stylesheet" href={gistData.stylesheet}/>,
				files
			);
		}
	} catch {
		info.remove();
	}
}

function init(): void {
	select.all<HTMLAnchorElement>('.js-comment-body p a:only-child')
		.filter(item => isGist(item) && isOnlyChild(item))
		.forEach(embedGist);
}

void features.add({
	id: __filebasename,
	description: 'Embeds linked gists. Not supported by Firefox.',
	screenshot: 'https://user-images.githubusercontent.com/6978877/33911900-c62ee968-df8b-11e7-8685-506ffafc60b4.PNG'
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
