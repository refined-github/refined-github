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
		const gistData = JSON.parse(await browser.runtime.sendMessage({request: `${link.href}.json`}));

		const fileCount = gistData.files.length;

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
				domify.one(gistData.div as string)!
			);
			link.parentElement!.after(container);
			info.remove();
		}
	} catch {
		info.remove();
	}
}

function init(): void {
	select.all('.js-comment-body p a:only-child')
		.filter(item => isGist(item) && isOnlyChild(item))
		.forEach(embedGist);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
